import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

/**
 * API endpoint to create demo users in production database
 * This should be protected or removed after initial setup
 */
export async function POST(request: Request) {
    try {
        const { secret } = await request.json();

        // Simple protection - you should change this secret
        if (secret !== "create-demo-users-2024") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const hashedPassword = await bcrypt.hash("Demo123", 10);

        // Create student user
        const student = await prisma.user.upsert({
            where: { email: "student1@gmail.com" },
            update: {},
            create: {
                email: "student1@gmail.com",
                name: "Student1",
                password: hashedPassword,
                role: "STUDENT",
                studentProfile: {
                    create: {
                        gradeLevel: "Grade 10",
                        xp: 0,
                        level: 1,
                        streakDays: 0
                    }
                }
            }
        });

        // Create teacher user
        const teacher = await prisma.user.upsert({
            where: { email: "teacher1@gmail.com" },
            update: {},
            create: {
                email: "teacher1@gmail.com",
                name: "Teacher 1",
                password: hashedPassword,
                role: "TEACHER",
                teacherProfile: {
                    create: {
                        specialty: null
                    }
                }
            }
        });

        return NextResponse.json({
            success: true,
            message: "Demo users created successfully",
            users: {
                student: { id: student.id, email: student.email },
                teacher: { id: teacher.id, email: teacher.email }
            }
        });

    } catch (error) {
        console.error("Error creating demo users:", error);
        return NextResponse.json({
            error: "Failed to create users",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
