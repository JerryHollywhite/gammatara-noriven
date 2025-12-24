
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
        const { submissionId, grade, feedback } = body;

        if (!submissionId || grade === undefined) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const submission = await prisma.assignmentSubmission.update({
            where: { id: submissionId },
            data: {
                grade: typeof grade === 'string' ? parseInt(grade) : grade,
                feedback
            },
            include: {
                student: true
            }
        });

        // Award XP if first time graded? 
        // For now let's just save the grade.

        return NextResponse.json({ success: true, data: submission });

    } catch (error) {
        console.error("Grade Submission Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
