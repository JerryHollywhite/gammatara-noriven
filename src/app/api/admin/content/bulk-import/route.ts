
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    if (userRole !== "ADMIN" && userRole !== "TEACHER") {
        return NextResponse.json({ error: "Forbidden - Admin/Teacher access only" }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { lessons } = body;

        if (!Array.isArray(lessons) || lessons.length === 0) {
            return NextResponse.json({ error: "Invalid lessons array" }, { status: 400 });
        }

        const results = {
            success: [] as any[],
            errors: [] as any[]
        };

        // Create lessons via existing /api/tara/content endpoint
        for (const lesson of lessons) {
            try {
                // Validate required fields
                if (!lesson.subjectId || !lesson.title) {
                    results.errors.push({
                        lesson: lesson.title || 'Unknown',
                        error: 'Missing required fields (subjectId, title)'
                    });
                    continue;
                }

                // Call the content API to create lesson
                const createResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/tara/content`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Cookie': request.headers.get('cookie') || ''
                    },
                    body: JSON.stringify({
                        id: lesson.id || `L_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        subjectId: lesson.subjectId,
                        title: lesson.title,
                        description: lesson.description || '',
                        videoDriveId: lesson.videoDriveId || '',
                        order: lesson.order || 99
                    })
                });

                const createResult = await createResponse.json();

                if (createResult.success) {
                    results.success.push({
                        lesson: lesson.title,
                        id: lesson.id
                    });
                } else {
                    results.errors.push({
                        lesson: lesson.title,
                        error: createResult.error || 'Failed to create lesson'
                    });
                }
            } catch (error: any) {
                results.errors.push({
                    lesson: lesson.title || 'Unknown',
                    error: error.message || 'Internal error'
                });
            }
        }

        return NextResponse.json({
            success: true,
            summary: {
                total: lessons.length,
                succeeded: results.success.length,
                failed: results.errors.length
            },
            results
        });

    } catch (error: any) {
        console.error("Bulk import error:", error);
        return NextResponse.json({
            error: "Failed to process bulk import",
            details: error.message
        }, { status: 500 });
    }
}
