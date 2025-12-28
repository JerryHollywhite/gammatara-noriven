import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/student/assignments - List all assignments for student's classes
export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "STUDENT") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { studentProfile: true }
        });

        if (!user?.studentProfile) {
            return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
        }

        // Get all enrollments (classes student is in)
        const enrollments = await prisma.enrollment.findMany({
            where: { studentId: user.studentProfile.id },
            select: { classId: true }
        });

        const classIds = enrollments.map(e => e.classId);

        // Get all assignments for these classes
        const assignments = await prisma.assignment.findMany({
            where: { classId: { in: classIds } },
            include: {
                class: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                teacher: {
                    include: {
                        user: {
                            select: {
                                name: true
                            }
                        }
                    }
                },
                submissions: {
                    where: { studentId: user.studentProfile.id },
                    select: {
                        id: true,
                        contentUrl: true,
                        contentText: true,
                        submittedAt: true,
                        grade: true,
                        feedback: true,
                        gradedAt: true
                    }
                }
            },
            orderBy: { dueDate: 'asc' }
        });

        // Format assignments with submission status
        const formattedAssignments = assignments.map(assignment => {
            const mySubmission = assignment.submissions[0]; // Should be max 1

            let status: 'pending' | 'submitted' | 'graded';
            if (mySubmission) {
                status = mySubmission.grade !== null ? 'graded' : 'submitted';
            } else {
                status = 'pending';
            }

            // Check if overdue
            const now = new Date();
            const isOverdue = assignment.dueDate && assignment.dueDate < now && status === 'pending';

            return {
                id: assignment.id,
                title: assignment.title,
                description: assignment.description,
                dueDate: assignment.dueDate,
                maxScore: assignment.maxScore,
                attachmentUrl: assignment.attachmentUrl,
                class: {
                    id: assignment.class.id,
                    name: assignment.class.name
                },
                teacher: assignment.teacher.user.name,
                status,
                isOverdue,
                submission: mySubmission || null
            };
        });

        // Group by status for easier UI rendering
        const grouped = {
            pending: formattedAssignments.filter(a => a.status === 'pending'),
            submitted: formattedAssignments.filter(a => a.status === 'submitted'),
            graded: formattedAssignments.filter(a => a.status === 'graded')
        };

        return NextResponse.json({
            success: true,
            assignments: formattedAssignments,
            grouped
        });
    } catch (error: any) {
        console.error("Error fetching student assignments:", error);
        return NextResponse.json({ error: "Failed to fetch assignments" }, { status: 500 });
    }
}
