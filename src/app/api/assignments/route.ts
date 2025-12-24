
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "TEACHER") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { title, description, dueDate, courseId } = body;

        if (!title || !courseId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const teacher = await prisma.user.findUnique({
            where: { id: (session.user as any).id },
            include: { teacherProfile: true }
        });

        if (!teacher?.teacherProfile) {
            return NextResponse.json({ error: "Teacher profile not found" }, { status: 404 });
        }

        const assignment = await prisma.assignment.create({
            data: {
                teacherId: teacher.teacherProfile.id,
                title,
                description,
                courseId,
                dueDate: dueDate ? new Date(dueDate) : null
            }
        });

        return NextResponse.json({ success: true, data: assignment });

    } catch (error) {
        console.error("Create Assignment Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

    try {
        const filters: any = {};
        if (courseId) filters.courseId = courseId;

        const assignments = await prisma.assignment.findMany({
            where: filters,
            include: {
                submissions: {
                    where: {
                        student: {
                            userId: (session.user as any).id // Check if this user submitted
                        }
                    }
                }
            },
            orderBy: { dueDate: 'asc' }
        });

        return NextResponse.json({ success: true, data: assignments });
    } catch (error) {
        console.error("Fetch Assignments Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
