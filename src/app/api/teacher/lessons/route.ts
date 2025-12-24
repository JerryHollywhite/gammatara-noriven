import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        // body: { title, description, subjectId (code), videoUrl, fileUrl, order }

        const { title, description, subjectId, videoUrl, fileUrl, order } = body;

        // Resolve subject code to ID
        const subject = await prisma.subject.findUnique({
            where: { code: subjectId }
        });

        if (!subject) {
            return NextResponse.json({ error: "Invalid Subject Code" }, { status: 400 });
        }

        const newLesson = await prisma.lesson.create({
            data: {
                title,
                description,
                subjectId: subject.id,
                videoUrl, // Expecting YouTube URL
                fileUrl,  // Expecting Drive Link
                order: order || 0,
                active: true
            }
        });

        return NextResponse.json({ success: true, lesson: newLesson });

    } catch (error) {
        console.error("Create lesson error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const subjectCode = searchParams.get("subjectId");

    if (!subjectCode) {
        return NextResponse.json({ error: "Subject ID required" }, { status: 400 });
    }

    try {
        const subject = await prisma.subject.findUnique({
            where: { code: subjectCode }
        });

        if (!subject) return NextResponse.json({ lessons: [] });

        const lessons = await prisma.lesson.findMany({
            where: { subjectId: subject.id, active: true },
            orderBy: { order: 'asc' }
        });

        return NextResponse.json({ success: true, lessons });
    } catch (error) {
        console.error("Fetch lessons error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
