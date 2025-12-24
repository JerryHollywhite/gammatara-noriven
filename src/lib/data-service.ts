import { prisma } from "@/lib/prisma";
import { getLevel, BADGES } from "./gamification";

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
            id: "", // Add dummy ID to satisfy type if needed, though we should guard
            gradeLevel: "Not Set",
            xp: 0,
            level: 1,
            streakDays: 0,
            enrollments: [],
            badges: []
        };

        // Fetch assignments for enrolled courses
        let mappedAssignments: any[] = [];

        if (user.studentProfile) {
            const enrolledCourseIds = user.studentProfile.enrollments.map(e => e.courseId);

            const assignmentsData = await prisma.assignment.findMany({
                where: {
                    courseId: { in: enrolledCourseIds }
                },
                include: {
                    submissions: {
                        where: { studentId: user.studentProfile.id }
                    }
                },
                orderBy: { dueDate: 'asc' }
            });

            mappedAssignments = assignmentsData.map(asg => {
                const submission = asg.submissions[0];
                let status = "pending";
                if (submission) {
                    status = submission.grade ? "completed" : "submitted";
                } else {
                    // Check if urgent (due within 3 days)
                    if (asg.dueDate) {
                        const daysUntil = Math.ceil((new Date(asg.dueDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                        if (daysUntil <= 3 && daysUntil >= 0) status = "urgent";
                        if (daysUntil < 0) status = "overdue";
                    }
                }

                return {
                    id: asg.id,
                    title: asg.title,
                    course: asg.courseId,
                    due: asg.dueDate ? asg.dueDate.toLocaleDateString() : "No Due Date",
                    status,
                    grade: submission?.grade
                };
            });
        }

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
            assignments: mappedAssignments,
            newBadge: null, // Placeholder for notification logic
            stats: {
                courses: profile.enrollments.length,
                assignmentsDue: mappedAssignments.filter(a => a.status === 'urgent' || a.status === 'pending').length,
                avgGrade: 0,
                badges: profile.badges.length
            }
        };

    } catch (error) {
        console.error("Error fetching student dashboard:", error);
        return null;
    }
}



// ... (existing helper functions)

export async function getLeaderboardData(limit = 10) {
    try {
        const topStudents = await prisma.studentProfile.findMany({
            take: limit,
            orderBy: { xp: 'desc' },
            include: {
                user: {
                    select: { name: true, image: true }
                },
                badges: true
            }
        });

        // Add rank and format
        return topStudents.map((student, index) => ({
            rank: index + 1,
            id: student.id,
            name: student.user.name || "Student",
            avatar: student.user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.user.name || 'User'}`,
            xp: student.xp,
            level: getLevel(student.xp).level,
            badges: student.badges.length
        }));

    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        return [];
    }
}

export async function awardBadge(userId: string, badgeCode: string) {
    try {
        // Find badge definition
        const badgeDef = BADGES.find(b => b.code === badgeCode);
        if (!badgeDef) return null;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { studentProfile: true }
        });
        if (!user || !user.studentProfile) return null;

        const studentId = user.studentProfile.id;

        // Check if already owned
        const existing = await prisma.earnedBadge.findFirst({
            where: { studentId, badgeCode }
        });

        if (existing) return null; // Already earned

        // Award badge
        const newBadge = await prisma.earnedBadge.create({
            data: {
                studentId,
                badgeCode
            }
        });

        return newBadge;

    } catch (error) {
        console.error("Error awarding badge:", error);
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

        let newBadge = null;

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

            if (passed) {
                awardXp = 50; // Base XP for completing a lesson
                // Check for "FIRST_STEPS" Badge
                const stepsBadge = await awardBadge(userId, "FIRST_STEPS");
                if (stepsBadge) newBadge = stepsBadge;
            }

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

        // Perfect Score Badge Check
        if (percentage === 100) {
            // For simplicity, just checking perfect score here. 
            // Ideally we check subject specific (Math Whiz), but let's just award a generic 'Perfect' if we had one.
            // Let's use "MATH_WHIZ" as a placeholder for any perfect score for now to demonstrate.
            // Or better, let's just use "FIRST_STEPS" logic above properly.
            // Actually, let's revert to simple logic: 
            // If XP > 1000 award 'WEEK_WARRIOR' (mock logic for demo)
            // Real logic would be complex aggregation query.
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

        return { success: true, xpAwarded: awardXp, passed, newBadge };

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
                                submissions: {
                                    include: {
                                        student: {
                                            include: { user: true }
                                        }
                                    }
                                }
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

        // Fetch real assignments linked to teacher
        // Note: In real app we might fetch separately or include. 
        // Currently schema has `assignments` on TeacherProfile, so we already have them from `profile.assignments`.

        // Map submissions to grading queue
        const gradingQueue = profile.assignments.flatMap(asg =>
            asg.submissions.filter(s => s.grade === null).map(sub => ({
                id: sub.id,
                student: sub.student?.user?.name || "Student",
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
            assignments: profile.assignments || [], // Pass raw assignments for management list
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
                                badges: true,
                                submissions: {
                                    where: { grade: { not: null } }, // Only graded ones
                                    include: {
                                        assignment: true
                                    },
                                    orderBy: { submittedAt: 'desc' },
                                    take: 10 // Get last 10 to calculate trends/recent
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!user) return null;

        const profile = user.parentProfile || { children: [] };

        const mappedChildren = profile.children.map(child => {
            // Calculate GPA (Simple 4.0 scale approximation)
            const gradedSubmissions = child.submissions.filter(s => s.grade !== null);
            let gpa = 0.0;
            if (gradedSubmissions.length > 0) {
                const sum = gradedSubmissions.reduce((acc, curr) => acc + (curr.grade || 0), 0);
                const avg = sum / gradedSubmissions.length;
                gpa = Number((avg / 25).toFixed(2)); // 100 -> 4.0, 75 -> 3.0
            }

            // Map Recent Grades
            const recentGrades = gradedSubmissions.slice(0, 5).map(sub => ({
                subject: sub.assignment.courseId.replace('_', ' '), // Simple format
                type: "Assignment", // Could be Quiz if we had type
                date: sub.submittedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                grade: sub.grade
            }));

            // Attendance (Mock for now, random but high)
            const attendance = 90 + Math.floor(Math.random() * 10);

            return {
                id: child.id,
                name: child.user.name || "Child",
                grade: child.gradeLevel,
                avatar: child.user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${child.user.name || 'Child'}`,
                stats: {
                    attendance: attendance,
                    gpa: gpa,
                    ranking: "Top 20%", // Placeholder
                    nextExam: "TBD"
                },
                recentGrades: recentGrades
            };
        });

        return {
            name: user.name || "Parent",
            children: mappedChildren
        };

    } catch (error) {
        console.error("Error fetching parent dashboard:", error);
        return null;
    }
}

export async function getAdminAnalytics() {
    try {
        // User Statistics by Role
        const [totalStudents, totalTeachers, totalParents, totalAdmins] = await Promise.all([
            prisma.user.count({ where: { role: 'STUDENT' } }),
            prisma.user.count({ where: { role: 'TEACHER' } }),
            prisma.user.count({ where: { role: 'PARENT' } }),
            prisma.user.count({ where: { role: 'ADMIN' } })
        ]);

        // Activity Metrics - Quizzes completed this week
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const quizzesThisWeek = await prisma.lessonProgress.count({
            where: {
                completedAt: { gte: oneWeekAgo },
                status: 'COMPLETED'
            }
        });

        // Content Stats
        const totalAssignments = await prisma.assignment.count();

        // Performance Overview
        const allCompletedProgress = await prisma.lessonProgress.findMany({
            where: { status: 'COMPLETED' },
            select: { score: true }
        });

        const avgScore = allCompletedProgress.length > 0
            ? allCompletedProgress.reduce((sum, p) => sum + (p.score || 0), 0) / allCompletedProgress.length
            : 0;

        // Engagement - Active users (logged in last 7 days)
        // Since we don't track lastLogin, we'll approximate with recent submissions
        const activeUsers = await prisma.user.count({
            where: {
                studentProfile: {
                    submissions: {
                        some: {
                            submittedAt: { gte: oneWeekAgo }
                        }
                    }
                }
            }
        });

        return {
            users: {
                students: totalStudents,
                teachers: totalTeachers,
                parents: totalParents,
                admins: totalAdmins,
                total: totalStudents + totalTeachers + totalParents + totalAdmins
            },
            activity: {
                quizzesThisWeek,
                activeUsers
            },
            content: {
                assignments: totalAssignments
            },
            performance: {
                avgQuizScore: Number(avgScore.toFixed(1)),
                totalCompletions: allCompletedProgress.length
            }
        };

    } catch (error) {
        console.error("Error fetching admin analytics:", error);
        return null;
    }
}

