import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
    req: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    try {
        // Option 1: Try Hard Delete
        await prisma.subject.delete({
            where: { id }
        });

        return NextResponse.json({ success: true, message: "Subject deleted permanently" });

    } catch (error: any) {
        // P2003 = Foreign key constraint failed
        // If related data exists, fallback to Soft Delete (Deactivate)
        if (error.code === 'P2003') {
            try {
                await prisma.subject.update({
                    where: { id },
                    data: { active: false }
                });
                return NextResponse.json({ success: true, message: "Subject archived (active=false) due to existing data." });
            } catch (updateError) {
                console.error("Soft Delete Error:", updateError);
                return NextResponse.json({ error: "Failed to delete or archive subject" }, { status: 500 });
            }
        }

        console.error("Delete Subject Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
