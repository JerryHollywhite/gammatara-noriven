import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { deleteFileFromDrive } from "@/lib/drive-upload";

// DELETE Lesson
export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await context.params;

        // Verify ownership (optional but recommended)
        const lesson = await prisma.lesson.findUnique({
            where: { id },
            include: { subject: true }
        });

        if (!lesson) {
            return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
        }

        // Delete (Cascade attachments usually handled by DB, else manual)
        // Check schema for Cascade. If not, delete attachments first.
        // Assuming Prisma default or Cascade. If strict, delete attachments.

        // Delete Cascade: Google Drive Files First
        const attachments = await prisma.lessonAttachment.findMany({
            where: { lessonId: id }
        });

        // Import helper inside function if needed, or stick to top if fixed.
        // Assuming deleteFileFromDrive is imported from @/lib/drive-upload

        // Execute deletions in parallel (or sequential if limiting rate)
        // Parallel is fine for small numbers
        await Promise.all(attachments.map(async (att) => {
            if (att.url) {
                try {
                    // Import dynamically or ensure it's imported at top
                    await deleteFileFromDrive(att.url);
                } catch (e) {
                    console.error(`Failed to delete Drive file ${att.url}:`, e);
                    // Continue even if Drive fails, to ensure DB clean up
                }
            }
        }));

        await prisma.lessonAttachment.deleteMany({
            where: { lessonId: id }
        });

        await prisma.lesson.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Delete Lesson Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// UPDATE Lesson
export async function PUT(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await context.params;
        const body = await req.json();
        const { title, description, videoUrl, attachments } = body;

        console.log(`[PUT Lesson] ID: ${id}`);
        console.log(`[PUT Lesson] Attachments Payload:`, JSON.stringify(attachments));

        // Verify existence
        const lesson = await prisma.lesson.findUnique({ where: { id } });
        if (!lesson) return NextResponse.json({ error: "Lesson not found" }, { status: 404 });

        // Handle Attachments
        // If attachments provided, we might need to sync or append.
        // Strategy: If attachments array is sent, we treat it as the NEW list.
        // But uploading is separate. Usually editing adds new files.
        // Let's assume the UI sends the FINAL desired list of attachments (new + old).

        // However, standard flow: 
        // 1. UI uploads new files -> gets IDs.
        // 2. UI sends list of all attachments to keep.

        // Simplify: Just update fields. Attachments logic is complex if replacing.
        // Let's supporting adding new attachments via logic if needed, 
        // but for now, let's update basic fields.

        // If attachments are sent, we can create them if they don't exist?
        // Actually, the POST created attachments. 
        // If we want to replace, we delete old and create new? Or just add?

        // Let's support updating Title, Description, VideoUrl first.

        // Check if attachments are included in update
        if (attachments && Array.isArray(attachments)) {
            console.log(`[PUT Lesson] Deleting old attachments for lesson ${id}`);
            await prisma.lessonAttachment.deleteMany({ where: { lessonId: id } });

            const attachmentData = attachments.map((att: any) => {
                let type = att.type || 'application/unknown';
                if (att.url && (att.url.includes('youtube.com') || att.url.includes('youtu.be'))) {
                    type = 'video/youtube';
                }
                return {
                    name: att.name,
                    url: att.url,
                    type: type,
                    size: att.size || 0
                };
            });

            console.log(`[PUT Lesson] Creating ${attachmentData.length} new attachments:`, JSON.stringify(attachmentData));

            await prisma.lesson.update({
                where: { id },
                data: {
                    title,
                    description,
                    videoUrl,
                    attachments: {
                        create: attachmentData
                    }
                }
            });
        } else {
            await prisma.lesson.update({
                where: { id },
                data: {
                    title,
                    description,
                    videoUrl
                }
            });
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Update Lesson Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
