import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "STUDENT") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // In a real app, we filter by student's class/subjects.
        // For now, return all active exams.
        const exams = await prisma.exam.findMany({
            where: { active: true },
            select: {
                id: true,
                title: true,
                subject: { select: { name: true } },
                durationMinutes: true,
                passingGrade: true,
                _count: { select: { examQuestions: true } }
            }
        });

        return NextResponse.json({ success: true, exams });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
