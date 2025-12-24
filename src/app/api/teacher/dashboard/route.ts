
import { NextResponse } from "next/server";
import { getTeacherDashboardData } from "@/lib/data-service";

export async function GET() {
    const data = await getTeacherDashboardData("mock_teacher_id");
    return NextResponse.json({ success: true, data });
}
