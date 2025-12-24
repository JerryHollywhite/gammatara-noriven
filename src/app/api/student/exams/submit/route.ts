import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "STUDENT") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { examId, answers } = await req.json(); // answers: { [questionId]: "Answer" }

        if (!examId || !answers) {
            return NextResponse.json({ error: "Invalid submission" }, { status: 400 });
        }

        const student = await prisma.studentProfile.findUnique({
            where: { userId: session.user.id }
        });

        if (!student) return NextResponse.json({ error: "Student profile not found" }, { status: 404 });

        // 1. Fetch Exam and Questions
        const exam = await prisma.exam.findUnique({
            where: { id: examId },
            include: { examQuestions: true }
        });

        if (!exam) return NextResponse.json({ error: "Exam not found" }, { status: 404 });

        // 2. Calculate Score
        let totalPoints = 0;
        let earnedPoints = 0;

        exam.examQuestions.forEach(q => {
            totalPoints += q.points;
            const studentAnswer = answers[q.id];

            // Simple string matching for now. Case-insensitive?
            if (studentAnswer && studentAnswer.trim() === q.correctAnswer.trim()) {
                earnedPoints += q.points;
            }
        });

        const finalScore = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
        const passed = finalScore >= exam.passingGrade;

        // 3. Record Attempt
        const attempt = await prisma.examAttempt.create({
            data: {
                examId,
                studentId: student.id,
                score: finalScore,
                answers: answers,
                status: 'COMPLETED',
                completedAt: new Date()
            }
        });

        return NextResponse.json({
            success: true,
            score: finalScore,
            passed,
            earnedPoints,
            totalPoints
        });

    } catch (error) {
        console.error("Exam Submission Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
