import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/student/assignments/[id]/submit - Submit assignment work
export async function POST(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "STUDENT") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: assignmentId } = await context.params;
    const body = await req.json();
    const { contentUrl, contentText } = body;

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { studentProfile: true }
        });

        if (!user?.studentProfile) {
            return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
        }

        // Validation: must have at least contentUrl OR contentText
        if (!contentUrl && !contentText) {
            return NextResponse.json({
                error: "Please provide either a link or text submission"
            }, { status: 400 });
        }

        // Check if assignment exists
        const assignment = await prisma.assignment.findUnique({
            where: { id: assignmentId }
        });

        if (!assignment) {
            return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
        }

        // Check if already submitted
        const existingSubmission = await prisma.assignmentSubmission.findFirst({
            where: {
                assignmentId,
                studentId: user.studentProfile.id
            }
        });

        if (existingSubmission) {
            // Check if already graded - if yes, cannot resubmit
            if (existingSubmission.grade !== null) {
                return NextResponse.json({
                    error: "Cannot resubmit - assignment has already been graded"
                }, { status: 400 });
            }

            // Update existing submission
            const updated = await prisma.assignmentSubmission.update({
                where: { id: existingSubmission.id },
                data: {
                    contentUrl: contentUrl || null,
                    contentText: contentText || null,
                    submittedAt: new Date() // Update submission time
                }
            });

            return NextResponse.json({
                success: true,
                submission: updated,
                message: "Submission updated successfully"
            });
        }

        // Create new submission
        const submission = await prisma.assignmentSubmission.create({
            data: {
                assignmentId,
                studentId: user.studentProfile.id,
                contentUrl: contentUrl || null,
                contentText: contentText || null
            }
        });

        return NextResponse.json({
            success: true,
            submission,
            message: "Assignment submitted successfully"
        });
    } catch (error: any) {
        console.error("Error submitting assignment:", error);
        return NextResponse.json({ error: "Failed to submit assignment" }, { status: 500 });
    }
}
