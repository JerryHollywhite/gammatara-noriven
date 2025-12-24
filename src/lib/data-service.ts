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


export async function saveQuizResult(userId: string, lessonId: string, score: number, totalQuestions: number) {
    if (!userId) return { success: false, error: "Unauthorized" };

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { studentProfile: true }
        });

        if (!user || !user.studentProfile) return { success: false, error: "No student profile found" };
        const studentId = user.studentProfile.id;

        // Check for existing progress
        const existingProgress = await prisma.lessonProgress.findFirst({
            where: {
                studentId,
                lessonId
            }
        });

        let awardXp = 0;
        const passThreshold = 70; // 70% passing grade
        const percentage = (score / totalQuestions) * 100;
        const passed = percentage >= passThreshold;

        // Logic: Award XP only if this is the first completion or first time passing?
        // Let's simple it: Award XP if strictly new progress, or if updating from NOT_STARTED to COMPLETED.

        let status = existingProgress?.status || "NOT_STARTED";
        if (passed) status = "COMPLETED";
        else if (status !== "COMPLETED") status = "STARTED"; // Keep completed if already completed

        if (!existingProgress) {
            // First time taking it
            await prisma.lessonProgress.create({
                data: {
                    studentId,
                    lessonId,
                    score: percentage,
                    status,
                    completedAt: passed ? new Date() : null
                }
            });

            if (passed) awardXp = 50; // Base XP for completing a lesson

        } else {
            // Update existing
            // Only award XP if previously not completed and now completed
            if (existingProgress.status !== "COMPLETED" && passed) {
                awardXp = 50;
            }

            await prisma.lessonProgress.update({
                where: { id: existingProgress.id },
                data: {
                    score: Math.max(existingProgress.score || 0, percentage), // Keep highest score
                    status,
                    completedAt: (passed && !existingProgress.completedAt) ? new Date() : existingProgress.completedAt
                }
            });
        }

        // Add XP if awarded
        if (awardXp > 0) {
            await prisma.studentProfile.update({
                where: { id: studentId },
                data: {
                    xp: { increment: awardXp },
                    streakDays: { increment: 1 } // Simple streak bump for activity
                }
            });
        }

        return { success: true, xpAwarded: awardXp, passed };

    } catch (error) {
        console.error("Error saving quiz result:", error);
        return { success: false, error: "Database error" };
    }
}


export async function getTeacherDashboardData(userId: string) {
    if (!userId) return null;

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                teacherProfile: {
                    include: {
                        classes: {
                            include: {
                                students: true
                            }
                        },
                        assignments: {
                            include: {
                                submissions: true
                            }
                        }
                    }
                }
            }
        });

        if (!user) return null;

        // Default shell if no teacher profile exists
        const profile = user.teacherProfile || {
            specialty: "General Education",
            classes: [],
            assignments: []
        };

        // Calculate stats from real data
        const totalStudents = profile.classes.reduce((acc, cls) => acc + cls.students.length, 0);
        const activeClasses = profile.classes.length;
        const pendingGrading = profile.assignments.reduce((acc, asg) =>
            acc + asg.submissions.filter(s => s.grade === null).length, 0);

        // Map classes to UI structure
        const mappedClasses = profile.classes.map(cls => ({
            id: cls.id,
            name: cls.name,
            subject: profile.specialty || "General",
            students: cls.students.length,
            avgGrade: 0, // Placeholder
            nextSession: "TBD" // Placeholder
        }));

        // Map submissions to grading queue
        const gradingQueue = profile.assignments.flatMap(asg =>
            asg.submissions.filter(s => s.grade === null).map(sub => ({
                id: sub.id,
                student: "Student", // Would need another fetch or include to get name
                assignment: asg.title,
                submitted: sub.submittedAt.toLocaleDateString(),
                status: "pending"
            }))
        ).slice(0, 5);

        return {
            name: user.name || "Teacher",
            role: "Teacher",
            subject: profile.specialty || "Education",
            avatar: user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name || 'Teacher'}`,
            classes: mappedClasses,
            gradingQueue: gradingQueue,
            stats: {
                totalStudents,
                activeClasses,
                pendingGrading,
                classAverage: 0
            }
        };

    } catch (error) {
        console.error("Error fetching teacher dashboard:", error);
        return null;
    }
}

export async function getParentDashboardData(userId: string) {
    if (!userId) return null;

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                parentProfile: {
                    include: {
                        children: {
                            include: {
                                user: true,
                                enrollments: true,
                                badges: true
                            }
                        }
                    }
                }
            }
        });

        if (!user) return null;

        const profile = user.parentProfile || { children: [] };

        const mappedChildren = profile.children.map(child => ({
            id: child.id,
            name: child.user.name || "Child",
            grade: child.gradeLevel,
            avatar: child.user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${child.user.name || 'Child'}`,
            stats: {
                attendance: 100,
                gpa: 0.0,
                ranking: "Top 10%",
                nextExam: "TBD"
            },
            recentGrades: []
        }));

        return {
            name: user.name || "Parent",
            children: mappedChildren
        };

    } catch (error) {
        console.error("Error fetching parent dashboard:", error);
        return null;
    }
}
