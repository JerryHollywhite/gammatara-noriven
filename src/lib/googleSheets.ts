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
        image: row[4] || `https://ui-avatars.com/api/?name=${encodeURIComponent(row[0])}&background=random`
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
