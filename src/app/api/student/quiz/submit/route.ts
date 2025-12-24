
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { saveQuizResult } from "@/lib/data-service";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { lessonId, score, totalQuestions } = body;

        if (!lessonId || typeof score !== "number" || typeof totalQuestions !== "number") {
            return NextResponse.json({ error: "Invalid data" }, { status: 400 });
        }

        const result = await saveQuizResult((session.user as any).id, lessonId, score, totalQuestions);

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }

        return NextResponse.json(result);

    } catch (error) {
        console.error("Quiz submit error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
