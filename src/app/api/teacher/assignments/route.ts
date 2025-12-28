import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/teacher/assignments - List all teacher's assignments
export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { teacherProfile: true }
        });

        if (!user?.teacherProfile) {
            return NextResponse.json({ error: "Teacher profile not found" }, { status: 404 });
        }

        // Get all assignments for this teacher
        const assignments = await prisma.assignment.findMany({
            where: { teacherId: user.teacherProfile.id },
            include: {
                class: {
                    select: {
                        id: true,
                        name: true,
                        students: {
                            select: { id: true }
                        }
                    }
                },
                submissions: {
                    select: {
                        id: true,
                        grade: true,
                        submittedAt: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Format response with stats
        const formattedAssignments = assignments.map(assignment => ({
            id: assignment.id,
            title: assignment.title,
            description: assignment.description,
            dueDate: assignment.dueDate,
            maxScore: assignment.maxScore,
            attachmentUrl: assignment.attachmentUrl,
            class: {
                id: assignment.class.id,
                name: assignment.class.name,
                studentCount: assignment.class.students.length
            },
            stats: {
                totalStudents: assignment.class.students.length,
                submitted: assignment.submissions.length,
                graded: assignment.submissions.filter(s => s.grade !== null).length
            },
            createdAt: assignment.createdAt,
            updatedAt: assignment.updatedAt
        }));

        return NextResponse.json({
            success: true,
            assignments: formattedAssignments
        });
    } catch (error: any) {
        console.error("Error fetching assignments:", error);
        return NextResponse.json({ error: "Failed to fetch assignments" }, { status: 500 });
    }
}

// POST /api/teacher/assignments - Create new assignment
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { teacherProfile: true }
        });

        if (!user?.teacherProfile) {
            return NextResponse.json({ error: "Teacher profile not found" }, { status: 404 });
        }

        const body = await req.json();
        const { classId, title, description, dueDate, attachmentUrl, maxScore } = body;

        // Validation
        if (!classId || !title) {
            return NextResponse.json({
                error: "ClassId and title are required"
            }, { status: 400 });
        }

        // Verify teacher owns this class
        const classGroup = await prisma.classGroup.findUnique({
            where: { id: classId }
        });

        if (!classGroup || classGroup.teacherId !== user.teacherProfile.id) {
            return NextResponse.json({
                error: "Class not found or access denied"
            }, { status: 403 });
        }

        // Create assignment
        const assignment = await prisma.assignment.create({
            data: {
                teacherId: user.teacherProfile.id,
                classId,
                title,
                description: description || null,
                dueDate: dueDate ? new Date(dueDate) : null,
                attachmentUrl: attachmentUrl || null,
                maxScore: maxScore || 100
            },
            include: {
                class: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        return NextResponse.json({
            success: true,
            assignment,
            message: `Assignment "${title}" created for ${assignment.class.name}`
        });
    } catch (error: any) {
        console.error("Error creating assignment:", error);
        return NextResponse.json({ error: "Failed to create assignment" }, { status: 500 });
    }
}
