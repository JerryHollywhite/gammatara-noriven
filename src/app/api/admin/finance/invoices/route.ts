import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { studentId, title, amount, dueDate } = body;

        if (!studentId || !title || !amount || !dueDate) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const invoice = await prisma.invoice.create({
            data: {
                studentId,
                title,
                amount: Number(amount),
                dueDate: new Date(dueDate),
                status: 'UNPAID'
            }
        });

        return NextResponse.json({ success: true, invoice });
    } catch (error) {
        console.error("Create Invoice Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    // Allow Admin to view all, Parent/Student to view their own?
    // For now, this is Admin route.
    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const invoices = await prisma.invoice.findMany({
            include: {
                student: { include: { user: true } },
                payment: true
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ success: true, invoices });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
