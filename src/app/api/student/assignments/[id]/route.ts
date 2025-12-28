import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/student/assignments/[id] - Get assignment detail
export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "STUDENT") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: assignmentId } = await context.params;

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { studentProfile: true }
        });

        if (!user?.studentProfile) {
            return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
        }

        const assignment = await prisma.assignment.findUnique({
            where: { id: assignmentId },
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
                    where: { studentId: user.studentProfile.id }
                }
            }
        });

        if (!assignment) {
            return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            assignment: {
                ...assignment,
                mySubmission: assignment.submissions[0] || null
            }
        });
    } catch (error: any) {
        console.error("Error fetching assignment:", error);
        return NextResponse.json({ error: "Failed to fetch assignment" }, { status: 500 });
    }
}
