import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/teacher/assignments/[id] - Get single assignment detail
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
        const assignment = await prisma.assignment.findUnique({
            where: { id: assignmentId },
            include: {
                class: {
                    select: {
                        id: true,
                        name: true,
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

        return NextResponse.json({
            success: true,
            assignment
        });
    } catch (error: any) {
        console.error("Error fetching assignment:", error);
        return NextResponse.json({ error: "Failed to fetch assignment" }, { status: 500 });
    }
}

// PUT /api/teacher/assignments/[id] - Update assignment
export async function PUT(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: assignmentId } = await context.params;
    const body = await req.json();
    const { title, description, dueDate, attachmentUrl, maxScore } = body;

    try {
        // Verify ownership
        const existing = await prisma.assignment.findUnique({
            where: { id: assignmentId },
            include: { teacher: { include: { user: true } } }
        });

        if (!existing) {
            return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
        }

        if (existing.teacher.user.id !== session.user.id && session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }

        // Update
        const updated = await prisma.assignment.update({
            where: { id: assignmentId },
            data: {
                title: title || existing.title,
                description: description !== undefined ? description : existing.description,
                dueDate: dueDate ? new Date(dueDate) : existing.dueDate,
                attachmentUrl: attachmentUrl !== undefined ? attachmentUrl : existing.attachmentUrl,
                maxScore: maxScore || existing.maxScore
            }
        });

        return NextResponse.json({
            success: true,
            assignment: updated,
            message: "Assignment updated successfully"
        });
    } catch (error: any) {
        console.error("Error updating assignment:", error);
        return NextResponse.json({ error: "Failed to update assignment" }, { status: 500 });
    }
}

// DELETE /api/teacher/assignments/[id] - Delete assignment
export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: assignmentId } = await context.params;

    try {
        // Verify ownership
        const existing = await prisma.assignment.findUnique({
            where: { id: assignmentId },
            include: { teacher: { include: { user: true } } }
        });

        if (!existing) {
            return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
        }

        if (existing.teacher.user.id !== session.user.id && session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }

        // Delete (will cascade to submissions)
        await prisma.assignment.delete({
            where: { id: assignmentId }
        });

        return NextResponse.json({
            success: true,
            message: "Assignment deleted successfully"
        });
    } catch (error: any) {
        console.error("Error deleting assignment:", error);
        return NextResponse.json({ error: "Failed to delete assignment" }, { status: 500 });
    }
}
