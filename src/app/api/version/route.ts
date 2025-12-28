import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({
        version: "v13",
        timestamp: new Date().toISOString(),
        fixes: ["lesson-controls-visible", "multiple-youtube-links"]
    });
}
