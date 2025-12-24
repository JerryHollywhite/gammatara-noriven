"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
    User, Calendar, FileText, CheckCircle,
    XCircle, MessageCircle, CreditCard, ChevronDown
} from "lucide-react";

interface ParentData {
    name: string;
    children: any[];
}

export default function ParentDashboardUI() {
    const [data, setData] = useState<ParentData | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedChildIndex, setSelectedChildIndex] = useState(0);

    useEffect(() => {
        fetch('/api/parent/dashboard')
            .then(res => res.json())
            .then(json => {
                if (json.success) setData(json.data);
                setLoading(false);
            })
            .catch(err => setLoading(false));
    }, []);

    if (loading) return <div className="min-h-screen pt-24 flex items-center justify-center text-slate-400">Loading Family Data...</div>;
    if (!data) return <div className="min-h-screen pt-24 flex items-center justify-center text-red-400">Failed to load dashboard.</div>;

    if (data.children.length === 0) {
        return (
            <div className="min-h-screen pt-24 flex flex-col items-center justify-center text-slate-500 gap-4">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-slate-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-700">No Students Linked</h2>
                <p className="max-w-md text-center text-sm">
                    It seems there are no students linked to your parent account yet.
                    Please contact the school administration to link your children's profiles.
                </p>
                <div className="flex gap-3 mt-4">
                    <button className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-sm">Contact Support</button>
                </div>
            </div>
        );
    }

    const currentChild = data.children[selectedChildIndex];

    return (
        <div className="min-h-screen relative font-sans text-slate-800 bg-slate-100">
            {/* Header Gradient - Placed absolutely with z-0 */}
            <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 z-0" />

            {/* Content Wrapper - Relative and z-10 to sit on top of gradient */}
            <div className="relative z-10 pt-28 pb-12 px-6 md:px-12">

                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 text-white">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Parent Portal
                        </h1>
                        <p className="text-indigo-200 mt-1 font-medium">Monitor {currentChild.name}'s progress and stay connected.</p>
                    </div>

                    {/* Child Switcher */}
                    <div className="relative group z-20">
                        <div className="bg-white/10 backdrop-blur-md p-1.5 pr-5 rounded-full border border-white/20 flex items-center gap-3 cursor-pointer hover:bg-white/20 transition-all">
                            <img src={currentChild.avatar} className="w-10 h-10 rounded-full border-2 border-indigo-400" />
                            <div className="text-left">
                                <p className="text-sm font-bold text-white">{currentChild.name}</p>
                                <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-wide">{currentChild.grade}</p>
                            </div>
                            <ChevronDown className="w-4 h-4 text-white/70" />
                        </div>
                        {/* Switcher Dropdown */}
                        <div className="absolute top-full right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl shadow-slate-900/20 border border-slate-100 p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right scale-95 group-hover:scale-100">
                            <p className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Select Child</p>
                            {data.children.map((child, idx) => (
                                <div
                                    key={child.id}
                                    onClick={() => setSelectedChildIndex(idx)}
                                    className={`p-3 rounded-xl cursor-pointer flex items-center gap-3 hover:bg-slate-50 transition-colors ${selectedChildIndex === idx ? 'bg-indigo-50 border border-indigo-100' : 'border border-transparent'}`}
                                >
                                    <img src={child.avatar} className="w-8 h-8 rounded-full" />
                                    <div>
                                        <span className={`text-sm font-bold block ${selectedChildIndex === idx ? 'text-indigo-700' : 'text-slate-700'}`}>{child.name}</span>
                                        <span className="text-xs text-slate-500">{child.grade}</span>
                                    </div>
                                    {selectedChildIndex === idx && <CheckCircle className="w-4 h-4 text-indigo-600 ml-auto" />}
                                </div>
                            ))}
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* LEFT: Main Child Stats (2/3) */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                            {[
                                { label: "Attendance", value: `${currentChild.stats.attendance}%`, color: "text-emerald-600", bg: "bg-emerald-50", icon: CheckCircle },
                                { label: "Current GPA", value: currentChild.stats.gpa, color: "text-blue-600", bg: "bg-blue-50", icon: FileText },
                                { label: "Class Rank", value: currentChild.stats.ranking, color: "text-purple-600", bg: "bg-purple-50", icon: User },
                                { label: "Next Exam", value: "Dec 12", sub: currentChild.stats.nextExam, color: "text-orange-600", bg: "bg-orange-50", icon: Calendar }
                            ].map((stat, i) => (
                                <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg hover:border-indigo-100 transition-all text-center group">
                                    <div className={`w-12 h-12 mx-auto rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                                        <stat.icon className="w-6 h-6" />
                                    </div>
                                    <div className="text-3xl font-bold text-slate-800 mb-1 tracking-tight">{stat.value}</div>
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Performance Trends (Mock Chart Area) */}
                        <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-800">Academic Performance</h2>
                                    <p className="text-sm text-slate-500">GPA Trend over the last 6 months</p>
                                </div>
                                <select className="bg-slate-50 border border-slate-200 rounded-xl text-sm px-4 py-2 font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500/20">
                                    <option>This Semester</option>
                                    <option>Last Year</option>
                                </select>
                            </div>
                            <div className="h-64 flex items-end justify-between gap-4 px-2">
                                {/* Mock Bars */}
                                {[60, 75, 82, 88, 95, 92].map((h, i) => (
                                    <div key={i} className="w-full relative group h-full flex flex-col justify-end">
                                        <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-bold py-1 px-2 rounded-lg transition-opacity mb-2">
                                            {h}%
                                        </div>
                                        <div
                                            className="w-full bg-indigo-50 rounded-t-xl relative overflow-hidden transition-all duration-500 group-hover:bg-indigo-100"
                                            style={{ height: `${h}%` }}
                                        >
                                            <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-indigo-500 to-indigo-400 opacity-80" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between mt-4 text-xs font-bold text-slate-400 uppercase tracking-widest px-2">
                                <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                            </div>
                        </section>

                        {/* Recent Grades */}
                        <section>
                            <h2 className="text-xl font-bold text-slate-800 mb-5 text-indigo-900 flex items-center gap-2">
                                <FileText className="w-5 h-5" /> Recent Grades
                            </h2>
                            <div className="bg-white rounded-3xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-sm">
                                {currentChild.recentGrades.length > 0 ? (
                                    currentChild.recentGrades.map((g: any, i: number) => (
                                        <div key={i} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors group cursor-default">
                                            <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                                    <FileText className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-800 text-lg">{g.subject}</h4>
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{g.type} • {g.date}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="font-black text-2xl text-slate-800 block">{g.grade}</span>
                                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${g.grade >= 90 ? 'text-emerald-600 bg-emerald-50' :
                                                    g.grade >= 70 ? 'text-blue-600 bg-blue-50' :
                                                        'text-red-600 bg-red-50'
                                                    }`}>
                                                    {g.grade >= 90 ? 'Excellent' : g.grade >= 70 ? 'Good' : 'Needs Work'}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-12 text-center text-slate-400">
                                        <FileText className="w-12 h-12 mx-auto mb-3 text-slate-200" />
                                        <p>No graded assignments yet.</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* RIGHT: Notices (1/3) */}
                    <div className="space-y-8">
                        <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-3xl p-6 border border-orange-100 shadow-sm">
                            <h3 className="font-bold text-orange-900 mb-4 flex items-center gap-2 text-lg">
                                <MessageCircle className="w-5 h-5 text-orange-600" /> Teacher Feedback
                            </h3>
                            <div className="bg-white p-5 rounded-2xl text-sm text-slate-700 mb-4 leading-relaxed shadow-sm italic relative">
                                <span className="absolute top-2 left-2 text-4xl text-orange-200 font-serif leading-none">"</span>
                                <span className="relative z-10">Jerry has shown great improvement in Algebra. However, please ensure he completes the homework on time.</span>
                            </div>
                            <div className="text-xs text-orange-800/70 font-bold text-right mb-4 uppercase tracking-widest">- Mr. Anderson</div>
                            <button className="w-full py-3 bg-white text-orange-600 font-bold text-sm rounded-xl hover:bg-orange-50 transition-colors border border-orange-200 shadow-sm">
                                Reply to Teacher
                            </button>
                        </div>

                        <div className="bg-white rounded-3xl p-8 shadow-lg shadow-slate-200/50 border border-slate-200 overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-full -z-10" />
                            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2 text-lg">
                                <CreditCard className="w-5 h-5 text-indigo-600" /> Tuition & Fees
                            </h3>
                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                                    <span className="text-sm font-medium text-slate-500">Status</span>
                                    <span className="text-xs font-bold bg-amber-100 text-amber-700 px-3 py-1 rounded-full">Pending</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-slate-500">Amount Due</span>
                                    <span className="font-black text-slate-900 text-2xl">Rp 750.000</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-slate-500">Due Date</span>
                                    <span className="font-bold text-slate-800">Jan 01, 2026</span>
                                </div>
                            </div>
                            <button className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 hover:scale-[1.02] transition-all shadow-xl shadow-slate-900/20">
                                Pay Tuition Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
