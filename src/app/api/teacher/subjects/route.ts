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
        const subjects = await prisma.subject.findMany({
            where: { active: true },
            select: {
                id: true,
                name: true,
                code: true,
                program: {
                    select: { name: true }
                }
            },
            orderBy: { name: 'asc' }
        });

        return NextResponse.json({ success: true, subjects });
    } catch (error: any) {
        console.error("Fetch Subjects Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { name, code, programId, description } = body;

        if (!name || !code || !programId) {
            return NextResponse.json({ error: "Missing required fields (Name, Code, Program)" }, { status: 400 });
        }

        // Check if code exists
        const existing = await prisma.subject.findUnique({
            where: { code }
        });

        if (existing) {
            return NextResponse.json({ error: "Subject Code already exists. Please use a unique code." }, { status: 400 });
        }

        const newSubject = await prisma.subject.create({
            data: {
                name,
                code,
                programId,
                description,
                active: true
            }
        });

        return NextResponse.json({ success: true, subject: newSubject });

    } catch (error: any) {
        console.error("Create Subject Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
