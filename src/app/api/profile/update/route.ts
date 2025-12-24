import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { name, phone } = body;

        // Basic Validation
        if (!name || name.trim().length < 2) {
            return NextResponse.json({ error: "Invalid name" }, { status: 400 });
        }

        const user = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                name,
                phone
            } as any
        });

        return NextResponse.json({ success: true, user });

    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
