"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    User, Trophy, Target, TrendingUp, Award,
    Calendar, CheckCircle, Star, Zap
} from "lucide-react";
import UnifiedProfileEditor from "./UnifiedProfileEditor";

interface ProfileData {
    personalInfo: {
        id: string;
        name: string;
        email: string;
        avatar: string;
        gradeLevel: string;
        joinedAt: string;
        phone: string | null;
    };
    stats: {
        totalXP: number;
        currentLevel: number;
        levelProgress: number;
        gpa: number;
        badgeCount: number;
        completionRate: number;
        coursesEnrolled: number;
        lessonsCompleted: number;
    };
    badges: Array<{
        code: string;
        name: string;
        description: string;
        icon: string;
        earnedAt: string;
    }>;
    recentActivity: Array<{
        lessonId: string;
        score: number;
        status: string;
        completedAt: string;
    }>;
}

export default function StudentProfilePage() {
    const [data, setData] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/student/profile')
            .then(res => res.json())
            .then(json => {
                if (json.success) setData(json.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center text-slate-400">
                <Zap className="w-8 h-8 animate-spin" />
                <span className="ml-3">Loading Profile...</span>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center text-red-400">
                Failed to load profile data.
            </div>
        );
    }

    const statsCards = [
        { label: "Total XP", value: data.stats.totalXP.toLocaleString(), icon: Zap, color: "text-yellow-600", bg: "bg-yellow-50" },
        { label: "Current GPA", value: data.stats.gpa.toFixed(2), icon: Star, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Badges Earned", value: data.stats.badgeCount, icon: Award, color: "text-purple-600", bg: "bg-purple-50" },
        { label: "Completion Rate", value: `${data.stats.completionRate}%`, icon: Target, color: "text-emerald-600", bg: "bg-emerald-50" },
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
            {/* Header Gradient */}
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 z-0" />

            {/* Content */}
            <div className="relative z-10 pt-28 pb-12 px-6 md:px-12">
                {/* Profile Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl p-8 shadow-xl border border-slate-200 mb-10"
                >
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full blur-sm opacity-75"></div>
                            <img
                                src={data.personalInfo.avatar}
                                alt={data.personalInfo.name}
                                className="relative w-32 h-32 rounded-full border-4 border-white object-cover"
                            />
                            {/* Level Badge */}
                            <div className="absolute bottom-0 right-0 bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-bold border-2 border-white shadow-lg">
                                Lvl {data.stats.currentLevel}
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-3xl font-bold text-slate-800 mb-1">{data.personalInfo.name}</h1>
                            <p className="text-slate-500 mb-3">{data.personalInfo.gradeLevel}</p>
                            <div className="flex items-center gap-3 justify-center md:justify-start text-sm text-slate-400">
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    Joined {data.personalInfo.joinedAt}
                                </span>
                            </div>
                        </div>

                        {/* XP Progress */}
                        <div className="w-full md:w-64">
                            <div className="flex justify-between text-sm text-slate-600 mb-2">
                                <span className="font-bold">Level {data.stats.currentLevel}</span>
                                <span>{data.stats.levelProgress}%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                                    style={{ width: `${data.stats.levelProgress}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Unified Profile Editor - Collapsible */}
                    <div className="mt-8 pt-8 border-t border-slate-100">
                        <div className="flex items-center justify-between mb-4 cursor-pointer" onClick={() => document.getElementById('editor-section')?.classList.toggle('hidden')}>
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <User className="w-5 h-5 text-indigo-600" /> Edit Profile
                            </h2>
                            <span className="text-xs text-indigo-600 font-bold bg-indigo-50 px-3 py-1 rounded-full">Manage settings</span>
                        </div>
                        <div id="editor-section" className="hidden transition-all">
                            <UnifiedProfileEditor
                                initialData={{
                                    name: data.personalInfo.name,
                                    email: data.personalInfo.email,
                                    phone: data.personalInfo.phone,
                                    image: data.personalInfo.avatar,
                                    role: "STUDENT"
                                }}
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                    {statsCards.map((stat, idx) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            key={idx}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg hover:border-indigo-100 transition-all text-center"
                        >
                            <div className={`w-14 h-14 mx-auto rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-3`}>
                                <stat.icon className="w-7 h-7" />
                            </div>
                            <p className="text-3xl font-bold text-slate-800 mb-1">{stat.value}</p>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Badge Showcase */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200"
                    >
                        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <Trophy className="w-6 h-6 text-yellow-500" />
                            Badge Collection
                        </h2>
                        {data.badges.length > 0 ? (
                            <div className="grid grid-cols-2 gap-4">
                                {data.badges.map((badge, i) => (
                                    <div
                                        key={i}
                                        className="p-4 rounded-xl border-2 border-slate-100 hover:border-yellow-200 hover:bg-yellow-50/50 transition-all group"
                                    >
                                        <div className="text-4xl mb-2 text-center group-hover:scale-110 transition-transform">
                                            {badge.icon}
                                        </div>
                                        <h3 className="font-bold text-slate-700 text-sm text-center mb-1">{badge.name}</h3>
                                        <p className="text-xs text-slate-500 text-center mb-2">{badge.description}</p>
                                        <p className="text-xs text-slate-400 text-center">{badge.earnedAt}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 text-center text-slate-400">
                                <Trophy className="w-16 h-16 mx-auto mb-3 text-slate-200" />
                                <p>No badges earned yet. Keep learning!</p>
                            </div>
                        )}
                    </motion.div>

                    {/* Recent Activity */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200"
                    >
                        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <TrendingUp className="w-6 h-6 text-indigo-600" />
                            Recent Activity
                        </h2>
                        {data.recentActivity.length > 0 ? (
                            <div className="space-y-3">
                                {data.recentActivity.map((activity, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activity.score >= 90 ? 'bg-emerald-100 text-emerald-600' :
                                            activity.score >= 70 ? 'bg-blue-100 text-blue-600' :
                                                'bg-amber-100 text-amber-600'
                                            }`}>
                                            <CheckCircle className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-slate-700 text-sm">Quiz Completed</p>
                                            <p className="text-xs text-slate-500">{activity.completedAt}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-lg text-slate-800">{activity.score}%</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 text-center text-slate-400">
                                <TrendingUp className="w-16 h-16 mx-auto mb-3 text-slate-200" />
                                <p>No activity yet. Start a quiz!</p>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div >
        </div >
    );
}
