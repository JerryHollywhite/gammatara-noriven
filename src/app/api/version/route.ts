import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({
        version: "v8",
        timestamp: new Date().toISOString(),
        fixes: ["student-dashboard", "teacher-dashboard", "profile-refresh-fix", "seed-programs"]
    });
}
