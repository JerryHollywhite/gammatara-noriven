import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "TEACHER") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { title, description, subjectId, classId, durationMinutes, passingGrade, questions, active } = body;

        // Validation: Require either subjectId OR classId (ONLY if Active/Published)
        if (active && (!title || (!subjectId && !classId) || !questions || !Array.isArray(questions))) {
            return NextResponse.json({ error: "Missing required fields for Publishing (Title, Subject/Class, Questions)" }, { status: 400 });
        }

        // Create the Exam and Questions transactionally
        const exam = await prisma.exam.create({
            data: {
                title,
                description,
                subjectId: subjectId ? subjectId : undefined,
                classId: classId || undefined,
                durationMinutes: Number(durationMinutes) || 60,
                passingGrade: Number(passingGrade) || 75,
                active: active !== undefined ? active : true,
                createdById: session.user.id,
                examQuestions: {
                    create: questions.map((q: any) => ({
                        questionText: q.questionText,
                        type: q.type || 'MCQ',
                        options: q.options || [], // Ensure not null
                        rows: q.rows ? q.rows : undefined,
                        cols: q.cols ? q.cols : undefined,
                        scaleMin: q.scaleMin,
                        scaleMax: q.scaleMax,
                        scaleMinLabel: q.scaleMinLabel,
                        scaleMaxLabel: q.scaleMaxLabel,
                        correctAnswer: q.correctAnswer || "", // Ensure not null
                        points: Number(q.points) || 1
                    }))
                }
            },
            include: { examQuestions: true }
        });

        return NextResponse.json({ success: true, exam });

    } catch (error: any) {
        console.error("Create Exams Error:", error);
        return NextResponse.json({ error: "Create Failed: " + (error.message || "Unknown Error") }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get('subjectId');
    const classId = searchParams.get('classId');

    // If no specific filters, show ALL exams created by this teacher
    // if (!subjectId && !classId) {
    //    return NextResponse.json({ error: "Subject ID or Class ID required" }, { status: 400 });
    // }

    try {
        const whereClause: any = {};
        if (subjectId) whereClause.subjectId = subjectId;
        if (classId) whereClause.classId = classId;

        // If no filter, show ONLY my exams
        if (!subjectId && !classId) {
            whereClause.createdById = session.user.id;
        }

        const exams = await prisma.exam.findMany({
            where: whereClause,
            include: {
                _count: { select: { examQuestions: true } },
                examQuestions: true, // Required for Edit
                class: { select: { name: true } },
                subject: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ success: true, exams });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
