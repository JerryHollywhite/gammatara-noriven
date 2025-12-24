
import { NextResponse } from "next/server";
import { getTeacherDashboardData } from "@/lib/data-service";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = (session.user as any).id;
    const data = await getTeacherDashboardData(userId);

    // Fetch latest profile info for Editor
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { phone: true, email: true } as any
    });

    return NextResponse.json({
        success: true,
        data: {
            ...data,
            email: user?.email,
            phone: user?.phone
        } as any
    });
}
