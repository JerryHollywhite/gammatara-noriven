
import { NextRequest, NextResponse } from "next/server";
import { createLiveClass, getTeacherLiveClasses } from "@/lib/data-service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    if (userRole !== "TEACHER" && userRole !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden - Teacher access only" }, { status: 403 });
    }

    // Get teacher profile ID
    const userId = (session.user as any).id;
    const user = await import("@/lib/prisma").then(m => m.prisma.user.findUnique({
        where: { id: userId },
        include: { teacherProfile: true }
    }));

    if (!user?.teacherProfile) {
        return NextResponse.json({ error: "Teacher profile not found" }, { status: 404 });
    }

    const liveClasses = await getTeacherLiveClasses(user.teacherProfile.id);
    return NextResponse.json({ success: true, data: liveClasses });
}

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    if (userRole !== "TEACHER" && userRole !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden - Teacher access only" }, { status: 403 });
    }

    // Get teacher profile ID
    const userId = (session.user as any).id;
    const user = await import("@/lib/prisma").then(m => m.prisma.user.findUnique({
        where: { id: userId },
        include: { teacherProfile: true }
    }));

    if (!user?.teacherProfile) {
        return NextResponse.json({ error: "Teacher profile not found" }, { status: 404 });
    }

    const body = await request.json();
    const { title, description, classId, zoomLink, meetingId, passcode, scheduledAt, duration } = body;

    if (!title || !zoomLink || !scheduledAt || !duration) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await createLiveClass(user.teacherProfile.id, {
        title,
        description,
        classId,
        zoomLink,
        meetingId,
        passcode,
        scheduledAt: new Date(scheduledAt),
        duration: parseInt(duration)
    });

    if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, liveClass: result.liveClass });
}
