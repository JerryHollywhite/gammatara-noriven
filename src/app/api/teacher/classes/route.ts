import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

// Create a Class
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "TEACHER") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, studentIds } = body;

    console.log("Creating class:", { name, studentCount: studentIds?.length, teacherId: session.user.id });

    if (!name || !Array.isArray(studentIds)) {
        return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    try {
        // Create Class Group
        let teacherProfile = await prisma.teacherProfile.findUnique({
            where: { userId: session.user.id }
        });

        if (!teacherProfile) {
            console.log("Teacher profile missing, attempting creation...");
            const user = await prisma.user.findUnique({ where: { id: session.user.id } });
            if (user) {
                teacherProfile = await prisma.teacherProfile.create({
                    data: { userId: user.id }
                });
            } else {
                return NextResponse.json({ error: "User record not found" }, { status: 404 });
            }
        }

        if (!teacherProfile) {
            return NextResponse.json({ error: "Failed to resolve Teacher Profile" }, { status: 500 });
        }

        // Check availability of class name
        const existingClass = await prisma.classGroup.findFirst({
            where: {
                name: { equals: name, mode: 'insensitive' },
                teacherId: teacherProfile.id
            }
        });

        if (existingClass) {
            return NextResponse.json({ error: "Class name already exists. Please choose a different name." }, { status: 400 });
        }

        const newClass = await prisma.classGroup.create({
            data: {
                name,
                teacherId: teacherProfile.id,
                programId: body.programId || null, // Optional Program Link
            }
        });

        // Resolve Subject Data
        let targetSubjects: { id: string; code: string; }[] = [];

        if (Array.isArray(body.subjectIds) && body.subjectIds.length > 0) {
            // New Multi-Subject Support
            const fetchedSubjects = await prisma.subject.findMany({
                where: { id: { in: body.subjectIds } }
            });
            targetSubjects = fetchedSubjects.map(s => ({ id: s.id, code: s.code }));
        } else if (body.subjectId) {
            // Backward Compatibility
            const subject = await prisma.subject.findUnique({
                where: { id: body.subjectId }
            });
            if (subject) {
                targetSubjects.push({ id: subject.id, code: subject.code });
            }
        }

        // Default if no subject selected
        if (targetSubjects.length === 0) {
            targetSubjects.push({ id: null as any, code: 'GENERAL' });
        }

        console.log("Creating class:", newClass.id, "Subjects:", targetSubjects.length);

        for (const studentId of studentIds) {
            const studentProfile = await prisma.studentProfile.findUnique({
                where: { userId: studentId }
            });

            if (studentProfile) {
                // Create an enrollment per subject
                for (const sub of targetSubjects) {
                    await prisma.enrollment.create({
                        data: {
                            studentId: studentProfile.id,
                            classId: newClass.id,
                            status: 'ACTIVE',
                            subjectId: sub.id || null,
                            courseId: sub.code
                        }
                    });
                }
            } else {
                console.warn(`Student profile not found for user ${studentId}`);
            }
        }

        return NextResponse.json({ success: true, class: newClass });

    } catch (error: any) {
        console.error("Create Class Error:", error);
        return NextResponse.json({ error: "Internal Server Error: " + error.message, details: error }, { status: 500 });
    }
}

// Get All Students (for selection)
export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const students = await prisma.user.findMany({
            where: { role: 'STUDENT' },
            select: { id: true, name: true, email: true }
        });

        return NextResponse.json({ success: true, students });
    } catch (e) {
        return NextResponse.json({ error: "Error fetching students" }, { status: 500 });
    }
}
