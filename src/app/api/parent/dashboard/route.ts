
import { NextResponse } from "next/server";
import { getParentDashboardData } from "@/lib/data-service";

export async function GET() {
    const data = await getParentDashboardData("mock_parent_id");
    return NextResponse.json({ success: true, data });
}
