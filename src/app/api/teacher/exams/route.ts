import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "TEACHER") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { title, description, subjectId, durationMinutes, passingGrade, questions } = body;

        // Validation
        if (!title || !subjectId || !questions || !Array.isArray(questions)) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Create the Exam and Questions transactionally
        const exam = await prisma.exam.create({
            data: {
                title,
                description,
                subjectId, // Ensure teacher teaches this? (Skipping for now)
                durationMinutes: Number(durationMinutes) || 60,
                passingGrade: Number(passingGrade) || 75,
                examQuestions: {
                    create: questions.map((q: any) => ({
                        questionText: q.questionText,
                        type: q.type || 'MCQ',
                        options: q.options, // JSON array
                        correctAnswer: q.correctAnswer,
                        points: q.points || 1
                    }))
                }
            },
            include: { examQuestions: true }
        });

        return NextResponse.json({ success: true, exam });

    } catch (error) {
        console.error("Create Exams Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get('subjectId');

    if (!subjectId) {
        return NextResponse.json({ error: "Subject ID required" }, { status: 400 });
    }

    try {
        const exams = await prisma.exam.findMany({
            where: { subjectId },
            include: {
                _count: { select: { examQuestions: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ success: true, exams });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
