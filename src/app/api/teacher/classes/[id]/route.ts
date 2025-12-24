import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

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

        if (!id) {
            return NextResponse.json({ error: "Class ID required" }, { status: 400 });
        }

        // Verify ownership (optional but good practice)
        // For simplicity, assuming if you are a teacher, you can delete if you own it.
        // Or if admin, can delete anything.

        const classGroup = await prisma.classGroup.findUnique({
            where: { id: id }
        });

        if (!classGroup) {
            return NextResponse.json({ error: "Class not found" }, { status: 404 });
        }

        // Check ownership if Teacher
        if (session.user.role === "TEACHER") {
            const teacherProfile = await prisma.teacherProfile.findUnique({
                where: { userId: session.user.id }
            });

            if (!teacherProfile || teacherProfile.id !== classGroup.teacherId) {
                return NextResponse.json({ error: "Unauthorized to delete this class" }, { status: 403 });
            }
        }

        // Active students check? Maybe prevent delete if students are active? 
        // For now, allow delete (cascade is not set in schema for students, but enrollments link to class).
        // Check schema: 
        // model Enrollment { ... class ClassGroup? @relation(fields: [classId], references: [id]) ... }
        // If we delete class, enrollments might need handling. 
        // Prisma usually requires onDelete Action or manual cleanup if not Cascade in DB.
        // Let's check schema for ClassGroup -> Enrollment relation. 
        // It says: students Enrollment[]
        // Without onDelete: Cascade, this might fail if enrollments exist.
        // Let's manually delete enrollments first to be safe.

        await prisma.enrollment.deleteMany({
            where: { classId: id }
        });

        // Delete Live Classes associated?
        await prisma.liveClass.deleteMany({
            where: { classId: id }
        });

        await prisma.classGroup.delete({
            where: { id: id }
        });

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Delete Class Error:", error);
        return NextResponse.json({ error: "Internal Server Error: " + error.message }, { status: 500 });
    }
}
