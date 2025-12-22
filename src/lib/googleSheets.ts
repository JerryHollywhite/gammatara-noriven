import Papa from 'papaparse';
import { ScheduleItem } from '@/components/sections/SchedulesSection';

export interface Teacher {
    name: string;
    shortName: string;
    role: string;
    subjects: string;
    education: string;
    experience: string[];
    achievements: string[];
    image: string;
}

export interface Testimonial {
    name: string;
    role: string;
    quote: string;
    photo: string;
}

// DATA SOURCE LINKS
// Note: If you see Teacher names in the Schedules section, it means these two links are identical.
// You need to generate a specific link for the "Schedules" tab using File > Share > Publish to Web > Schedules > CSV.
const TEACHERS_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQqqvzypykY7PGqqOGqhXIGyU-HwzbTaxtKZC4hyrW_LWGwL42YNC7aNx-Ullc_YTuHtEKVxvZkdY-O/pub?gid=0&single=true&output=csv";
const SCHEDULES_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQqqvzypykY7PGqqOGqhXIGyU-HwzbTaxtKZC4hyrW_LWGwL42YNC7aNx-Ullc_YTuHtEKVxvZkdY-O/pub?gid=1804855&single=true&output=csv";
const TESTIMONIALS_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQqqvzypykY7PGqqOGqhXIGyU-HwzbTaxtKZC4hyrW_LWGwL42YNC7aNx-Ullc_YTuHtEKVxvZkdY-O/pub?gid=1776102288&single=true&output=csv";
const GALLERY_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQqqvzypykY7PGqqOGqhXIGyU-HwzbTaxtKZC4hyrW_LWGwL42YNC7aNx-Ullc_YTuHtEKVxvZkdY-O/pub?gid=159415718&single=true&output=csv";

export interface GalleryItem {
    category: string;
    imageUrl: string;
    caption: string;
}

/**
 * Fetch and parse CSV data from a published Google Sheet
 */
export async function getSheetData(url: string) {
    try {
        if (!url) return null;

        const response = await fetch(url, { next: { revalidate: 60 } }); // ISR: Cache for 60s
        if (!response.ok) {
            console.error(`Failed to fetch CSV: ${response.statusText}`);
            return null;
        }
        const csvText = await response.text();

        const { data } = Papa.parse(csvText, {
            header: false,
            skipEmptyLines: true,
        });

        // Remove the header row (index 0) if it exists
        if (data && data.length > 0) {
            data.shift();
        }

        return data as string[][];

    } catch (error) {
        console.error('Error fetching sheet data:', error);
        return null;
    }
}

function formatGoogleDriveUrl(url: string | undefined): string | undefined {
    if (!url) return undefined;

    try {
        if (!url.includes('drive.google.com')) return url;

        let fileId = '';
        const match1 = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        if (match1 && match1[1]) fileId = match1[1];
        else {
            const match2 = url.match(/id=([a-zA-Z0-9_-]+)/);
            if (match2 && match2[1]) fileId = match2[1];
        }

        if (fileId) {
            return `https://drive.google.com/uc?export=view&id=${fileId}`;
        }
        return url;
    } catch (e) {
        return url;
    }
}

export async function getTeachers(lang: 'id' | 'en' | 'cn' = 'id'): Promise<Teacher[]> {
    const data = await getSheetData(TEACHERS_SHEET_URL);

    if (!data) return [];

    // Columns: Name(0), ShortName(1), Role_ID(2)...
    // Offsets for ID=0, EN=1, CN=2
    const langOffset = lang === 'en' ? 1 : lang === 'cn' ? 2 : 0;

    return data.map((row) => ({
        name: row[0] || "Unknown",
        shortName: row[1] || row[0]?.split(' ')[0] || "Teacher",
        role: row[2 + langOffset] || "Tutor",
        subjects: row[5 + langOffset] || "General Subjects",
        education: row[8 + langOffset] || "Degree",
        experience: row[11 + langOffset] ? row[11 + langOffset].split(';').map((s: string) => s.trim()).filter(s => s) : [],
        achievements: row[14 + langOffset] ? row[14 + langOffset].split(';').map((s: string) => s.trim()).filter(s => s) : [],
        image: formatGoogleDriveUrl(row[17]) || `https://ui-avatars.com/api/?name=${encodeURIComponent(row[0])}&background=random`
    }));
}

export async function getTestimonials(lang: 'id' | 'en' | 'cn' = 'id'): Promise<Testimonial[]> {
    const data = await getSheetData(TESTIMONIALS_SHEET_URL);

    if (!data) return [];

    // CSV: Name(0), Role(1), Quote_ID(2), Quote_EN(3), Quote_CN(4), Photo(5)
    // Quote Index: ID=2, EN=3, CN=4
    const quoteIndex = lang === 'en' ? 3 : lang === 'cn' ? 4 : 2;

    return data.map((row) => ({
        name: row[0] || "Student",
        role: row[1] || "Alumni",
        quote: row[quoteIndex] || row[2] || "Saya sangat senang belajar di sini.", // Fallback to ID
        photo: formatGoogleDriveUrl(row[5]) || `https://ui-avatars.com/api/?name=${encodeURIComponent(row[0] || "Student")}&background=random`
    }));
}

export async function getSchedules(lang: 'id' | 'en' | 'cn' = 'id'): Promise<ScheduleItem[]> {
    const data = await getSheetData(SCHEDULES_SHEET_URL);

    if (!data) return [];

    // CSV: Course_ID(0), Course_EN(1), Course_CN(2), Day_ID(3), Day_EN(4), Day_CN(5), Time(6), Location(7), Status_ID(8), Status_EN(9), Status_CN(10)
    const langOffset = lang === 'en' ? 1 : lang === 'cn' ? 2 : 0;

    return data.map((row) => ({
        course: row[0 + langOffset] || "Available Class",
        day: row[3 + langOffset] || "Sorted Day",
        time: row[6] || "Time",
        location: row[7] || "Location",
        status: (row[8 + langOffset] as any) || "Available",
    }));
}

export async function getGalleryImages(category?: string, lang: 'id' | 'en' | 'cn' = 'id'): Promise<GalleryItem[]> {
    if (!GALLERY_SHEET_URL) return [];

    const data = await getSheetData(GALLERY_SHEET_URL);

    if (!data) return [];

    // CSV: Category(0), Image(1), Caption_ID(2), Caption_EN(3), Caption_CN(4)
    const captionIndex = lang === 'en' ? 3 : lang === 'cn' ? 4 : 2;

    return data
        .map((row) => ({
            category: row[0] || "",
            imageUrl: formatGoogleDriveUrl(row[1]) || "",
            caption: row[captionIndex] || row[2] || ""
        }))
        .filter((item) => {
            const isValid = !!item.imageUrl;
            if (category) {
                return isValid && item.category.toLowerCase() === category.toLowerCase();
            }
            const isReserved = item.category.startsWith("Hero_") || item.category.startsWith("Card_") || item.category === "Promo";
            return isValid && !isReserved;
        });
}

export async function getSiteImages(): Promise<Record<string, string>> {
    if (!GALLERY_SHEET_URL) return {};

    const data = await getSheetData(GALLERY_SHEET_URL);

    if (!data) return {};

    const imageMap: Record<string, string> = {};

    data.forEach((row) => {
        const key = row[0] ? row[0].trim() : "";
        const url = formatGoogleDriveUrl(row[1]);

        // Only set if key exists and hasn't been set (first match wins) AND url is valid
        if (key && url && !imageMap[key]) {
            imageMap[key] = url;
        }
    });

    return imageMap;
}

// Placeholder - User needs to update this GID
const SITE_CONTENT_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQqqvzypykY7PGqqOGqhXIGyU-HwzbTaxtKZC4hyrW_LWGwL42YNC7aNx-Ullc_YTuHtEKVxvZkdY-O/pub?gid=532554259&single=true&output=csv"; // Defaulting to 0, user must update

export async function getSiteContent(lang: 'id' | 'en' | 'cn' = 'id'): Promise<Record<string, string>> {
    // If user hasn't set up the new tab yet, return empty to fallback to default text
    try {
        const data = await getSheetData(SITE_CONTENT_SHEET_URL);
        if (!data) return {};

        const contentMap: Record<string, string> = {};

        // Determine column index based on language (Key is col 0)
        // ID = col 1, EN = col 2, CN = col 3
        const langIndex = lang === 'en' ? 2 : lang === 'cn' ? 3 : 1;

        data.forEach((row) => {
            const key = row[0] ? row[0].trim() : "";
            // Ensure the row has enough columns, fallback to ID (col 1) or empty
            const content = row[langIndex] ? row[langIndex].trim() : (row[1] || "");

            if (key) {
                contentMap[key] = content;
            }
        });
        return contentMap;
    } catch (error) {
        console.warn("Failed to fetch site content, using defaults");
        return {};
    }
}
