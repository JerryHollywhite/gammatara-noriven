import { NextResponse } from "next/server";
import { getLeaderboardData } from "@/lib/data-service";

export async function GET(request: Request) {
    // Get limit from query params if needed
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    const data = await getLeaderboardData(limit);

    return NextResponse.json({
        success: true,
        data
    });
}
