import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { deleteFileFromDrive } from "@/lib/drive-upload";

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

        // 1. Get Attachment
        const attachment = await prisma.lessonAttachment.findUnique({
            where: { id }
        });

        if (!attachment) {
            return NextResponse.json({ error: "Attachment not found" }, { status: 404 });
        }

        // 2. Delete from Drive
        // url field stores the Drive ID or a full link.
        // Assuming it typically stores the ID for Drive files. 
        // If it's a URL, we might need to extract ID. 
        // Based on upload logic: `url: uploadJson.file.id` -> It is the ID.
        if (attachment.url) {
            await deleteFileFromDrive(attachment.url);
        }

        // 3. Delete from DB
        await prisma.lessonAttachment.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Delete Attachment Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
