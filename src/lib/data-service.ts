
// src/lib/data-service.ts
import { getLevel } from "./gamification";

/*
    This service abstracts the data source.
    Currently it returns MOCK data.
    Later, we will uncomment the Prisma calls.
*/

import { prisma } from "@/lib/prisma";
import { getLevel } from "./gamification";

/*
    This service abstracts the data source.
    Teacher and Parent data returned is still MOCK data for now.
*/

export async function getStudentDashboardData(userId: string) {
    if (!userId) return null;

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                studentProfile: {
                    include: {
                        enrollments: true,
                        badges: true,
                        // submissions: true // Not using yet
                    }
                }
            }
        });

        if (!user) return null;

        // Default shell if no specific student profile exists yet
        const profile = user.studentProfile || {
            gradeLevel: "Not Set",
            xp: 0,
            level: 1,
            streakDays: 0,
            enrollments: [],
            badges: []
        };

        const levelStats = getLevel(profile.xp);

        return {
            profile: {
                id: user.id,
                name: user.name || "Student",
                gradeLevel: profile.gradeLevel,
                xp: profile.xp,
                streakDays: profile.streakDays,
                avatar: user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name || 'User'}`,
                level: levelStats.level,
                levelProgress: levelStats.progress,
                nextLevelXp: levelStats.nextLevelXp,
                currentLevelXp: levelStats.currentLevelXp,
            },
            stats: {
                courses: profile.enrollments.length,
                assignmentsDue: 0,
                avgGrade: 0,
                badges: profile.badges.length
            }
        };

    } catch (error) {
        console.error("Error fetching student dashboard:", error);
        return null;
    }
}

const MOCK_TEACHER_PROFILE = {
    name: "Mr. Anderson",
    role: "Teacher",
    subject: "Mathematics & Physics",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Anderson",
    classes: [
        { id: 1, name: "Algebra II - Class A", students: 24, avgGrade: 88, nextSession: "Tomorrow, 09:00" },
        { id: 2, name: "Physics 101 - Class B", students: 18, avgGrade: 82, nextSession: "Today, 14:00" },
    ],
    gradingQueue: [
        { id: 1, student: "Alice Johnson", assignment: "Quadratic Equations Quiz", submitted: "2 hours ago", status: "pending" },
        { id: 2, student: "Bob Smith", assignment: "Physics Lab Report", submitted: "Yesterday", status: "pending" },
    ],
    stats: {
        totalStudents: 64,
        activeClasses: 3,
        pendingGrading: 12,
        classAverage: 85
    }
};

const MOCK_PARENT_PROFILE = {
    name: "Mrs. Sarah Otomasikan",
    children: [
        {
            id: 1,
            name: "Jerry Jr.",
            grade: "12 (SMA)",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jerry",
            stats: { attendance: 98, gpa: 3.8, ranking: "Top 5%", nextExam: "Physics - Monday" },
            recentGrades: [
                { subject: "Mathematics", grade: "A (95)", date: "Yesterday", type: "Quiz" },
                { subject: "English", grade: "B+ (88)", date: "Last Week", type: "Essay" }
            ]
        },
        {
            id: 2,
            name: "Jessica",
            grade: "4 (SD)",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica",
            stats: { attendance: 95, gpa: 3.9, ranking: "Top 3%", nextExam: "Math - Tuesday" },
            recentGrades: []
        }
    ]
};

export async function getTeacherDashboardData(userId: string) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_TEACHER_PROFILE;
}

export async function getParentDashboardData(userId: string) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_PARENT_PROFILE;
}
