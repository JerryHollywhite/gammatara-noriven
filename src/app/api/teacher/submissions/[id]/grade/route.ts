import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/teacher/submissions/[id]/grade - Submit grade for a submission
export async function POST(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: submissionId } = await context.params;
    const body = await req.json();
    const { grade, feedback } = body;

    // Validation
    if (grade === undefined || grade === null || grade < 0 || grade > 100) {
        return NextResponse.json({ error: "Invalid grade. Must be 0-100" }, { status: 400 });
    }

    try {
        // Update submission with grade
        const submission = await prisma.assignmentSubmission.update({
            where: { id: submissionId },
            data: {
                grade: parseInt(grade),
                feedback: feedback || null
            },
            include: {
                student: {
                    include: { user: true }
                },
                assignment: true
            }
        });

        return NextResponse.json({
            success: true,
            submission,
            message: `Grade ${grade}/100 submitted for ${submission.student.user.name}`
        });
    } catch (error: any) {
        console.error("Error submitting grade:", error);
        return NextResponse.json({ error: "Failed to submit grade" }, { status: 500 });
    }
}
