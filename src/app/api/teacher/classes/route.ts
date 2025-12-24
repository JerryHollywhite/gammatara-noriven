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
            }
        });

        console.log("Class created:", newClass.id);

        for (const studentId of studentIds) {
            const studentProfile = await prisma.studentProfile.findUnique({
                where: { userId: studentId }
            });

            if (studentProfile) {
                await prisma.enrollment.create({
                    data: {
                        studentId: studentProfile.id,
                        classId: newClass.id,
                        status: 'ACTIVE',
                        courseId: 'GENERAL' // Explicitly provide legacy ID to satisfy Prisma check
                    }
                });
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
