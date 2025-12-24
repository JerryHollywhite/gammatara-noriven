import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { parentId, studentEmail } = await req.json();

        if (!parentId || !studentEmail) {
            return NextResponse.json({ error: "Parent ID and Student Email are required" }, { status: 400 });
        }

        // 1. Get Parent User & Profile
        const parentUser = await prisma.user.findUnique({
            where: { id: parentId },
            include: { parentProfile: true }
        });

        if (!parentUser || parentUser.role !== 'PARENT') {
            return NextResponse.json({ error: "Invalid Parent User" }, { status: 404 });
        }

        let parentProfileId = parentUser.parentProfile?.id;
        if (!parentProfileId) {
            const newProfile = await prisma.parentProfile.create({
                data: { userId: parentUser.id }
            });
            parentProfileId = newProfile.id;
        }

        // 2. Get Student User & Profile
        const studentUser = await prisma.user.findUnique({
            where: { email: studentEmail },
            include: { studentProfile: true }
        });

        if (!studentUser || studentUser.role !== 'STUDENT') {
            return NextResponse.json({ error: "Student not found or email belongs to non-student" }, { status: 404 });
        }

        let studentProfileId = studentUser.studentProfile?.id;
        // Auto create student profile if missing
        if (!studentProfileId) {
            const newStudProfile = await prisma.studentProfile.create({
                data: {
                    userId: studentUser.id,
                    gradeLevel: 'Not Set', // Default
                    xp: 0,
                    level: 1
                }
            });
            studentProfileId = newStudProfile.id;
        }

        // 3. Link them: Update StudentProfile to have this parent
        // Schema: StudentProfile has `parentId`.
        await prisma.studentProfile.update({
            where: { id: studentProfileId },
            data: {
                parentId: parentProfileId
            }
        });

        return NextResponse.json({
            success: true,
            message: `Successfully linked student ${studentUser.name} to parent ${parentUser.name}`
        });

    } catch (error) {
        console.error("Link Parent-Student Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
