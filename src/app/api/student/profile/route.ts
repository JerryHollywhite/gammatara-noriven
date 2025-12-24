import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLevel } from "@/lib/gamification";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                studentProfile: {
                    include: {
                        badges: true,
                        enrollments: true
                    }
                }
            }
        });

        if (!user || user.role !== "STUDENT") {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }

        const profile = user.studentProfile!;
        const levelStats = getLevel(profile.xp);

        // Fetch recent activity (mock for now or from submissions)
        // For MVP, we'll return empty or basic mock
        const recentActivity = [
            // Mock data or query submissions
        ];

        const data = {
            personalInfo: {
                id: profile.id,
                name: user.name || "Student",
                email: user.email || "",
                avatar: user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`,
                gradeLevel: profile.gradeLevel,
                joinedAt: user.createdAt.toLocaleDateString(),
                phone: (user as any).phone || null,
            },
            stats: {
                totalXP: profile.xp,
                currentLevel: levelStats.level,
                levelProgress: levelStats.progress,
                gpa: 3.8, // Mock or Calc
                badgeCount: profile.badges.length,
                completionRate: 0, // Mock or Calc
                coursesEnrolled: profile.enrollments.length,
                lessonsCompleted: 0 // Mock
            },
            badges: profile.badges.map(b => ({
                code: b.badgeCode,
                name: b.badgeCode.replace("_", " "), // Simple formatting
                description: "Earned for excellence",
                icon: "🏆", // Map codes to icons in frontend
                earnedAt: b.earnedAt.toLocaleDateString()
            })),
            recentActivity: []
        };

        return NextResponse.json({ success: true, data });

    } catch (error) {
        console.error("Profile Fetch Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
