import { google } from 'googleapis';
import { Teacher } from '@/components/sections/HallOfFame';
import { ScheduleItem } from '@/components/sections/SchedulesSection';

// SCOPES for reading Sheets
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];

export async function getSheetData(range: string) {
    try {
        if (!process.env.GOOGLE_SHEETS_PRIVATE_KEY || !process.env.GOOGLE_SHEETS_CLIENT_EMAIL) {
            console.warn("Google Sheets credentials missing. Returning empty.");
            return null;
        }

        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
                private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n'),
            },
            scopes: SCOPES,
        });

        const sheets = google.sheets({ version: 'v4', auth });

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range,
        });

        return response.data.values;

    } catch (error) {
        console.error('Error fetching sheet data:', error);
        return null;
    }
}

/**
 * Helper to convert Google Drive share links to direct image sources.
 * Handles:
 * - https://drive.google.com/file/d/FILE_ID/view...
 * - https://drive.google.com/open?id=FILE_ID
 */
function formatGoogleDriveUrl(url: string | undefined): string | undefined {
    if (!url) return undefined;

    try {
        // If it's already a direct link or other hosting, return as is
        if (!url.includes('drive.google.com')) return url;

        let fileId = '';

        // Pattern 1: /file/d/FILE_ID/view
        const match1 = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        if (match1 && match1[1]) {
            fileId = match1[1];
        }
        // Pattern 2: id=FILE_ID
        else {
            const match2 = url.match(/id=([a-zA-Z0-9_-]+)/);
            if (match2 && match2[1]) {
                fileId = match2[1];
            }
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
    const data = await getSheetData('Teachers!A2:E');

    // Return empty array if no data (page will use fallback if truly empty array returned, 
    // but better to return null if we want explicit fallback logic, for now we let component handle empty)
    if (!data) return [];

    return data.map((row) => ({
        name: row[0] || "Unknown",
        role: row[1] || "Tutor",
        education: row[2] || "Degree",
        accolades: row[3] ? row[3].split(',').map((s: string) => s.trim()) : [],
        // Use the helper to process column E (Image URL)
        image: formatGoogleDriveUrl(row[4]) || `https://ui-avatars.com/api/?name=${encodeURIComponent(row[0])}&background=random`
    }));
}

export async function getSchedules(): Promise<ScheduleItem[]> {
    const data = await getSheetData('Schedules!A2:E');

    if (!data) return [];

    return data.map((row) => ({
        course: row[0] || "Upcoming Available Class",
        day: row[1] || "TBA",
        time: row[2] || "TBA",
        location: row[3] || "Gamma Tara",
        status: (row[4] as any) || "Available",
    }));
}
