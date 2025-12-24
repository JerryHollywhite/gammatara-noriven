import { google } from "googleapis";
import { Program, Subject, Lesson, QuizQuestion } from "@/types/tara";
import { prisma } from "@/lib/prisma"; // Ensure this exists

const SCOPES = [
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

const getDrive = async () => {
    const auth = await getAuth();
    return google.drive({ version: "v3", auth });
};

// --- Public API (Now backed by Prisma) ---

export async function getPrograms(): Promise<Program[]> {
    try {
        const programs = await prisma.program.findMany({
            where: { active: true },
            orderBy: { createdAt: 'asc' } // or code
        });
        return programs.map(p => ({
            id: p.code, // Map 'code' to 'id' for frontend compatibility if it expects "TK", "SD" etc.
            name: p.name,
            description: p.description || "",
            active: p.active
        }));
    } catch (e) {
        console.error("Error fetching programs:", e);
        return [];
    }
}

export async function getSubjects(programId?: string): Promise<Subject[]> {
    try {
        const where: any = { active: true };
        if (programId) {
            // We need to resolve program code to ID if programId passed is "TK" (code)
            const program = await prisma.program.findUnique({ where: { code: programId } });
            if (program) {
                where.programId = program.id;
            } else {
                return []; // Program not found
            }
        }

        const subjects = await prisma.subject.findMany({
            where,
            orderBy: { name: 'asc' }
        });

        // Need to fetch program code for each subject to map back to "programId" (which was code in FE)
        // Or simpler: include program relation
        // Let's refetch with include if needed, or assum programId passed is what we want.
        // Actually the FE `Subject` type likely expects `programId` as string.
        // Let's fetch the program code.
        const subjectsWithProgram = await prisma.subject.findMany({
            where,
            include: { program: true },
            orderBy: { name: 'asc' }
        });

        return subjectsWithProgram.map(s => ({
            id: s.code, // Use code as ID for now
            programId: s.program.code,
            name: s.name,
            description: s.description || "",
            imageUrl: "" // Placeholder
        }));
    } catch (e) {
        console.error("Error fetching subjects:", e);
        return [];
    }
}

export async function getLessons(subjectId: string): Promise<Lesson[]> {
    try {
        // subjectId passed from FE might be CODE (e.g. "MATH_SD_1")
        const subject = await prisma.subject.findUnique({ where: { code: subjectId } });
        if (!subject) return [];

        const lessons = await prisma.lesson.findMany({
            where: {
                subjectId: subject.id,
                active: true
            },
            orderBy: { order: 'asc' }
        });

        return lessons.map(l => ({
            id: l.id,
            subjectId: subject.code,
            title: l.title,
            description: l.description || "",
            videoDriveId: l.videoUrl || "", // We store URL or ID? prompt said "video link youtube". 
            // The FE expects `videoDriveId` likely for Google Drive video.
            // If we switch to YouTube, we should probably update FE to handle `videoUrl`.
            // For now mapping `videoUrl` to `videoDriveId`.
            pdfDriveId: l.fileUrl || "",
            order: l.order
        }));
    } catch (e) {
        console.error("Error fetching lessons:", e);
        return [];
    }
}

// --- WRITE OPS ---

export async function addLesson(lesson: Lesson): Promise<boolean> {
    try {
        // lesson.subjectId is likely a CODE
        const subject = await prisma.subject.findUnique({ where: { code: lesson.subjectId } });
        if (!subject) return false;

        await prisma.lesson.create({
            data: {
                title: lesson.title,
                description: lesson.description,
                subjectId: subject.id,
                videoUrl: lesson.videoDriveId,
                fileUrl: lesson.pdfDriveId,
                order: lesson.order,
                active: true
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
