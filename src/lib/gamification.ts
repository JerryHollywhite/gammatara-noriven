
// Core Gamification Logic for TaraLMS

export const XP_TABLE = {
    LESSON_COMPLETE: 50,
    QUIZ_PERFECT: 100,
    QUIZ_PASS: 50,
    ASSIGNMENT_SUBMIT: 150,
    DAILY_LOGIN: 10
};

export const BADGES = [
    { code: "FIRST_STEPS", name: "First Steps", description: "Completed your first lesson", icon: "🚀" },
    { code: "MATH_WHIZ", name: "Math Whiz", description: "Scored 100% on 3 Math Quizzes", icon: "➗" },
    { code: "WEEK_WARRIOR", name: "Week Warrior", description: "Logged in 7 days in a row", icon: "🔥" },
    { code: "BOOKWORM", name: "Bookworm", description: "Completed 5 Reading assignments", icon: "📚" }
];

export function getLevel(xp: number): { level: number; currentLevelXp: number; nextLevelXp: number; progress: number } {
    // Simple formula: Level N requires N * 1000 XP total? 
    // Let's use a non-linear curve: Level = sqrt(XP / 100) roughly.
    // Level 1: 0-1000
    // Level 2: 1001-2500
    // Level 3: 2501-4500

    let level = 1;
    let required = 1000;

    while (xp >= required) {
        xp -= required;
        level++;
        required = Math.floor(required * 1.2); // Each level takes 20% more XP
    }

    return {
        level,
        currentLevelXp: xp,
        nextLevelXp: required,
        progress: Math.floor((xp / required) * 100)
    };
}

export function checkBadges(userStats: any) {
    const earned = [];

    if (userStats.lessonsCompleted >= 1) earned.push("FIRST_STEPS");
    if (userStats.mathPerfectScores >= 3) earned.push("MATH_WHIZ");
    if (userStats.streak >= 7) earned.push("WEEK_WARRIOR");

    return earned;
}
