"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
    Users, BookOpen, CheckSquare, MessageSquare,
    Plus, Search, MoreVertical, Calendar,
    BarChart3, AlertTriangle, FileText
} from "lucide-react";

interface TeacherData {
    name: string;
    role: string;
    subject: string;
    avatar: string;
    classes: any[];
    gradingQueue: any[];
    stats: any;
}

export default function TeacherDashboardUI() {
    const [data, setData] = useState<TeacherData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/teacher/dashboard')
            .then(res => res.json())
            .then(json => {
                if (json.success) setData(json.data);
                setLoading(false);
            })
            .catch(err => setLoading(false));
    }, []);

    if (loading) return <div className="min-h-screen pt-24 flex items-center justify-center text-slate-400">Loading Class Data...</div>;
    if (!data) return <div className="min-h-screen pt-24 flex items-center justify-center text-red-400">Failed to load dashboard.</div>;

    const { name, avatar, classes, gradingQueue, stats } = data;

    return (
        <div className="min-h-screen bg-slate-100 pt-24 pb-12 px-6 md:px-12 font-sans text-slate-800">
            {/* Header Gradient */}
            <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-900 -z-10" />

            <header className="flex items-center justify-between mb-10 text-white">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Teacher Dashboard
                    </h1>
                    <p className="text-indigo-200 mt-1 flex items-center gap-2">
                        <span className="bg-white/10 px-2 py-0.5 rounded text-xs border border-white/10">Senior Instructor</span>
                        Welcome, {name}. Ready to inspire?
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <button className="bg-indigo-500 hover:bg-indigo-400 text-white px-5 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5">
                        <Plus className="w-4 h-4" /> Create Class
                    </button>
                    <div className="relative group cursor-pointer">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full opacity-75 group-hover:opacity-100 transition duration-200 blur-sm"></div>
                        <img
                            src={avatar}
                            alt="Profile"
                            className="relative w-12 h-12 rounded-full border-2 border-indigo-900 object-cover"
                        />
                    </div>
                </div>
            </header>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-10">
                {[
                    { label: "Total Students", value: stats.totalStudents, badge: "+3 New", badgeColor: "bg-emerald-100 text-emerald-700", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Active Classes", value: stats.activeClasses, icon: BookOpen, color: "text-purple-600", bg: "bg-purple-50" },
                    { label: "Pending Grades", value: stats.pendingGrading, badge: "Urgent", badgeColor: "bg-red-100 text-red-600", icon: CheckSquare, color: "text-orange-600", bg: "bg-orange-50" },
                    { label: "Class Average", value: `${stats.classAverage}%`, icon: BarChart3, color: "text-emerald-600", bg: "bg-emerald-50" },
                ].map((stat, idx) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={idx}
                        className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg hover:border-indigo-100 transition-all group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            {stat.badge && (
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${stat.badgeColor}`}>
                                    {stat.badge}
                                </span>
                            )}
                        </div>
                        <p className="text-3xl font-bold text-slate-800 tracking-tight">{stat.value}</p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mt-1">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT: Classes & Schedule (2/3) */}
                <div className="lg:col-span-2 space-y-8">
                    <section>
                        <h2 className="text-xl font-bold text-slate-800 mb-5 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-indigo-600" /> My Classes
                        </h2>
                        <div className="grid md:grid-cols-2 gap-5">
                            {classes.map((cls: any) => (
                                <div key={cls.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:translate-y-[-4px] hover:border-indigo-200 transition-all cursor-pointer group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full opacity-50 group-hover:scale-125 transition-transform" />

                                    <div className="flex justify-between items-start mb-6 relative">
                                        <div>
                                            <h3 className="font-bold text-slate-800 text-lg group-hover:text-indigo-600 transition-colors">{cls.name}</h3>
                                            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">{cls.subject}</p>
                                        </div>
                                        <button className="p-1 hover:bg-slate-100 rounded-full text-slate-400"><MoreVertical className="w-5 h-5" /></button>
                                    </div>

                                    <div className="flex items-center gap-6 text-sm text-slate-500 mb-6 relative">
                                        <span className="flex items-center gap-1.5 font-medium"><Users className="w-4 h-4 text-indigo-400" /> {cls.students} Students</span>
                                        <span className="flex items-center gap-1.5 font-medium"><BarChart3 className="w-4 h-4 text-emerald-400" /> Avg: {cls.avgGrade}%</span>
                                    </div>

                                    <div className="pt-4 border-t border-slate-100 flex justify-between items-center relative">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                            <Calendar className="w-3 h-3" /> Next: <span className="text-slate-600">{cls.nextSession}</span>
                                        </span>
                                        <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors">Manage Class</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* RIGHT: Grading & Attention (1/3) */}
                <div className="space-y-8">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center justify-between">
                            <span className="flex items-center gap-2"><CheckSquare className="w-5 h-5 text-indigo-600" /> Grading Queue</span>
                            <span className="bg-indigo-50 text-indigo-600 text-xs px-2.5 py-1 rounded-md font-bold">{gradingQueue.length} Pending</span>
                        </h3>
                        <div className="space-y-1">
                            {gradingQueue.map((item: any, i: number) => (
                                <div key={item.id} className="p-3 hover:bg-slate-50 rounded-xl transition-all cursor-pointer border border-transparent hover:border-slate-100 group">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-bold text-slate-700 text-sm group-hover:text-indigo-600 transition-colors">{item.student}</span>
                                        <span className="text-[10px] text-slate-400 font-mono">{item.submitted}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 mb-3">{item.assignment}</p>
                                    <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                        <button className="px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 shadow-sm shadow-indigo-200">Grade Now</button>
                                        <button className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-200">Preview</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-6 text-center text-sm font-bold text-slate-500 hover:text-indigo-600 py-2 border-t border-slate-50 hover:bg-slate-50 transition-colors">View All Submissions</button>
                    </div>

                    <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100/50 shadow-sm">
                        <h3 className="text-lg font-bold text-amber-900 mb-3 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-amber-600" /> Needs Attention
                        </h3>
                        <p className="text-sm text-amber-800/80 mb-4 leading-relaxed">
                            3 students in <b className="text-amber-900">Algebra II</b> have fallen below 70% participation this week.
                        </p>
                        <button className="w-full bg-white text-amber-700 font-bold py-2.5 rounded-xl text-sm hover:bg-amber-100 border border-amber-200 shadow-sm transition-colors">
                            View Performance Report
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
