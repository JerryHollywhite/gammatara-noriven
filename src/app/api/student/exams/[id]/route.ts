import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "STUDENT") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    try {
        const exam = await prisma.exam.findUnique({
            where: { id },
            include: { examQuestions: true }
        });

        if (!exam) return NextResponse.json({ error: "Exam not found" }, { status: 404 });
        if (!exam.active) return NextResponse.json({ error: "Exam is closed" }, { status: 403 });

        // Sanitize: Remove correct answers
        const sanitizedQuestions = exam.examQuestions.map(q => ({
            id: q.id,
            questionText: q.questionText,
            type: q.type,
            options: q.options,
            points: q.points
            // NO correctAnswer
        }));

        return NextResponse.json({
            success: true,
            exam: {
                id: exam.id,
                title: exam.title,
                description: exam.description,
                durationMinutes: exam.durationMinutes,
                questions: sanitizedQuestions
            }
        });

    } catch (error) {
        console.error("Fetch Exam Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
