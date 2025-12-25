import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const programs = await prisma.program.findMany({
            where: { active: true },
            select: { id: true, name: true, code: true },
            orderBy: { name: 'asc' }
        });

        return NextResponse.json({ success: true, programs });
    } catch (error: any) {
        console.error("Fetch Programs Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
