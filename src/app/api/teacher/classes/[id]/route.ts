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
                program: { select: { id: true, name: true } },
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
        // Normalize student list (Deduplicate because students have multiple enrollments per subject)
        const enrolledStudentIds = Array.from(new Set(
            classGroup.students.map(enrollment => enrollment.student.user.id)
        ));

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
                    orderBy: { order: 'asc' },
                    include: { attachments: true }
                }
            }
        });

        // Sort lessons alphanumerically by title (Natural Sort) to fix "1, 10, 2" issue
        associatedSubjects.forEach(sub => {
            if (sub.lessons && Array.isArray(sub.lessons)) {
                sub.lessons.sort((a, b) => {
                    return a.title.localeCompare(b.title, undefined, { numeric: true, sensitivity: 'base' });
                });
            }
        });

        return NextResponse.json({
            success: true,
            class: {
                id: classGroup.id,
                name: classGroup.name,
                studentIds: enrolledStudentIds,
                subjects: associatedSubjects,
                programId: classGroup.programId,
                program: classGroup.program
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
    const body = await req.json();
    const { name, studentIds, subjectIds, programId } = body;

    try {
        // Validation: Check if name is taken by another class (if name changed)
        // ... omitted for brevity but recommended

        // Update Name & Program
        await prisma.classGroup.update({
            where: { id },
            data: {
                name,
                programId: programId || null
            }
        });

        // Resolve Subject Data to ensure we have IDs
        let targetSubjects: { id: string; code: string; }[] = [];
        if (Array.isArray(subjectIds) && subjectIds.length > 0) {
            const fetchedSubjects = await prisma.subject.findMany({
                where: { id: { in: subjectIds } }
            });
            targetSubjects = fetchedSubjects.map(s => ({ id: s.id, code: s.code }));
        }

        // Add New Students (No removal for safety yet)
        const currentEnrollments = await prisma.enrollment.findMany({
            where: { classId: id },
            include: { student: { include: { user: true } } }
        });

        // 1. Handle New Students
        const currentIds = Array.from(new Set(currentEnrollments.map(e => e.student.user.id)));
        const toAddStudentIds = studentIds.filter((sid: string) => !currentIds.includes(sid));

        // Get ALL student Profile IDs in this class (both existing and new)
        const allStudentProfileIds: string[] = [];

        // Add new students to class (General enrollment)
        for (const sid of toAddStudentIds) {
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
                allStudentProfileIds.push(studentProfile.id);
            }
        }

        // Add existing students to list
        currentEnrollments.forEach(e => {
            if (!allStudentProfileIds.includes(e.studentId)) {
                allStudentProfileIds.push(e.studentId);
            }
        });

        // 2. Sync Subjects (Create enrollments for selected subjects if missing)
        if (targetSubjects.length > 0 && allStudentProfileIds.length > 0) {
            for (const spId of allStudentProfileIds) {
                for (const sub of targetSubjects) {
                    // Check if enrollment exists
                    const exists = await prisma.enrollment.findFirst({
                        where: {
                            classId: id,
                            studentId: spId,
                            subjectId: sub.id
                        }
                    });

                    if (!exists) {
                        await prisma.enrollment.create({
                            data: {
                                classId: id,
                                studentId: spId,
                                status: 'ACTIVE',
                                subjectId: sub.id,
                                courseId: sub.code
                            }
                        });
                    }
                }
            }
        }

        return NextResponse.json({ success: true });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
