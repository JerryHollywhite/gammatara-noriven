
// src/lib/data-service.ts
import { getLevel } from "./gamification";

/*
    This service abstracts the data source.
    Currently it returns MOCK data.
    Later, we will uncomment the Prisma calls.
*/

const MOCK_STUDENT_PROFILE = {
    id: "student_1",
    name: "Jerry Otomasikan", // From User table
    gradeLevel: "12 (SMA)",
    xp: 4500,
    streakDays: 5,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jerry",
    enrollments: [
        { courseId: "SMA_MATH", status: "ACTIVE", progress: 65 },
        { courseId: "SMA_PHYSICS", status: "ACTIVE", progress: 40 }
    ],
    recentActivity: [
        { type: "LESSON", title: "Intro to Vectors", date: new Date().toISOString() },
        { type: "QUIZ", title: "Algebra Quiz 1", score: 90, date: new Date(Date.now() - 86400000).toISOString() }
    ]
};

export async function getStudentDashboardData(userId: string) {
    // SIMULATED DB DELAY
    await new Promise(resolve => setTimeout(resolve, 500));

    // REAL IMPL (Future):
    // const profile = await prisma.studentProfile.findUnique({ ... })

    // MOCK IMPL:
    const levelStats = getLevel(MOCK_STUDENT_PROFILE.xp);

    return {
        profile: {
            ...MOCK_STUDENT_PROFILE,
            level: levelStats.level,
            levelProgress: levelStats.progress,
            nextLevelXp: levelStats.nextLevelXp,
            currentLevelXp: levelStats.currentLevelXp
        },
        stats: {
            courses: MOCK_STUDENT_PROFILE.enrollments.length,
            assignmentsDue: 2, // Mock
            avgGrade: 92, // Mock
            badges: 15 // Mock
        }
    };
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
