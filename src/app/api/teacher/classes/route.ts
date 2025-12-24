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

    const { name, studentIds } = await req.json(); // studentIds array

    try {
        // Create Class Group
        const teacherProfile = await prisma.teacherProfile.findUnique({
            where: { userId: session.user.id }
        });

        if (!teacherProfile) {
            const user = await prisma.user.findUnique({ where: { id: session.user.id } });
            // Auto create profile if missing (resilience)
            if (user) {
                await prisma.teacherProfile.create({
                    data: { userId: user.id }
                });
            } else {
                return NextResponse.json({ error: "Teacher Profile not found" }, { status: 404 });
            }
        }

        // Re-fetch or use known ID
        const finalProfile = await prisma.teacherProfile.findUnique({ where: { userId: session.user.id } });

        const newClass = await prisma.classGroup.create({
            data: {
                name,
                teacherId: finalProfile!.id,
            }
        });

        for (const studentId of studentIds) {
            const studentProfile = await prisma.studentProfile.findUnique({
                where: { userId: studentId }
            });

            if (studentProfile) {
                await prisma.enrollment.create({
                    data: {
                        studentId: studentProfile.id,
                        classId: newClass.id,
                        status: 'ACTIVE'
                    }
                });
            }
        }

        return NextResponse.json({ success: true, class: newClass });

    } catch (error) {
        console.error("Create Class Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
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
