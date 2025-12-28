import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
                attempts: {
                    include: {
                        student: { select: { id: true, user: { select: { name: true, image: true, email: true } } } }
                    },
                    orderBy: { score: 'desc' }
                },
                _count: { select: { examQuestions: true } }
            }
        });

        if (!exam) return NextResponse.json({ error: "Exam not found" }, { status: 404 });

        // Calculate Stats
        const totalAttempts = exam.attempts.length;
        const averageScore = totalAttempts > 0
            ? exam.attempts.reduce((acc, curr) => acc + (curr.score || 0), 0) / totalAttempts
            : 0;

        return NextResponse.json({
            success: true,
            data: {
                exam,
                stats: {
                    totalAttempts,
                    averageScore: Math.round(averageScore * 10) / 10,
                    highestScore: totalAttempts > 0 ? Math.max(...exam.attempts.map(a => a.score || 0)) : 0,
                    lowestScore: totalAttempts > 0 ? Math.min(...exam.attempts.map(a => a.score || 0)) : 0
                }
            }
        });

    } catch (error) {
        console.error("Exam Results Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
