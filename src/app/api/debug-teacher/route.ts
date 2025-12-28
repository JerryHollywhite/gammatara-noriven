import { NextResponse } from "next/server";
import { getTeacherDashboardData } from "@/lib/data-service";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const secret = searchParams.get('secret');
        const email = searchParams.get('email') || 'teacher1@gmail.com';

        if (secret !== 'debug-2024') {
            return NextResponse.json({ error: "Unauthorized debug access" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true, email: true, role: true }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" });
        }

        console.log("Debugging dashboard for user:", user);

        try {
            const data = await getTeacherDashboardData(user.id);
            return NextResponse.json({
                success: true,
                user,
                dataStatus: data ? 'Data Found' : 'Data Null',
                data
            });
        } catch (innerError) {
            return NextResponse.json({
                success: false,
                error: "Function crashed",
                details: innerError instanceof Error ? innerError.message : String(innerError),
                stack: innerError instanceof Error ? innerError.stack : undefined
            });
        }

    } catch (error) {
        return NextResponse.json({
            error: "Outer error",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
