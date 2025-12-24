import { google } from "googleapis";
import { Program, Subject, Lesson, QuizQuestion } from "@/types/tara";

// TODO: Replace with actual ID from User
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID_LMS || "";

const SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets", // Read/Write
    "https://www.googleapis.com/auth/drive.readonly" // Read Drive Files
];

const getAuth = async () => {
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (!email || !key) throw new Error("Missing Google Service Account credentials");

    const auth = new google.auth.JWT({
        email,
        key,
        scopes: SCOPES,
    });
    return auth;
};

const getSheets = async () => {
    const auth = await getAuth();
    return google.sheets({ version: "v4", auth });
};

const getDrive = async () => {
    const auth = await getAuth();
    return google.drive({ version: "v3", auth });
};

/**
 * Fetches raw data from a specific tab and maps it to a generic type provided by the mapper function.
 */
async function fetchSheetData<T>(range: string, mapper: (row: string[]) => T): Promise<T[]> {
    if (!SPREADSHEET_ID) {
        console.warn("GOOGLE_SHEET_ID_LMS is not set. Returning empty data.");
        return [];
    }

    try {
        const sheets = await getSheets();
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range, // e.g. "Config_Programs!A2:D"
        });

        const rows = response.data.values;
        if (!rows || rows.length === 0) return [];

        return rows.map(mapper);
    } catch (error) {
        console.error(`Error fetching sheet range ${range}:`, error);
        return [];
    }
}

// --- Mappers ---

const mapProgram = (row: string[]): Program => ({
    id: row[0],
    name: row[1],
    description: row[2],
    active: row[3]?.toUpperCase() === "TRUE"
});

const mapSubject = (row: string[]): Subject => ({
    id: row[0],
    programId: row[1],
    name: row[2],
    description: row[3],
    imageUrl: row[4]
});

const mapLesson = (row: string[]): Lesson => ({
    id: row[0],
    subjectId: row[1],
    title: row[2],
    description: row[3],
    videoDriveId: row[4],
    pdfDriveId: row[5],
    order: parseInt(row[6] || "0", 10)
});

// --- Public API ---

export async function getPrograms(): Promise<Program[]> {
    return fetchSheetData("Config_Programs!A2:D", mapProgram);
}

export async function getSubjects(programId?: string): Promise<Subject[]> {
    const all = await fetchSheetData("Config_Subjects!A2:E", mapSubject);
    if (programId) {
        return all.filter(s => s.programId === programId);
    }
    return all;
}

export async function getLessons(subjectId: string): Promise<Lesson[]> {
    const all = await fetchSheetData("Content_Lessons!A2:G", mapLesson);
    // Sort by order
    return all
        .filter(l => l.subjectId === subjectId)
        .sort((a, b) => a.order - b.order);
}

// --- WRITE OPS ---

export async function addLesson(lesson: Lesson): Promise<boolean> {
    if (!SPREADSHEET_ID) return false;
    try {
        const sheets = await getSheets();

        // Map lesson object to row array [ID, SubjectID, Title, Desc, VideoID, PDFID, Order]
        const row = [
            lesson.id,
            lesson.subjectId,
            lesson.title,
            lesson.description || "",
            lesson.videoDriveId || "",
            lesson.pdfDriveId || "",
            lesson.order.toString()
        ];

        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: "Content_Lessons!A:G",
            valueInputOption: "USER_ENTERED",
            requestBody: {
                values: [row]
            }
        });
        return true;
    } catch (error) {
        console.error("Error adding lesson:", error);
        return false;
    }
}

// --- DRIVE OPS ---

export interface DriveFile {
    id: string;
    name: string;
    mimeType: string;
    thumbnailLink?: string;
    webViewLink?: string;
}

export async function listDriveFiles(folderId?: string, query?: string): Promise<DriveFile[]> {
    try {
        const drive = await getDrive();
        let q = "trashed = false";
        // Only valid folders or root

        if (folderId && folderId !== 'root') {
            q += ` and '${folderId}' in parents`;
        }

        if (query) {
            q += ` and name contains '${query}'`;
        }

        // List files shared with the service account
        const res = await drive.files.list({
            q,
            fields: "files(id, name, mimeType, thumbnailLink, webViewLink)",
            pageSize: 30
        });

        return (res.data.files as DriveFile[]) || [];
    } catch (error) {
        console.error("Error listing drive files:", error);
        return [];
    }
}
