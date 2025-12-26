import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { google } from "googleapis";
import { Readable } from "stream";

// Helper to stream buffer to Google Drive
async function uploadToDrive(buffer: Buffer, originalFilename: string, mimeType: string, folderId: string) {
    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: process.env.GOOGLE_CLIENT_EMAIL || process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/drive.file'],
    });

    const drive = google.drive({ version: 'v3', auth });

    const fileMetadata = {
        name: originalFilename,
        parents: [folderId],
    };

    const media = {
        mimeType: mimeType,
        body: Readable.from(buffer),
    };

    const file = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, webViewLink, webContentLink',
    });

    return file.data;
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB Limit for Avatar
            return NextResponse.json({ error: "File too large (Max 5MB)" }, { status: 400 });
        }

        // Use a specific folder for Avatars, or root if not defined.
        const folderId = process.env.DRIVE_AVATAR_FOLDER_ID || process.env.DRIVE_ROOT_FOLDER_ID;

        if (!folderId) {
            console.error("Missing Env: DRIVE_AVATAR_FOLDER_ID");
            return NextResponse.json({
                error: "Server Configuration Error: Missing Drive Folder ID. Please configure DRIVE_AVATAR_FOLDER_ID in Vercel."
            }, { status: 500 });
        }

        const client_email = process.env.GOOGLE_CLIENT_EMAIL || process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
        const private_key = process.env.GOOGLE_PRIVATE_KEY;

        if (!client_email || !private_key) {
            console.error("Missing Env: Google Creds");
            return NextResponse.json({
                error: "Server Configuration Error: Missing Google Credentials."
            }, { status: 500 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        // Unique filename: avatar_userId_timestamp
        const uniqueFilename = `avatar_${session.user.id}_${Date.now()}`;

        const driveFile = await uploadToDrive(buffer, uniqueFilename, file.type, folderId);

        // Construct a direct viewable link if possible, or use webContentLink
        // NOTE: Google Drive images can be tricky to display directly without public access.
        // Assuming we rely on next/image or standard img tag, we might need a proxy or public permisson.
        // For this MVP, we store the webViewLink (which opens in Drive) 
        // OR better, we try to use the thumbnailLink if available or a proxy route.
        // Ideally we need to set permissions to 'reader' -> 'anyone' if we want public URL.

        // Let's set public permission for the avatar
        // This is optional but often required for direct <img> src usage
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_CLIENT_EMAIL || process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            },
            scopes: ['https://www.googleapis.com/auth/drive'],
        });
        const drive = google.drive({ version: 'v3', auth });

        if (driveFile.id) {
            await drive.permissions.create({
                fileId: driveFile.id,
                requestBody: {
                    role: 'reader',
                    type: 'anyone',
                },
            });
        }

        // Construct the usable URL
        // Using "thumbnailLink" often works better for direct embedding if we fetch fields, 
        // but "webContentLink" forces download. 
        // A common trick for Drive images is: https://lh3.googleusercontent.com/d/[FILE_ID]
        const publicUrl = `https://lh3.googleusercontent.com/d/${driveFile.id}`;

        // Update User Profile
        await prisma.user.update({
            where: { id: session.user.id },
            data: { image: publicUrl }
        });

        return NextResponse.json({ success: true, url: publicUrl });

    } catch (error: any) {
        console.error("Avatar Upload Error:", error);
        // Expose the specific error message for debugging
        return NextResponse.json({
            error: error.message || "Internal Server Error",
            details: error.response?.data || "No additional details"
        }, { status: 500 });
    }
}
