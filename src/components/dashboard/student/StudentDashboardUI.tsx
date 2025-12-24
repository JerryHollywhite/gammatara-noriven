"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
    BookOpen, Clock, Award, TrendingUp,
    ChevronRight, Bell, PlayCircle
} from "lucide-react";

// Types
interface DashboardData {
    profile: {
        name: string;
        gradeLevel: string;
        xp: number;
        level: number;
        levelProgress: number;
        currentLevelXp: number;
        nextLevelXp: number;
        avatar: string;
    };
    stats: {
        courses: number;
        assignmentsDue: number;
        avgGrade: number;
        badges: number;
    };
}

export default function StudentDashboardUI() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/student/dashboard')
            .then(res => res.json())
            .then(json => {
                if (json.success) setData(json.data);
                setLoading(false);
            })
            .catch(err => setLoading(false));
    }, []);

    if (loading) return <div className="min-h-screen pt-24 flex items-center justify-center text-slate-400">Loading your HQ...</div>;
    if (!data) return <div className="min-h-screen pt-24 flex items-center justify-center text-red-400">Failed to load dashboard.</div>;

    const { profile, stats } = data;

    // Hardcoded for lists for now (Hybrid Approach) until lists are fully dynamically mocked
    const MOCK_COURSES = [
        { id: 1, title: "Mathematics: Algebra II", progress: 75, nextLesson: "Quadratic Equations", thumbnail: "bg-blue-100" },
        { id: 2, title: "English Literature", progress: 40, nextLesson: "Shakespeare's Sonnets", thumbnail: "bg-amber-100" },
        { id: 3, title: "Physics: Mechanics", progress: 90, nextLesson: "Newton's Laws Review", thumbnail: "bg-indigo-100" },
    ];

    const MOCK_ASSIGNMENTS = [
        { id: 1, title: "Algebra Mid-Term", course: "Mathematics", due: "Tomorrow, 23:59", status: "urgent" },
        { id: 2, title: "Essay: Hamlet Analysis", course: "English Lit", due: "Dec 30", status: "pending" },
        { id: 3, title: "Lab Report: Friction", course: "Physics", due: "Submitted", status: "completed" },
    ];

    const MOCK_BADGES = [
        { id: 1, name: "Fast Learner", icon: "🚀" },
        { id: 2, name: "Math Whiz", icon: "➗" },
        { id: 3, name: "Week Warrior", icon: "🔥" },
    ];

    return (
        <div className="min-h-screen relative font-sans text-slate-800 bg-slate-100">
            {/* Header Section with Gradient Accent - Placed absolutely with z-0 */}
            <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-b from-slate-900 to-slate-100 z-0" />

            {/* Content Wrapper - Relative and z-10 */}
            <div className="relative z-10 pt-28 pb-12 px-6 md:px-12">

                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 text-white">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Welcome back, <span className="text-yellow-400">{profile.name}</span>
                        </h1>
                        <p className="text-slate-300 mt-1 font-medium flex items-center gap-2">
                            <span className="bg-white/20 px-2 py-0.5 rounded text-xs">Level {profile.level}</span>
                            {profile.gradeLevel}
                        </p>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* XP Bar Widget */}
                        <div className="hidden md:flex flex-col items-end min-w-[160px]">
                            <div className="text-xs font-bold text-slate-300 mb-1">
                                XP Progress <span className="text-yellow-400">({profile.currentLevelXp}/{profile.nextLevelXp})</span>
                            </div>
                            <div className="w-full h-2.5 bg-slate-700/50 rounded-full overflow-hidden backdrop-blur-sm border border-white/10">
                                <div
                                    className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(250,204,21,0.5)]"
                                    style={{ width: `${profile.levelProgress}%` }}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <button className="p-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all relative border border-white/10">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-slate-900" />
                            </button>
                            <div className="relative group cursor-pointer">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                                <img
                                    src={profile.avatar}
                                    alt="Profile"
                                    className="relative w-12 h-12 rounded-full border-2 border-slate-900 object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: "Active Courses", value: stats.courses, icon: BookOpen, color: "text-blue-600", bg: "bg-blue-50" },
                        { label: "Assignments Due", value: stats.assignmentsDue, icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
                        { label: "Average Grade", value: `${stats.avgGrade}%`, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
                        { label: "Total Badges", value: stats.badges, icon: Award, color: "text-purple-600", bg: "bg-purple-50" }
                    ].map((stat, idx) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            key={idx}
                            className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/60 hover:shadow-md hover:border-slate-300 transition-all flex items-center gap-4"
                        >
                            <div className={`p-3.5 rounded-xl ${stat.bg} ${stat.color}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-800 tracking-tight">{stat.value}</p>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{stat.label}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* LEFT COL: Content (2/3) */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* My Courses */}
                        <section>
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-indigo-600" /> Current Studies
                                </h2>
                                <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700 hover:underline">View All Courses</button>
                            </div>
                            <div className="grid md:grid-cols-2 gap-5">
                                {MOCK_COURSES.map((course) => (
                                    <div key={course.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:translate-y-[-2px] transition-all group cursor-pointer relative overflow-hidden">
                                        <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-10 transition-transform group-hover:scale-110 ${course.thumbnail.replace('bg-', 'bg-')}`} />

                                        <div className="flex justify-between items-start mb-6">
                                            <div className={`w-12 h-12 rounded-xl ${course.thumbnail} flex items-center justify-center shadow-inner`}>
                                                <BookOpen className="w-6 h-6 text-slate-700/50" />
                                            </div>
                                        </div>

                                        <h3 className="font-bold text-lg text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">{course.title}</h3>
                                        <p className="text-xs text-slate-500 mb-4 font-medium uppercase tracking-wide">Next: {course.nextLesson}</p>

                                        {/* Progress Bar */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs font-bold">
                                                <span className="text-slate-400">Progress</span>
                                                <span className="text-slate-700">{course.progress}%</span>
                                            </div>
                                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-slate-900 rounded-full"
                                                    style={{ width: `${course.progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Recent Activity / Timeline */}
                        <section>
                            <h2 className="text-xl font-bold text-slate-800 mb-5 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-indigo-600" /> Learning Timeline
                            </h2>
                            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                                {[1, 2, 3].map((_, i) => (
                                    <div key={i} className="flex gap-4 relative group">
                                        <div className="flex flex-col items-center">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 border-2 border-white shadow-sm ${i === 0 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                                <PlayCircle className="w-4 h-4" />
                                            </div>
                                            {i !== 2 && <div className="w-0.5 h-full bg-slate-100 -my-2" />}
                                        </div>
                                        <div className="pb-8 group-last:pb-0">
                                            <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors cursor-pointer">Watched "Intro to Vectors"</p>
                                            <p className="text-xs text-slate-500 font-medium mt-0.5">Mathematics • 2 hours ago</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* RIGHT COL: Sidebar (1/3) */}
                    <div className="space-y-8">

                        {/* Assignments Widget */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center justify-between">
                                Pending Tasks
                                <span className="bg-red-50 text-red-600 text-xs px-2.5 py-1 rounded-md font-bold border border-red-100">2 Urgent</span>
                            </h3>
                            <div className="space-y-3">
                                {MOCK_ASSIGNMENTS.map((task) => (
                                    <div key={task.id} className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 hover:bg-white hover:shadow-md border border-transparent hover:border-slate-100 transition-all cursor-pointer group">
                                        <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 shadow-sm ${task.status === 'urgent' ? 'bg-red-500 animate-pulse' : task.status === 'completed' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-800 leading-snug group-hover:text-indigo-600 transition-colors">{task.title}</h4>
                                            <p className="text-xs text-slate-500 mt-1 font-medium">{task.course}</p>
                                            <div className={`text-[10px] font-bold mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded ${task.status === 'urgent' ? 'bg-red-100 text-red-600' : 'bg-slate-200 text-slate-500'}`}>
                                                <Clock className="w-3 h-3" /> {task.due}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full mt-6 py-3 text-sm font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 rounded-xl transition-colors border border-slate-200">
                                View All Assignments
                            </button>
                        </div>

                        {/* Gamification Widget */}
                        <div className="relative overflow-hidden bg-slate-900 rounded-2xl p-6 text-white shadow-xl">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                            <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="font-bold flex items-center gap-2 text-lg">
                                        <Award className="w-5 h-5 text-yellow-400" /> Trophy Room
                                    </h3>
                                    <span className="text-xs font-bold bg-white/10 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">Rank #4</span>
                                </div>

                                <div className="flex justify-between gap-2 mb-8 px-2">
                                    {MOCK_BADGES.map((badge) => (
                                        <div key={badge.id} className="flex flex-col items-center group cursor-pointer">
                                            <div className="w-14 h-14 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl flex items-center justify-center text-2xl mb-2 hover:scale-110 transition-transform border border-white/10 shadow-lg group-hover:shadow-indigo-500/20 backdrop-blur-sm">
                                                {badge.icon}
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-300 group-hover:text-white transition-colors">{badge.name}</span>
                                        </div>
                                    ))}
                                    <div className="flex flex-col items-center cursor-pointer group">
                                        <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-xs border border-dashed border-white/20 text-white/40 hover:text-white hover:border-white/50 transition-all">
                                            +3
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-500 group-hover:text-slate-300 transition-colors">More</span>
                                    </div>
                                </div>

                                <div className="bg-white/5 rounded-xl p-4 border border-white/10 backdrop-blur-sm">
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Weekly Challenge</p>
                                        <span className="text-xs font-bold text-yellow-400">2/3</span>
                                    </div>
                                    <p className="font-bold text-sm mb-3 text-white">Complete 3 Quizzes with &gt;80%</p>
                                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                        <div className="w-2/3 h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
