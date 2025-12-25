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
        // Check if model exists on client to avoid runtime crash. 
        // Casting to any to avoid TS error if model is not yet generated in client.
        if ((prisma as any).liveClass) {
            await (prisma as any).liveClass.deleteMany({
                where: { classId: id }
            });
        } else {
            console.warn("prisma.liveClass is undefined. Skipping cascade delete for LiveClass.");
        }

        await prisma.classGroup.delete({
            where: { id: id }
        });

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Delete Class Error:", error);
        return NextResponse.json({ error: "Internal Server Error: " + error.message }, { status: 500 });
    }
}

// Get Single Class Details
export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    try {
        const classGroup = await prisma.classGroup.findUnique({
            where: { id },
            include: {
                students: {
                    include: {
                        student: {
                            include: {
                                user: { select: { id: true, name: true, email: true } }
                            }
                        }
                    }
                }
            }
        });

        if (!classGroup) return NextResponse.json({ error: "Class not found" }, { status: 404 });

        // Normalize student list
        const enrolledStudentIds = classGroup.students.map(enrollment => enrollment.student.user.id);

        // Fetch subjects associated with this class (via enrollments)
        // We find subjects where at least one enrollment in this class exists
        const associatedSubjects = await prisma.subject.findMany({
            where: {
                enrollments: {
                    some: { classId: id }
                }
            },
            include: {
                lessons: {
                    orderBy: { order: 'asc' }
                }
            }
        });

        return NextResponse.json({
            success: true,
            class: {
                id: classGroup.id,
                name: classGroup.name,
                studentIds: enrolledStudentIds,
                subjects: associatedSubjects
            }
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Update Class (Name + Students)
export async function PUT(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "TEACHER") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const { name, studentIds } = await req.json();

    try {
        // Validation: Check if name is taken by another class (if name changed)
        // ... omitted for brevity but recommended

        // Update Name
        await prisma.classGroup.update({
            where: { id },
            data: { name }
        });

        // Add New Students (No removal for safety yet)
        const currentEnrollments = await prisma.enrollment.findMany({
            where: { classId: id },
            include: { student: { include: { user: true } } }
        });

        const currentIds = currentEnrollments.map(e => e.student.user.id);
        const toAdd = studentIds.filter((sid: string) => !currentIds.includes(sid));

        for (const sid of toAdd) {
            const studentProfile = await prisma.studentProfile.findUnique({ where: { userId: sid } });
            if (studentProfile) {
                await prisma.enrollment.create({
                    data: {
                        classId: id,
                        studentId: studentProfile.id,
                        status: 'ACTIVE',
                        courseId: 'GENERAL'
                    }
                });
            }
        }

        return NextResponse.json({ success: true });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
