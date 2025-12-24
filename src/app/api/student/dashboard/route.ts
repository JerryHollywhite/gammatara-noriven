
import { NextResponse } from "next/server";
import { getStudentDashboardData } from "@/lib/data-service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // Assuming authOptions is exported

export async function GET() {
    // const session = await getServerSession(authOptions);
    // if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await getStudentDashboardData("mock_user_id");
    return NextResponse.json({ success: true, data });
}
