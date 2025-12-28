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
        const { sourceExamId, classId, startTime, endTime } = body;

        if (!sourceExamId || !classId) {
            return NextResponse.json({ error: "Source Exam and Class ID required" }, { status: 400 });
        }

        // 1. Fetch Source Exam
        const sourceExam = await prisma.exam.findUnique({
            where: { id: sourceExamId },
            include: { examQuestions: true }
        });

        if (!sourceExam) {
            return NextResponse.json({ error: "Source exam not found" }, { status: 404 });
        }

        // 2. Clone Exam
        // We append (Class Name) or similar to title? Or keep same? User said "soal bisa sama", implies title usually same.
        // Let's keep title same.

        const newExam = await prisma.exam.create({
            data: {
                title: sourceExam.title,
                description: sourceExam.description,
                durationMinutes: sourceExam.durationMinutes,
                passingGrade: sourceExam.passingGrade,
                subjectId: sourceExam.subjectId,
                classId: classId, // Linked to the class
                createdById: session.user.id,
                active: true, // Published by default when assigned? Yes.
                startTime: startTime ? new Date(startTime) : null,
                endTime: endTime ? new Date(endTime) : null,
                examQuestions: {
                    create: sourceExam.examQuestions.map(q => ({
                        questionText: q.questionText,
                        type: q.type,
                        options: q.options || [],
                        rows: q.rows || [],
                        cols: q.cols || [],
                        correctAnswer: q.correctAnswer,
                        points: q.points,
                        scaleMin: q.scaleMin,
                        scaleMax: q.scaleMax,
                        scaleMinLabel: q.scaleMinLabel,
                        scaleMaxLabel: q.scaleMaxLabel,
                    }))
                }
            }
        });

        return NextResponse.json({ success: true, exam: newExam });

    } catch (e: any) {
        console.error("Assign Exam Error:", e);
        return NextResponse.json({ error: "Failed to assign exam: " + e.message }, { status: 500 });
    }
}
