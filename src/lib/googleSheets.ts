import Papa from 'papaparse';
import { ScheduleItem } from '@/components/sections/SchedulesSection';

export interface Teacher {
    name: string;
    role: string;
    education: string;
    accolades: string[];
    image: string;
}

// DATA SOURCE LINKS
// Note: If you see Teacher names in the Schedules section, it means these two links are identical.
// You need to generate a specific link for the "Schedules" tab using File > Share > Publish to Web > Schedules > CSV.
const TEACHERS_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQqqvzypykY7PGqqOGqhXIGyU-HwzbTaxtKZC4hyrW_LWGwL42YNC7aNx-Ullc_YTuHtEKVxvZkdY-O/pub?gid=0&single=true&output=csv";
const SCHEDULES_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQqqvzypykY7PGqqOGqhXIGyU-HwzbTaxtKZC4hyrW_LWGwL42YNC7aNx-Ullc_YTuHtEKVxvZkdY-O/pub?gid=1804855&single=true&output=csv";
// Placeholder for the Gallery Sheet URL - User needs to provide this
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

export async function getTeachers(): Promise<Teacher[]> {
    const data = await getSheetData(TEACHERS_SHEET_URL);

    if (!data) return [];

    return data.map((row) => ({
        name: row[0] || "Unknown",
        role: row[1] || "Tutor",
        education: row[2] || "Degree",
        accolades: row[3] ? row[3].split(',').map((s: string) => s.trim()) : [],
        image: formatGoogleDriveUrl(row[4]) || `https://ui-avatars.com/api/?name=${encodeURIComponent(row[0])}&background=random`
    }));
}

export async function getSchedules(): Promise<ScheduleItem[]> {
    const data = await getSheetData(SCHEDULES_SHEET_URL);

    if (!data) return [];

    return data.map((row) => ({
        course: row[0] || "Available Class",
        day: row[1] || "Sorted Day",
        time: row[2] || "Time",
        location: row[3] || "Location",
        status: (row[4] as any) || "Available",
    }));
}

export async function getGalleryImages(category?: string): Promise<GalleryItem[]> {
    if (!GALLERY_SHEET_URL) return [];

    const data = await getSheetData(GALLERY_SHEET_URL);

    if (!data) return [];

    return data
        .map((row) => ({
            category: row[0] || "",
            imageUrl: formatGoogleDriveUrl(row[1]) || "",
            caption: row[2] || ""
        }))
        .filter((item) => {
            const isValid = !!item.imageUrl;
            // If category is provided, filter by it. Otherwise return all valid images that are NOT reserved keys
            if (category) {
                return isValid && item.category.toLowerCase() === category.toLowerCase();
            }
            // Filter out "System/Reserved" keys like Hero_, Card_, Promo if fetching "All" gallery
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

export async function getSiteContent(): Promise<Record<string, string>> {
    // If user hasn't set up the new tab yet, return empty to fallback to default text
    try {
        const data = await getSheetData(SITE_CONTENT_SHEET_URL);
        if (!data) return {};

        const contentMap: Record<string, string> = {};
        data.forEach((row) => {
            const key = row[0] ? row[0].trim() : "";
            const content = row[1] ? row[1].trim() : "";
            if (key && content) {
                contentMap[key] = content;
            }
        });
        return contentMap;
    } catch (error) {
        console.warn("Failed to fetch site content, using defaults");
        return {};
    }
}
