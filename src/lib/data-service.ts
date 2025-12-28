import { getNextSession, formatNextSession } from "./schedule-utils";
import { prisma } from "@/lib/prisma";
import { getLevel, BADGES } from "./gamification";

/*
    This service abstracts the data source.
    Teacher and Parent data returned is still MOCK data for now.
*/

export async function getStudentDashboardData(userId: string) {
    if (!userId) {
        console.error("getStudentDashboardData: No userId provided");
        return null;
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                studentProfile: {
                    include: {
                        enrollments: {
                            include: {
                                class: true,
                                subject: {
                                    include: {
                                        lessons: {
                                            orderBy: { order: 'asc' }
                                        }
                                    }
                                }
                            }
                        },
                        badges: true,
                    }
                }
            }
        });

        if (!user) {
            console.error("getStudentDashboardData: User not found for ID:", userId);
            return null;
        }

        // If no student profile exists, create empty dashboard data
        if (!user.studentProfile) {
            console.warn("getStudentDashboardData: No studentProfile for user:", user.email);
            return {
                profile: {
                    id: user.id,
                    name: user.name || "Student",
                    gradeLevel: "Not Set",
                    xp: 0,
                    streakDays: 0,
                    avatar: user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name || 'User'}`,
                    level: 1,
                    levelProgress: 0,
                    nextLevelXp: 100,
                    currentLevelXp: 0,
                    courses: []
                },
                assignments: [],
                newBadge: null,
                stats: {
                    courses: 0,
                    assignmentsDue: 0,
                    avgGrade: 0,
                    badges: 0
                }
            };
        }

        const profile = user.studentProfile;

        // Fetch assignments for enrolled classes
        let mappedAssignments: any[] = [];

        // Get all class IDs the student is enrolled in
        const enrolledClassIds = profile.enrollments
            .map(e => e.classId)
            .filter(id => id !== null) as string[];

        if (enrolledClassIds.length > 0) {
            // Fetch assignments for those classes
            const assignmentsData = await prisma.assignment.findMany({
                where: {
                    classId: { in: enrolledClassIds }
                },
                include: {
                    submissions: {
                        where: { studentId: profile.id }
                    },
                    class: {
                        select: {
                            name: true
                        }
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
                    course: asg.class.name,
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
                courses: (() => {
                    const classMap = new Map<string, any>();
                    const standaloneSubjects: any[] = [];

                    profile.enrollments.forEach(e => {
                        // If enrollment has a class, group by class
                        if (e.classId && e.class) {
                            if (!classMap.has(e.classId)) {
                                classMap.set(e.classId, {
                                    id: e.classId,
                                    title: e.class.name,
                                    description: "Class",
                                    progress: 0,
                                    nextLesson: "Continue",
                                    thumbnail: "bg-indigo-500",
                                    lessons: []
                                });
                            }

                            // If this enrollment also has a subject, collect its lessons
                            if (e.subject && e.subject.lessons) {
                                const classData = classMap.get(e.classId);
                                const lessonsWithSubject = e.subject.lessons.map((lesson: any) => ({
                                    ...lesson,
                                    subjectId: e.subject.id,
                                    subjectName: e.subject.name
                                }));
                                classData.lessons.push(...lessonsWithSubject);
                                if (classData.nextLesson === "Continue" && e.subject.lessons.length > 0) {
                                    classData.nextLesson = e.subject.lessons[0].title;
                                }
                            }
                        }
                        // If enrollment has only subject (no class), show as standalone
                        else if (e.subject) {
                            standaloneSubjects.push({
                                id: e.subject.id,
                                title: e.subject.name,
                                description: "Subject",
                                progress: 0,
                                nextLesson: e.subject.lessons?.[0]?.title || "Start Learning",
                                thumbnail: "bg-purple-500",
                                lessons: e.subject.lessons || []
                            });
                        }
                        // Legacy courseId enrollments
                        else if (e.courseId) {
                            standaloneSubjects.push({
                                id: e.courseId,
                                title: e.courseId,
                                description: "Legacy Course",
                                progress: 0,
                                nextLesson: "Continue",
                                thumbnail: "bg-slate-500",
                                lessons: []
                            });
                        }
                    });

                    return [...Array.from(classMap.values()), ...standaloneSubjects];
                })() || []
            },
            assignments: mappedAssignments,
            newBadge: null,
            stats: (() => {
                const uniqueClassIds = new Set<string>();
                profile.enrollments.forEach(e => {
                    if (e.classId) uniqueClassIds.add(e.classId);
                });

                return {
                    courses: uniqueClassIds.size,
                    assignmentsDue: mappedAssignments.filter(a => a.status === 'urgent' || a.status === 'pending').length,
                    avgGrade: 0,
                    badges: profile.badges.length
                };
            })()
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
    if (!userId) {
        console.error("getTeacherDashboardData: No userId provided");
        return null;
    }

    try {
        console.log("📊 [Teacher Dashboard] Step 1: Fetching user data for", userId);
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                teacherProfile: {
                    include: {
                        classes: {
                            include: {
                                students: true,
                                program: true
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

        if (!user) {
            console.error("getTeacherDashboardData: User not found for ID:", userId);
            return null;
        }

        console.log("📊 [Teacher Dashboard] Step 2: User found, has teacherProfile:", !!user.teacherProfile);

        // If no teacher profile exists, return empty dashboard
        if (!user.teacherProfile) {
            console.warn("getTeacherDashboardData: No teacherProfile for user:", user.email);
            return {
                name: user.name || "Teacher",
                role: "Teacher",
                subject: "Not Set",
                avatar: user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name || 'Teacher'}`,
                email: user.email,
                phone: user.phone,
                classes: [],
                gradingQueue: [],
                assignments: [],
                stats: {
                    totalStudents: 0,
                    activeClasses: 0,
                    pendingGrading: 0,
                    classAverage: 0
                }
            };
        }

        const profile = user.teacherProfile;
        console.log("📊 [Teacher Dashboard] Step 3: Profile found, classes count:", profile.classes.length);

        // Calculate stats from real data
        const allStudentIds = new Set<string>();
        profile.classes.forEach(cls => {
            cls.students.forEach(enrollment => allStudentIds.add(enrollment.studentId));
        });
        const totalStudents = allStudentIds.size;

        const activeClasses = profile.classes.length;
        const pendingGrading = profile.assignments.reduce((acc, asg) =>
            acc + asg.submissions.filter(s => s.grade === null).length, 0);

        console.log("📊 [Teacher Dashboard] Step 4: Stats calculated, mapping", profile.classes.length, "classes");

        // Map classes to UI structure with next session calculation
        const mappedClasses = await Promise.all(profile.classes.map(async (cls, index) => {
            try {
                console.log(`📊 [Teacher Dashboard] Step 4.${index + 1}: Mapping class ${cls.name}`);
                const uniqueClassStudentIds = new Set(cls.students.map(e => e.studentId));

                // Calculate next session
                const nextSessionDate = await getNextSession(cls.id);
                const formatted = formatNextSession(nextSessionDate);

                const nextSession = formatted
                    ? `${formatted.day} ${formatted.time}`
                    : "No upcoming sessions";

                // Calculate per-class average grade
                const classStudentIds = Array.from(uniqueClassStudentIds);

                const gradedSubmissions = await prisma.assignmentSubmission.findMany({
                    where: {
                        studentId: { in: classStudentIds },
                        grade: { not: null }
                    },
                    select: { grade: true }
                });

                let avgGrade = 0;
                let gradedCount = 0;
                if (gradedSubmissions.length > 0) {
                    const totalGrades = gradedSubmissions.reduce((sum, s) => sum + (s.grade || 0), 0);
                    gradedCount = gradedSubmissions.length;
                    avgGrade = Math.round(totalGrades / gradedCount);
                }

                console.log(`📊 [Teacher Dashboard] Step 4.${index + 1}: Class ${cls.name} mapped successfully`);
                return {
                    id: cls.id,
                    name: cls.name,
                    subject: (cls as any).program?.name || "General",
                    students: uniqueClassStudentIds.size,
                    avgGrade,
                    gradedCount,
                    nextSession
                };
            } catch (classError) {
                console.error(`❌ Error mapping class ${cls.name}:`, classError);
                throw classError;
            }
        }));

        console.log("📊 [Teacher Dashboard] Step 5: All classes mapped, building grading queue");

        // Map submissions to grading queue with urgency sorting
        const now = new Date();
        const gradingQueue = profile.assignments
            .flatMap(asg =>
                asg.submissions
                    .filter(s => s.grade === null)
                    .map(sub => {
                        const daysOld = Math.floor(
                            (now.getTime() - sub.submittedAt.getTime()) / (1000 * 60 * 60 * 24)
                        );
                        const isUrgent = daysOld > 3;

                        return {
                            id: sub.id,
                            studentName: sub.student?.user?.name || "Student",
                            assignment: asg.title,
                            submitted: daysOld === 0 ? 'Today' :
                                daysOld === 1 ? '1 day ago' :
                                    `${daysOld} days ago`,
                            daysOld,
                            isUrgent,
                            status: isUrgent ? 'urgent' : 'pending'
                        };
                    })
            )
            .sort((a, b) => {
                if (a.isUrgent !== b.isUrgent) return a.isUrgent ? -1 : 1;
                return b.daysOld - a.daysOld;
            })
            .slice(0, 10);

        console.log("📊 [Teacher Dashboard] Step 6: Grading queue built, returning data");

        return {
            name: user.name || "Teacher",
            role: "Teacher",
            subject: profile.specialty || "Education",
            avatar: user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name || 'Teacher'}`,
            email: user.email,
            phone: user.phone,
            classes: mappedClasses,
            gradingQueue: gradingQueue,
            assignments: profile.assignments || [],
            stats: {
                totalStudents,
                activeClasses,
                pendingGrading,
                classAverage: 0
            }
        };

    } catch (error) {
        console.error("❌ Error fetching teacher dashboard:", error);
        console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');

        // SAFE FALLBACK: Return empty/dummy data instead of null to prevent 500 error
        return {
            name: "Teacher (Fallback)",
            role: "Teacher",
            subject: "Education",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=fallback",
            email: "teacher@example.com",
            phone: null,
            classes: [],
            gradingQueue: [],
            assignments: [],
            stats: {
                totalStudents: 0,
                activeClasses: 0,
                pendingGrading: 0,
                classAverage: 0
            },
            _debug_error: error instanceof Error ? error.message : String(error),
            _debug_stack: error instanceof Error ? error.stack : undefined
        };
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



export async function getStudentProfile(userId: string) {
    if (!userId) return null;

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                studentProfile: {
                    include: {
                        enrollments: {
                            include: {
                                class: true
                            }
                        },
                        badges: {
                            orderBy: { earnedAt: 'desc' }
                        },
                        progress: {
                            where: { status: 'COMPLETED' },
                            orderBy: { completedAt: 'desc' },
                            take: 10
                        },
                        submissions: {
                            where: { grade: { not: null } },
                            include: {
                                assignment: true
                            },
                            orderBy: { submittedAt: 'desc' }
                        }
                    }
                }
            }
        });

        if (!user || !user.studentProfile) return null;

        const profile = user.studentProfile;
        const levelStats = getLevel(profile.xp);

        // Calculate GPA
        const gradedSubmissions = profile.submissions.filter(s => s.grade !== null);
        let gpa = 0.0;
        if (gradedSubmissions.length > 0) {
            const sum = gradedSubmissions.reduce((acc, curr) => acc + (curr.grade || 0), 0);
            const avg = sum / gradedSubmissions.length;
            gpa = Number((avg / 25).toFixed(2)); // 100 -> 4.0
        }

        // Total lessons available (would need to query Lesson table if we had it)
        // For now, we'll use completed count
        const totalLessonsCompleted = profile.progress.length;

        // Completion rate (simplified)
        const completionRate = profile.enrollments.length > 0
            ? Math.round((totalLessonsCompleted / (profile.enrollments.length * 10)) * 100) // Assume 10 lessons per enrollment
            : 0;

        // Map badges with details
        const badgeShowcase = profile.badges.map((earned: any) => {
            const badgeDef = BADGES.find(b => b.code === earned.badgeCode);
            return {
                code: earned.badgeCode,
                name: badgeDef?.name || earned.badgeCode,
                description: badgeDef?.description || '',
                icon: badgeDef?.icon || '🏆',
                earnedAt: earned.earnedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            };
        });

        // Recent activity (quiz results)
        const recentActivity = profile.progress.map((progress: any) => ({
            lessonId: progress.lessonId,
            score: progress.score,
            status: progress.status,
            completedAt: progress.completedAt?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) || 'N/A'
        }));

        return {
            personalInfo: {
                id: user.id,
                name: user.name || 'Student',
                email: user.email || '',
                avatar: user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name || 'User'}`,
                gradeLevel: profile.gradeLevel,
                joinedAt: user.createdAt.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            },
            stats: {
                totalXP: profile.xp,
                currentLevel: levelStats.level,
                levelProgress: levelStats.progress,
                gpa: gpa,
                badgeCount: profile.badges.length,
                completionRate: completionRate,
                coursesEnrolled: profile.enrollments.length,
                lessonsCompleted: totalLessonsCompleted
            },
            badges: badgeShowcase,
            recentActivity: recentActivity
        };

    } catch (error) {
        console.error("Error fetching student profile:", error);
        return null;
    }
}

// LIVE CLASS FUNCTIONS

export async function createLiveClass(teacherId: string, data: {
    title: string;
    description?: string;
    classId?: string;
    zoomLink: string;
    meetingId?: string;
    passcode?: string;
    scheduledAt: Date;
    duration: number;
}) {
    try {
        const liveClass = await prisma.liveClass.create({
            data: {
                teacherId,
                ...data
            }
        });
        return { success: true, liveClass };
    } catch (error) {
        console.error("Error creating live class:", error);
        return { success: false, error: "Failed to create live class" };
    }
}

export async function getTeacherLiveClasses(teacherId: string) {
    try {
        const liveClasses = await prisma.liveClass.findMany({
            where: { teacherId },
            orderBy: { scheduledAt: 'asc' },
            include: {
                class: true
            }
        });

        return liveClasses.map(lc => ({
            id: lc.id,
            title: lc.title,
            description: lc.description,
            className: lc.class?.name || 'General',
            zoomLink: lc.zoomLink,
            meetingId: lc.meetingId,
            passcode: lc.passcode,
            scheduledAt: lc.scheduledAt.toISOString(),
            duration: lc.duration,
            status: lc.status
        }));
    } catch (error) {
        console.error("Error fetching teacher live classes:", error);
        return [];
    }
}

export async function getStudentLiveClasses(userId: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                studentProfile: {
                    include: {
                        enrollments: {
                            include: {
                                class: {
                                    include: {
                                        liveClasses: {
                                            where: {
                                                scheduledAt: { gte: new Date() },
                                                status: 'SCHEDULED'
                                            },
                                            orderBy: { scheduledAt: 'asc' },
                                            include: {
                                                teacher: {
                                                    include: {
                                                        user: true
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!user || !user.studentProfile) return [];

        // Flatten live classes from all enrolled classes
        const liveClasses = user.studentProfile.enrollments.flatMap(
            enrollment => enrollment.class?.liveClasses || []
        );

        return liveClasses.map(lc => ({
            id: lc.id,
            title: lc.title,
            description: lc.description,
            teacherName: lc.teacher.user.name || 'Teacher',
            zoomLink: lc.zoomLink,
            scheduledAt: lc.scheduledAt.toISOString(),
            duration: lc.duration,
            status: lc.status
        }));
    } catch (error) {
        console.error("Error fetching student live classes:", error);
        return [];
    }
}

