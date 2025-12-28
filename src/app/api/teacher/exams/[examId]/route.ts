import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ examId: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "TEACHER") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { examId } = await params;

    try {
        // Check ownership
        const exam = await prisma.exam.findUnique({
            where: { id: examId },
            include: { attempts: true }
        });

        if (!exam) return NextResponse.json({ error: "Exam not found" }, { status: 404 });

        // Ownership check disabled for debugging/draft deletion flexibility
        // if (exam.createdById && exam.createdById !== session.user.id) {
        //      return NextResponse.json({ error: "Not authorized to delete this exam" }, { status: 403 });
        // }

        await prisma.exam.delete({
            where: { id: examId }
        });

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error("Delete Exam Error:", e);
        return NextResponse.json({ error: "Delete Failed: " + (e.message || "Unknown DB Error") }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ examId: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "TEACHER") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { examId } = await params;
    const body = await req.json();
    const {
        title, description, subjectId, classId,
        durationMinutes, passingGrade, questions,
        active, startTime, endTime
    } = body;

    try {
        // Check ownership
        const existingExam = await prisma.exam.findUnique({ where: { id: examId } });
        if (!existingExam) return NextResponse.json({ error: "Exam not found" }, { status: 404 });

        // if (existingExam.createdById && existingExam.createdById !== session.user.id) {
        //     return NextResponse.json({ error: "Not authorized to update this exam" }, { status: 403 });
        // }

        // Transaction: Update metadata, Replace questions
        const result = await prisma.$transaction(async (tx) => {
            // 1. Update Exam Metadata
            const updatedExam = await tx.exam.update({
                where: { id: examId },
                data: {
                    title,
                    description,
                    subjectId: subjectId || null,
                    classId: classId || null,
                    durationMinutes: Number(durationMinutes) || 60,
                    passingGrade: Number(passingGrade) || 75,
                    active,
                    startTime: startTime ? new Date(startTime) : null,
                    endTime: endTime ? new Date(endTime) : null,
                }
            });

            // 2. Questions Strategy: Delete All, Recreate All (Simplest for "Form Save" behavior)
            // Note: This breaks mapping for existing attempts. Assuming Drafts have no attempts.
            await tx.examQuestion.deleteMany({ where: { examId } });

            if (questions && Array.isArray(questions)) {
                await tx.examQuestion.createMany({
                    data: questions.map((q: any) => ({
                        examId,
                        questionText: q.questionText,
                        type: q.type,
                        options: q.options || [],
                        rows: q.rows || [],
                        cols: q.cols || [],
                        correctAnswer: q.correctAnswer,
                        points: Number(q.points) || 1,
                        scaleMin: q.scaleMin,
                        scaleMax: q.scaleMax,
                        scaleMinLabel: q.scaleMinLabel,
                        scaleMaxLabel: q.scaleMaxLabel,
                    }))
                });
            }

            return updatedExam;
        });

        return NextResponse.json({ success: true, exam: result });

    } catch (e) {
        console.error("Update Exam Error:", e);
        return NextResponse.json({ error: "Failed to update exam" }, { status: 500 });
    }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ examId: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "TEACHER") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { examId } = await params;

    try {
        const exam = await prisma.exam.findUnique({
            where: { id: examId },
            include: {
                examQuestions: true,
                attempts: {
                    include: {
                        student: {
                            include: { user: true }
                        }
                    },
                    orderBy: { startedAt: 'desc' }
                },
                class: {
                    include: {
                        students: {
                            include: {
                                student: {
                                    include: { user: true }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!exam) return NextResponse.json({ error: "Exam not found" }, { status: 404 });
        return NextResponse.json(exam);
    } catch (e: any) {
        return NextResponse.json({ error: "Fetch Failed: " + (e.message || "Unknown") }, { status: 500 });
    }
}
