import { google } from "googleapis";
import { Readable } from "stream";

// Scopes for detailed Drive Access
const SCOPES = ["https://www.googleapis.com/auth/drive"];

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

// Helper: Convert File/Blob to Stream
function bufferToStream(buffer: Buffer) {
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    return stream;
}

export async function uploadTeacherFile(
    file: File | Blob,
    fileName: string,
    mimeType: string,
    teacherName: string
): Promise<{ id: string; webViewLink: string } | null> {

    // 1. Validation
    // Size check (20MB = 20 * 1024 * 1024 bytes)
    const MAX_SIZE = 20 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
        throw new Error(`File too large. Max size is 20MB. Your file: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
    }

    // Video check
    if (mimeType.startsWith("video/") || mimeType.includes("mp4") || mimeType.includes("mov") || mimeType.includes("avi")) {
        throw new Error("Video uploads are not allowed. Please upload to YouTube and share the link.");
    }

    try {
        const drive = await getDrive();

        // 2. Find or Create "Teacher Uploads" Root Folder
        // We ideally want a constant ID, but for dynamic setup we search.
        let rootFolderId = await findFolder("Teacher Uploads");
        if (!rootFolderId) {
            rootFolderId = await createFolder("Teacher Uploads");
        }

        // 3. Find or Create specific Teacher Folder
        // Sanitize teacher name for folder name
        const safeTeacherName = teacherName.replace(/[^a-zA-Z0-9 ]/g, "").trim() || "Unknown Teacher";
        let teacherFolderId = await findFolder(safeTeacherName, rootFolderId);
        if (!teacherFolderId) {
            teacherFolderId = await createFolder(safeTeacherName, rootFolderId);
        }

        // 4. Upload File
        // Convert File to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const media = {
            mimeType,
            body: bufferToStream(buffer)
        };

        const res = await drive.files.create({
            requestBody: {
                name: fileName,
                parents: [teacherFolderId!],
            },
            media: media,
            fields: "id, webViewLink",
        });

        if (res.data.id && res.data.webViewLink) {
            // Make file readable by anyone with link? Or restricted?
            // Usually LMS files need to be readable by students.
            // Let's grant 'reader' to 'anyone' to ensure access (simplest) vs Service Account only.
            // Given requirement doesn't specify auth, but "Teacher uses Drive".
            // We'll set permission to anyoneWithLink reader.
            await drive.permissions.create({
                fileId: res.data.id,
                requestBody: {
                    role: 'reader',
                    type: 'anyone',
                }
            });

            return {
                id: res.data.id,
                webViewLink: res.data.webViewLink
            };
        }

        return null;

    } catch (error: any) {
        console.error("Error uploading file to Drive:", error);
        throw new Error(error.message || "Drive upload failed");
    }
}

export async function uploadPaymentProof(
    file: File | Blob,
    fileName: string,
    mimeType: string,
    studentName: string
): Promise<{ id: string; webViewLink: string } | null> {

    // 1. Validation
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB limit for receipts
    if (file.size > MAX_SIZE) {
        throw new Error(`File too large. Max size is 5MB for proofs.`);
    }

    try {
        const drive = await getDrive();

        // 2. Find or Create "Payment Proofs" Root Folder
        let rootFolderId = await findFolder("Payment Proofs");
        if (!rootFolderId) {
            rootFolderId = await createFolder("Payment Proofs");
        }

        // 3. Find or Create specific Student Folder? Or just dump in Proofs with name?
        // Let's create a subfolder for the Month? Or Student?
        // Let's categorize by Student Name for organization
        const safeName = studentName.replace(/[^a-zA-Z0-9 ]/g, "").trim() || "Unknown Student";
        let studentFolderId = await findFolder(safeName, rootFolderId);
        if (!studentFolderId) {
            studentFolderId = await createFolder(safeName, rootFolderId);
        }

        // 4. Upload File
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const media = {
            mimeType,
            body: bufferToStream(buffer)
        };

        const res = await drive.files.create({
            requestBody: {
                name: `PROOF_${Date.now()}_${fileName}`,
                parents: [studentFolderId!],
            },
            media: media,
            fields: "id, webViewLink",
        });

        if (res.data.id && res.data.webViewLink) {
            await drive.permissions.create({
                fileId: res.data.id,
                requestBody: {
                    role: 'reader',
                    type: 'anyone',
                }
            });

            return {
                id: res.data.id,
                webViewLink: res.data.webViewLink
            };
        }

        return null;

    } catch (error: any) {
        console.error("Error uploading proof:", error);
        throw new Error(error.message || "Proof upload failed");
    }
}

// --- Internal Helpers ---

async function findFolder(folderName: string, parentId?: string): Promise<string | null> {
    const drive = await getDrive();
    let q = `mimeType = 'application/vnd.google-apps.folder' and name = '${folderName}' and trashed = false`;
    if (parentId) {
        q += ` and '${parentId}' in parents`;
    }

    const res = await drive.files.list({
        q,
        fields: "files(id, name)",
        pageSize: 1
    });

    if (res.data.files && res.data.files.length > 0) {
        return res.data.files[0].id || null;
    }
    return null;
}

async function createFolder(folderName: string, parentId?: string): Promise<string> {
    const drive = await getDrive();
    const fileMetadata: any = {
        name: folderName,
        mimeType: "application/vnd.google-apps.folder",
    };
    if (parentId) {
        fileMetadata.parents = [parentId];
    }

    const res = await drive.files.create({
        requestBody: fileMetadata,
        fields: "id",
    });

    if (!res.data.id) throw new Error("Failed to create folder");
    return res.data.id;
}
