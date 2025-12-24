import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "PARENT") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Find Parent Profile
        const parent = await prisma.parentProfile.findUnique({
            where: { userId: session.user.id },
            include: { children: true }
        });

        if (!parent) return NextResponse.json({ error: "Parent profile not found" }, { status: 404 });

        const childIds = parent.children.map(c => c.id);

        const invoices = await prisma.invoice.findMany({
            where: { studentId: { in: childIds } },
            include: {
                student: { include: { user: true } },
                payment: true
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ success: true, invoices });

    } catch (error) {
        console.error("Parent Billing Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
