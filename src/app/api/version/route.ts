import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({
        version: "v4",
        timestamp: new Date().toISOString(),
        fixes: ["student-dashboard", "teacher-dashboard", "seed-users", "safe-fallback", "debug-exposure"]
    });
}
