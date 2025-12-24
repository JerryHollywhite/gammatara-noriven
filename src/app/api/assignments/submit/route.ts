
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "STUDENT") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { assignmentId, contentUrl } = body;

        if (!assignmentId || !contentUrl) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const student = await prisma.user.findUnique({
            where: { id: (session.user as any).id },
            include: { studentProfile: true }
        });

        if (!student?.studentProfile) {
            return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
        }

        // Upsert submission
        const existing = await prisma.assignmentSubmission.findFirst({
            where: {
                assignmentId,
                studentId: student.studentProfile.id
            }
        });

        let submission;
        if (existing) {
            submission = await prisma.assignmentSubmission.update({
                where: { id: existing.id },
                data: {
                    contentUrl,
                    submittedAt: new Date()
                }
            });
        } else {
            submission = await prisma.assignmentSubmission.create({
                data: {
                    assignmentId,
                    studentId: student.studentProfile.id,
                    contentUrl,
                }
            });
        }

        return NextResponse.json({ success: true, data: submission });

    } catch (error) {
        console.error("Submit Assignment Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
