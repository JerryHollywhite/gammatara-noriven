import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/teacher/classes/[id]/schedule - Get all schedules for a class
export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: classId } = await context.params;

    try {
        const schedules = await prisma.classSchedule.findMany({
            where: { classId },
            orderBy: [
                { type: 'asc' }, // RECURRING first, then ONE_TIME, then EXCEPTION
                { dayOfWeek: 'asc' },
                { startTime: 'asc' }
            ]
        });

        return NextResponse.json({ success: true, schedules });
    } catch (error: any) {
        console.error("Error fetching schedules:", error);
        return NextResponse.json({ error: "Failed to fetch schedules" }, { status: 500 });
    }
}

// POST /api/teacher/classes/[id]/schedule - Create new schedule
export async function POST(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: classId } = await context.params;
    const body = await req.json();
    const { type, dayOfWeek, startTime, endTime, date, overridesId, isCancelled } = body;

    // Validation
    if (!startTime || !endTime) {
        return NextResponse.json({ error: "Start and end times are required" }, { status: 400 });
    }

    if (type === 'RECURRING' && !dayOfWeek) {
        return NextResponse.json({ error: "Day of week required for recurring schedules" }, { status: 400 });
    }

    if ((type === 'ONE_TIME' || type === 'EXCEPTION') && !date) {
        return NextResponse.json({ error: "Date required for one-time/exception schedules" }, { status: 400 });
    }

    try {
        // Check for conflicts (only for RECURRING)
        if (type === 'RECURRING') {
            const conflicting = await prisma.classSchedule.findFirst({
                where: {
                    classId,
                    type: 'RECURRING',
                    dayOfWeek,
                    isCancelled: false,
                    OR: [
                        {
                            startTime: { lte: startTime },
                            endTime: { gt: startTime }
                        },
                        {
                            startTime: { lt: endTime },
                            endTime: { gte: endTime }
                        },
                        {
                            startTime: { gte: startTime },
                            endTime: { lte: endTime }
                        }
                    ]
                }
            });

            if (conflicting) {
                return NextResponse.json({
                    error: "Schedule conflicts with existing session"
                }, { status: 400 });
            }
        }

        const schedule = await prisma.classSchedule.create({
            data: {
                classId,
                type: type || 'RECURRING',
                dayOfWeek: dayOfWeek || null,
                startTime,
                endTime,
                date: date ? new Date(date) : null,
                overridesId: overridesId || null,
                isCancelled: isCancelled || false,
                createdBy: session.user.id
            }
        });

        return NextResponse.json({ success: true, schedule });
    } catch (error: any) {
        console.error("Error creating schedule:", error);
        return NextResponse.json({ error: "Failed to create schedule" }, { status: 500 });
    }
}
