import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// DELETE /api/teacher/classes/[id]/schedule/[scheduleId]
export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string; scheduleId: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { scheduleId } = await context.params;

    try {
        await prisma.classSchedule.delete({
            where: { id: scheduleId }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Error deleting schedule:", error);
        return NextResponse.json({ error: "Failed to delete schedule" }, { status: 500 });
    }
}

// PUT /api/teacher/classes/[id]/schedule/[scheduleId] - Update schedule
export async function PUT(
    req: NextRequest,
    context: { params: Promise<{ id: string; scheduleId: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { scheduleId } = await context.params;
    const body = await req.json();
    const { startTime, endTime, dayOfWeek, date, isCancelled } = body;

    try {
        const schedule = await prisma.classSchedule.update({
            where: { id: scheduleId },
            data: {
                ...(startTime && { startTime }),
                ...(endTime && { endTime }),
                ...(dayOfWeek !== undefined && { dayOfWeek }),
                ...(date && { date: new Date(date) }),
                ...(isCancelled !== undefined && { isCancelled })
            }
        });

        return NextResponse.json({ success: true, schedule });
    } catch (error: any) {
        console.error("Error updating schedule:", error);
        return NextResponse.json({ error: "Failed to update schedule" }, { status: 500 });
    }
}
