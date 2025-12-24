import { google } from "googleapis";
import { QuizQuestion } from "@/types/tara";

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID_LMS || "";

const SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
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

async function fetchSheetData<T>(range: string, mapper: (row: string[]) => T): Promise<T[]> {
    if (!SPREADSHEET_ID) {
        console.warn("GOOGLE_SHEET_ID_LMS is not set. Returning empty data.");
        return [];
    }

    try {
        const sheets = await getSheets();
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range,
        });

        const rows = response.data.values;
        if (!rows || rows.length === 0) return [];

        return rows.map(mapper);
    } catch (error) {
        console.error(`Error fetching sheet range ${range}:`, error);
        return [];
    }
}

// --- Mapper ---

const mapQuizQuestion = (row: string[]): QuizQuestion => {
    // Expected Columns:
    // 0: ID (Q_001)
    // 1: LessonID (L_001)
    // 2: Question (What is 2+2?)
    // 3: OptionA
    // 4: OptionB
    // 5: OptionC
    // 6: OptionD
    // 7: CorrectAnswer (A)
    // 8: Type (MCQ)

    const type = (row[8]?.toUpperCase() === "TRUE_FALSE" ? "TRUE_FALSE" : "MCQ") as 'MCQ' | 'TRUE_FALSE';

    return {
        id: row[0],
        lessonId: row[1],
        questionText: row[2],
        options: {
            A: row[3],
            B: row[4],
            C: row[5],
            D: row[6]
        },
        correctAnswer: row[7]?.toUpperCase() || "A",
        questionType: type
    };
};

// --- Public API ---

export async function getQuizByLessonId(lessonId: string): Promise<QuizQuestion[]> {
    const allQuestions = await fetchSheetData("Content_Quizzes!A2:I", mapQuizQuestion);
    return allQuestions.filter(q => q.lessonId === lessonId);
}

export async function getAllQuizLessonIds(): Promise<string[]> {
    // Only fetch LessonID column (Column B)
    const rows = await fetchSheetData("Content_Quizzes!B2:B", (row) => row[0]); // row[0] because range is single column
    // Filter empty and get unique
    const unique = Array.from(new Set(rows.filter(id => id)));
    return unique;
}
