
import { NextResponse } from "next/server";
import { getPrograms, getSubjects, getLessons } from "@/lib/tara-content";
import { getAllQuizLessonIds } from "@/lib/tara-quiz";

export const dynamic = 'force-dynamic'; // Ensure no caching for latest Sheet data

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get("type");
        const id = searchParams.get("id"); // generic ID filter

        if (type === "programs") {
            const data = await getPrograms();
            return NextResponse.json({ success: true, data });
        }

        if (type === "subjects") {
            // id here refers to programId if provided
            const data = await getSubjects(id || undefined);
            return NextResponse.json({ success: true, data });
        }

        if (type === "lessons") {
            if (!id) {
                return NextResponse.json({ success: false, error: "Missing subjectId (id param) for lessons" }, { status: 400 });
            }
            const data = await getLessons(id);
            return NextResponse.json({ success: true, data });
        }

        if (type === "quiz-map") {
            const data = await getAllQuizLessonIds();
            return NextResponse.json({ success: true, data });
        }


        return NextResponse.json({ success: false, error: "Invalid type param" }, { status: 400 });

    } catch (error: any) {
        console.error("Tara Content API Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

import { addLesson } from "@/lib/tara-content";

export async function POST(request: Request) {
    // Basic Auth Check
    // const session = ... (Add if needed)

    try {
        const body = await request.json();

        // Validate minimum fields
        if (!body.subjectId || !body.title) {
            return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
        }

        const success = await addLesson(body);

        if (success) {
            return NextResponse.json({ success: true, message: "Lesson added" });
        } else {
            return NextResponse.json({ success: false, error: "Failed to write to sheet" }, { status: 500 });
        }
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
