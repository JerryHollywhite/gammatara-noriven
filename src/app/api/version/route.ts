import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({
        version: "v15",
        timestamp: new Date().toISOString(),
        fixes: ["lesson-controls-visible", "multiple-youtube-links", "fix-lesson-sorting", "student-lesson-sort", "teacher-video-ui", "student-video-wrap"]
    });
}
