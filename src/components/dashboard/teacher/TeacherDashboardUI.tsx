"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Users, BookOpen, CheckSquare, MessageSquare,
    Plus, Search, MoreVertical, Calendar,
    BarChart3, AlertTriangle, FileText, Database, X, User, Trash2
} from "lucide-react";
import CreateAssignmentModal from "./CreateAssignmentModal";
import GradingModal from "./GradingModal";
import TeacherClassManager from "../../teacher/TeacherClassManager";
import SimpleClassCreator from "../../teacher/SimpleClassCreator";
import TeacherAssignmentsWidget from "../../teacher/TeacherAssignmentsWidget";

import TeacherLessonManager from "../../teacher/TeacherLessonManager";
import TeacherExamManager from "../../teacher/TeacherExamManager";
import UnifiedProfileEditor from "../../profile/UnifiedProfileEditor";
import SubjectManager from "../../teacher/SubjectManager";

interface TeacherData {
    name: string;
    role: string;
    subject: string;
    avatar: string;
    email?: string;
    phone?: string;
    classes: any[];
    gradingQueue: any[];
    assignments: any[];
    stats: any;
}

export default function TeacherDashboardUI({ data: initialData }: { data?: TeacherData }) {
    const [data, setData] = useState<TeacherData | null>(initialData || null);
    const [loading, setLoading] = useState(!initialData);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isGradingModalOpen, setIsGradingModalOpen] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState<{ id: string, studentName: string, assignment: string, submitted: string } | null>(null);

    // New Tool Modals
    const [isClassManagerOpen, setIsClassManagerOpen] = useState(false);
    const [editingClassId, setEditingClassId] = useState<string | null>(null);
    const [isLessonManagerOpen, setIsLessonManagerOpen] = useState(false);
    const [isExamManagerOpen, setIsExamManagerOpen] = useState(false);
    const [examClassId, setExamClassId] = useState<string | null>(null);
    const [isSubjectManagerOpen, setIsSubjectManagerOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false); // Profile Modal

    // ...



    const fetchDashboardData = () => {
        setLoading(true);
        fetch('/api/teacher/dashboard')
            .then(res => res.json())
            .then(json => {
                if (json.success) setData(json.data);
                setLoading(false);
            })
            .catch(err => setLoading(false));
    };

    // Silent refresh without loading overlay
    const fetchDashboardDataSilent = () => {
        fetch('/api/teacher/dashboard')
            .then(res => res.json())
            .then(json => {
                if (json.success) setData(json.data);
            })
            .catch(err => console.error('Silent refresh error:', err));
    };

    useEffect(() => {
        if (!initialData) {
            fetchDashboardData();
        }
    }, [initialData]);

    if (loading) return <div className="min-h-screen pt-24 flex items-center justify-center text-slate-400">Loading Dashboard...</div>;
    if (!data) return <div className="min-h-screen pt-24 flex items-center justify-center text-red-400">Failed to load dashboard.</div>;

    const { name, role, subject, avatar, classes, gradingQueue, stats, assignments, email, phone } = data;

    const handleGradeOpen = (item: any) => {
        setSelectedSubmission({
            id: item.id,
            studentName: item.studentName || item.student,
            assignment: item.assignment,
            submitted: item.submitted || new Date().toLocaleDateString()
        });
        setIsGradingModalOpen(true);
    };

    const handleDeleteClass = async (classId: string, className: string) => {
        if (!confirm(`Are you sure you want to delete class "${className}"? This action cannot be undone.`)) return;

        try {
            const res = await fetch(`/api/teacher/classes/${classId}`, { method: 'DELETE' });
            const json = await res.json();
            if (json.success) {
                alert("Class deleted successfully");
                // Optimistic update or reload
                setData(prev => prev ? {
                    ...prev,
                    classes: prev.classes.filter(c => c.id !== classId)
                } : null);
            } else {
                alert(json.error || "Failed to delete class");
            }
        } catch (e) {
            console.error(e);
            alert("An error occurred");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
            {/* Create Assignment Modal */}
            <CreateAssignmentModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreated={fetchDashboardDataSilent}
            />

            {/* Grading Modal */}
            {selectedSubmission && (
                <GradingModal
                    submission={selectedSubmission}
                    onClose={() => setSelectedSubmission(null)}
                    onGraded={fetchDashboardDataSilent} // Silent refresh after grading
                />
            )}

            {/* Class Manager Modal */}
            {isClassManagerOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className={`bg-white rounded-2xl p-6 relative animate-in fade-in zoom-in duration-200 overflow-y-auto
                        ${editingClassId
                            ? "w-[95vw] h-[90vh] max-w-7xl" // Full size for Manage
                            : "w-full max-w-2xl max-h-[90vh]" // Standard size for Create
                        }
                    `}>
                        <button onClick={() => { setIsClassManagerOpen(false); setEditingClassId(null); }} className="absolute top-4 right-4 p-2 bg-red-500 hover:bg-red-600 rounded-full text-white shadow-sm z-10 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                        {editingClassId ? (
                            <TeacherClassManager
                                classId={editingClassId}
                                onClassCreated={() => {
                                    setIsClassManagerOpen(false);
                                    setEditingClassId(null);
                                    fetchDashboardDataSilent(); // Silent refresh
                                }}
                                onDataChange={fetchDashboardDataSilent} // Silent refresh for schedule changes
                            />
                        ) : (
                            <SimpleClassCreator
                                onClassCreated={() => {
                                    setIsClassManagerOpen(false);
                                    fetchDashboardDataSilent(); // Silent refresh
                                }}
                            />
                        )}
                    </div>
                </div>
            )}

            {/* Loading Overlay (Global) */}
            {loading && (
                <div className="fixed inset-0 bg-white/80 z-[100] flex items-center justify-center backdrop-blur-sm">
                    <div className="flex flex-col items-center">
                        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-3"></div>
                        <p className="text-slate-600 font-bold">Please wait...</p>
                    </div>
                </div>
            )}

            {/* Exam Manager Modal */}
            {isExamManagerOpen && (
                <div className="fixed inset-0 bg-slate-100 z-50 flex flex-col">
                    {/* Full Screen Mode for Google Forms Vibe */}
                    <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm z-10">
                        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <AlertTriangle className="w-6 h-6 text-purple-600" />
                            Exam Creator {examClassId ? "(Class Mode)" : ""}
                        </h3>
                        <div className="flex items-center gap-2">
                            {examClassId && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-bold">Linked to Class</span>}
                            <button onClick={() => { setIsExamManagerOpen(false); setExamClassId(null); }} className="p-2 bg-red-500 hover:bg-red-600 rounded-full text-white shadow-sm transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto bg-purple-50/50 p-4 md:p-8">
                        <div className="max-w-4xl mx-auto pb-20">
                            <TeacherExamManager
                                subjectId={undefined}
                                classId={examClassId || undefined}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Profile Manager Modal */}
            <AnimatePresence>
                {isProfileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl"
                        >
                            <button onClick={() => setIsProfileOpen(false)} className="absolute top-6 right-6 z-10 p-2 bg-red-500 hover:bg-red-600 rounded-full text-white shadow-sm backdrop-blur-sm transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                            <UnifiedProfileEditor
                                initialData={{
                                    name: name,
                                    email: email || "",
                                    phone: phone || null,
                                    image: avatar,
                                    role: "TEACHER"
                                }}
                                onSave={fetchDashboardDataSilent}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header Gradient */}
            <div className="absolute top-0 left-0 w-full h-60 bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-900 z-0" />

            {/* Content Wrapper */}
            <div className="relative z-10 pt-16 pb-6 px-6 md:px-12">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 text-white">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Teacher Dashboard</h1>
                        <p className="text-indigo-200 mt-1 text-sm flex items-center gap-2">
                            <span className="bg-white/10 px-2 py-0.5 rounded text-xs border border-white/10">Senior Instructor</span>
                            Welcome, {name}. Ready to inspire?
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                        <button
                            onClick={() => {
                                setEditingClassId(null);
                                setIsClassManagerOpen(true);
                            }}
                            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-5 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 transition-all backdrop-blur-sm"
                        >
                            <Plus className="w-4 h-4" /> Create New Class
                        </button>
                        <button
                            onClick={() => {
                                setExamClassId(null);
                                setIsExamManagerOpen(true);
                            }}
                            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-5 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 transition-all backdrop-blur-sm"
                        >
                            <AlertTriangle className="w-4 h-4" /> Exams
                        </button>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="bg-indigo-500 hover:bg-indigo-400 text-white px-5 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5"
                        >
                            <Plus className="w-4 h-4" /> Create Assignment
                        </button>

                        <div
                            className="relative group cursor-pointer"
                            onClick={() => setIsProfileOpen(true)}
                        >
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full opacity-75 group-hover:opacity-100 transition duration-200 blur-sm"></div>
                            <img
                                src={avatar}
                                alt="Profile"
                                className="relative w-12 h-12 rounded-full border-2 border-indigo-900 object-cover"
                            />
                            <div className="absolute top-0 right-0 w-4 h-4 bg-indigo-500 rounded-full border-2 border-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <User className="w-2 h-2 text-white" />
                            </div>
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

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* LEFT COLUMN - Classes & Assignments */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Classes Section */}
                        <section>
                            <div className="flex justify-between items-end mb-6">
                                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-indigo-600" /> My Classes
                                </h2>
                                <Link href="#" className="text-sm font-bold text-indigo-600 hover:underline">View All</Link>
                            </div>
                            <div className="grid md:grid-cols-2 gap-5">
                                {classes.length > 0 ? classes.map((cls: any) => (
                                    <div key={cls.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:translate-y-[-4px] hover:border-indigo-200 transition-all cursor-pointer group relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full opacity-50 group-hover:scale-125 transition-transform" />

                                        <div className="flex justify-between items-start mb-6 relative">
                                            <div>
                                                <h3 className="font-bold text-slate-800 text-lg group-hover:text-indigo-600 transition-colors">{cls.name}</h3>
                                                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">{cls.subject}</p>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteClass(cls.id, cls.name);
                                                }}
                                                className="p-2 hover:bg-red-50 rounded-full text-slate-300 hover:text-red-500 transition-colors z-10"
                                                title="Delete Class"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>


                                        <div className="flex items-center gap-6 text-sm text-slate-500 mb-6 relative">
                                            <span className="flex items-center gap-1.5 font-medium"><Users className="w-4 h-4 text-indigo-400" /> {cls.students} Students</span>
                                            <span className="flex items-center gap-1.5 font-medium">
                                                <BarChart3 className="w-4 h-4 text-emerald-400" />
                                                {cls.gradedCount > 0 ? (
                                                    <span
                                                        className={`px-2 py-1 rounded text-white text-xs font-bold ${cls.avgGrade >= 80 ? 'bg-emerald-500' :
                                                            cls.avgGrade >= 60 ? 'bg-yellow-500' :
                                                                'bg-red-500'
                                                            }`}
                                                        title={` Calculated from ${cls.gradedCount} graded submission${cls.gradedCount > 1 ? 's' : ''}`}
                                                    >
                                                        Avg: {cls.avgGrade}%
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 text-xs italic">(No grades yet)</span>
                                                )}
                                            </span>
                                        </div>

                                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between relative">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                                <Calendar className="w-3 h-3" /> <span className="text-slate-600">{cls.nextSession}</span>
                                            </span>

                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/teacher/forum/${cls.id}`}
                                                    className="text-xs font-bold text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                                                >
                                                    <MessageSquare className="w-3 h-3" /> Forum
                                                </Link>
                                                <button onClick={() => {
                                                    setExamClassId(cls.id);
                                                    setIsExamManagerOpen(true);
                                                }} className="text-xs font-bold text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                                                    <AlertTriangle className="w-3 h-3" /> Exams
                                                </button>
                                                <button onClick={() => {
                                                    setEditingClassId(cls.id);
                                                    setIsClassManagerOpen(true);
                                                }} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors">Manage Class</button>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="col-span-2 bg-white p-12 rounded-2xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-center">
                                        <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                                            <BookOpen className="w-8 h-8 text-indigo-300" />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-700 mb-2">No Active Classes</h3>
                                        <p className="text-slate-500 text-sm max-w-sm mb-6">You haven't been assigned any classes yet.</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        <TeacherAssignmentsWidget onRefresh={fetchDashboardDataSilent} />
                    </div>

                    {/* RIGHT: Grading & Attention (1/3) */}
                    <div className="space-y-8">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center justify-between">
                                <span className="flex items-center gap-2"><CheckSquare className="w-5 h-5 text-indigo-600" /> Grading Queue</span>
                                <span className="bg-indigo-50 text-indigo-600 text-xs px-2.5 py-1 rounded-md font-bold">{gradingQueue.length} Pending</span>
                            </h3>
                            <div className="space-y-1">
                                {gradingQueue.length > 0 ? gradingQueue.map((item: any, i: number) => (
                                    <div key={item.id} className={`p-3 hover:bg-slate-50 rounded-xl transition-all cursor-pointer border ${item.isUrgent ? 'border-red-100 bg-red-50/30' : 'border-transparent hover:border-slate-100'
                                        } group`}>
                                        <div className="flex justify-between items-start mb-1">
                                            <div className="flex items-center gap-2">
                                                {item.isUrgent && (
                                                    <span className="px-1.5 py-0.5 bg-red-500 text-white text-[9px] font-bold rounded uppercase">
                                                        Urgent
                                                    </span>
                                                )}
                                                <span className="font-bold text-slate-700 text-sm group-hover:text-indigo-600 transition-colors">
                                                    {item.studentName || item.student}
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-slate-400 font-mono">{item.submitted}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 mb-3">{item.assignment}</p>
                                        <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleGradeOpen(item);
                                                }}
                                                className="px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 shadow-sm shadow-indigo-200"
                                            >
                                                Grade Now
                                            </button>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="py-8 text-center">
                                        <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <CheckSquare className="w-6 h-6" />
                                        </div>
                                        <p className="text-slate-600 font-bold text-sm">All caught up!</p>
                                        <p className="text-xs text-slate-400 mt-1">No pending submissions.</p>
                                    </div>
                                )}
                            </div>
                            <button className="w-full mt-6 text-center text-sm font-bold text-slate-500 hover:text-indigo-600 py-2 border-t border-slate-50 hover:bg-slate-50 transition-colors">View All Submissions</button>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
