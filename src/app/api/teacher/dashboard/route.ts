
import { NextResponse } from "next/server";
import { getTeacherDashboardData } from "@/lib/data-service";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            console.error("Teacher dashboard: No session");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = (session.user as any).id;
        console.log("Teacher dashboard: Fetching data for user", userId);

        const data = await getTeacherDashboardData(userId);

        if (!data) {
            console.error("Teacher dashboard: getTeacherDashboardData returned null for user", userId);
            return NextResponse.json({ error: "Failed to load dashboard data" }, { status: 500 });
        }

        console.log("Teacher dashboard: Success for user", userId);
        return NextResponse.json({
            success: true,
            data
        });
    } catch (error) {
        console.error("Teacher dashboard API error:", error);
        return NextResponse.json({ error: "Internal server error", details: String(error) }, { status: 500 });
    }
}
