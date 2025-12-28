import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/teacher/assignments/[id]/submissions - Get all submissions for an assignment
export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: assignmentId } = await context.params;

    try {
        // Get assignment with all submissions
        const assignment = await prisma.assignment.findUnique({
            where: { id: assignmentId },
            include: {
                class: {
                    include: {
                        students: {
                            include: {
                                student: {
                                    include: {
                                        user: {
                                            select: {
                                                id: true,
                                                name: true,
                                                email: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                submissions: {
                    include: {
                        student: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        name: true
                                    }
                                }
                            }
                        }
                    },
                    orderBy: { submittedAt: 'desc' }
                }
            }
        });

        if (!assignment) {
            return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
        }

        // Create a map of submissions by student ID
        const submissionMap = new Map();
        assignment.submissions.forEach(sub => {
            submissionMap.set(sub.studentId, sub);
        });

        // Get all students in the class with their submission status
        const studentsWithStatus = assignment.class.students.map(enrollment => {
            const submission = submissionMap.get(enrollment.studentId);

            return {
                studentId: enrollment.studentId,
                studentName: enrollment.student.user.name,
                studentEmail: enrollment.student.user.email,
                submission: submission ? {
                    id: submission.id,
                    contentUrl: submission.contentUrl,
                    contentText: submission.contentText,
                    submittedAt: submission.submittedAt,
                    grade: submission.grade,
                    feedback: submission.feedback,
                    gradedAt: submission.gradedAt
                } : null,
                status: submission
                    ? (submission.grade !== null ? 'graded' : 'submitted')
                    : 'not_submitted'
            };
        });

        // Calculate stats
        const stats = {
            totalStudents: studentsWithStatus.length,
            submitted: studentsWithStatus.filter(s => s.submission !== null).length,
            graded: studentsWithStatus.filter(s => s.submission?.grade !== null).length,
            notSubmitted: studentsWithStatus.filter(s => s.submission === null).length
        };

        return NextResponse.json({
            success: true,
            assignment: {
                id: assignment.id,
                title: assignment.title,
                description: assignment.description,
                dueDate: assignment.dueDate,
                maxScore: assignment.maxScore,
                class: {
                    id: assignment.class.id,
                    name: assignment.class.name
                }
            },
            students: studentsWithStatus,
            stats
        });
    } catch (error: any) {
        console.error("Error fetching submissions:", error);
        return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 });
    }
}
