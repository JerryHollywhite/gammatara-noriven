"use client";

import { useState, useEffect } from "react";
import { FileText, Clock, CheckCircle, Award, ExternalLink, Calendar } from "lucide-react";
import SubmitAssignmentModal from "./SubmitAssignmentModal";

interface Assignment {
    id: string;
    title: string;
    description: string | null;
    dueDate: Date | null;
    maxScore: number;
    attachmentUrl: string | null;
    class: {
        id: string;
        name: string;
    };
    teacher: string;
    status: 'pending' | 'submitted' | 'graded';
    isOverdue: boolean;
    submission: {
        id: string;
        grade: number | null;
        feedback: string | null;
        submittedAt: Date;
    } | null;
}

export default function StudentAssignmentsWidget() {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [grouped, setGrouped] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
    const [showSubmitModal, setShowSubmitModal] = useState(false);

    useEffect(() => {
        fetchAssignments();
    }, []);

    const fetchAssignments = async () => {
        try {
            const res = await fetch('/api/student/assignments');
            const json = await res.json();
            if (json.success) {
                setAssignments(json.assignments);
                setGrouped(json.grouped);
            }
        } catch (e) {
            console.error("Error fetching assignments:", e);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitClick = (assignment: Assignment) => {
        setSelectedAssignment(assignment);
        setShowSubmitModal(true);
    };

    const formatDueDate = (dueDate: Date | null) => {
        if (!dueDate) return null;
        const date = new Date(dueDate);
        const now = new Date();
        const diffTime = date.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { text: 'Overdue', color: 'text-red-600' };
        if (diffDays === 0) return { text: 'Due today', color: 'text-orange-600' };
        if (diffDays === 1) return { text: 'Due tomorrow', color: 'text-yellow-600' };
        if (diffDays <= 7) return { text: `Due in ${diffDays} days`, color: 'text-yellow-600' };
        return { text: `Due ${date.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}`, color: 'text-slate-600' };
    };

    if (loading) {
        return (
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
                <div className="flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
                <div className="p-6 border-b border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-indigo-600" />
                        My Assignments
                    </h3>
                </div>

                <div className="p-6 space-y-6">
                    {assignments.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileText className="w-8 h-8 text-slate-400" />
                            </div>
                            <p className="text-slate-600 font-medium">No assignments yet</p>
                            <p className="text-sm text-slate-500 mt-1">Assignments will appear here</p>
                        </div>
                    ) : (
                        <>
                            {/* PENDING */}
                            {grouped?.pending?.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-bold text-orange-600 uppercase tracking-wide mb-3 flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        Pending ({grouped.pending.length})
                                    </h4>
                                    <div className="space-y-2">
                                        {grouped.pending.map((assignment: Assignment) => {
                                            const dueInfo = formatDueDate(assignment.dueDate);
                                            return (
                                                <div
                                                    key={assignment.id}
                                                    className={`p-4 border rounded-xl hover:shadow-md transition-all ${assignment.isOverdue ? 'border-red-200 bg-red-50' : 'border-slate-200 hover:border-indigo-200'
                                                        }`}
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex-1">
                                                            <h5 className="font-bold text-slate-800">{assignment.title}</h5>
                                                            <p className="text-xs text-slate-500 mt-1">
                                                                {assignment.class.name} • {assignment.teacher}
                                                            </p>
                                                            {dueInfo && (
                                                                <p className={`text-xs font-medium mt-2 ${dueInfo.color}`}>
                                                                    📅 {dueInfo.text}
                                                                </p>
                                                            )}
                                                            {assignment.attachmentUrl && (
                                                                <a
                                                                    href={assignment.attachmentUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 mt-2"
                                                                >
                                                                    <ExternalLink className="w-3 h-3" />
                                                                    View Resources
                                                                </a>
                                                            )}
                                                        </div>
                                                        <button
                                                            onClick={() => handleSubmitClick(assignment)}
                                                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg transition-colors whitespace-nowrap"
                                                        >
                                                            Submit →
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* SUBMITTED */}
                            {grouped?.submitted?.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-bold text-blue-600 uppercase tracking-wide mb-3 flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" />
                                        Submitted ({grouped.submitted.length})
                                    </h4>
                                    <div className="space-y-2">
                                        {grouped.submitted.map((assignment: Assignment) => (
                                            <div
                                                key={assignment.id}
                                                className="p-4 border border-blue-200 bg-blue-50 rounded-xl"
                                            >
                                                <h5 className="font-bold text-slate-800">{assignment.title}</h5>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    {assignment.class.name}
                                                </p>
                                                <p className="text-xs text-blue-600 font-medium mt-2">
                                                    ✅ Submitted {new Date(assignment.submission!.submittedAt).toLocaleDateString('id-ID')}
                                                </p>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    ⏳ Waiting for grade...
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* GRADED */}
                            {grouped?.graded?.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-bold text-green-600 uppercase tracking-wide mb-3 flex items-center gap-2">
                                        <Award className="w-4 h-4" />
                                        Graded ({grouped.graded.length})
                                    </h4>
                                    <div className="space-y-2">
                                        {grouped.graded.map((assignment: Assignment) => {
                                            const grade = assignment.submission!.grade!;
                                            const percentage = Math.round((grade / assignment.maxScore) * 100);
                                            const gradeColor = percentage >= 80 ? 'text-green-600' : percentage >= 60 ? 'text-yellow-600' : 'text-red-600';

                                            return (
                                                <div
                                                    key={assignment.id}
                                                    className="p-4 border border-green-200 bg-green-50 rounded-xl"
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex-1">
                                                            <h5 className="font-bold text-slate-800">{assignment.title}</h5>
                                                            <p className="text-xs text-slate-500 mt-1">
                                                                {assignment.class.name}
                                                            </p>
                                                            <div className="mt-3">
                                                                <p className={`text-lg font-black ${gradeColor}`}>
                                                                    {grade}/{assignment.maxScore} ({percentage}%)
                                                                </p>
                                                                {assignment.submission!.feedback && (
                                                                    <p className="text-xs text-slate-600 mt-2 italic">
                                                                        💬 {assignment.submission!.feedback}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Submit Modal */}
            {showSubmitModal && selectedAssignment && (
                <SubmitAssignmentModal
                    assignment={selectedAssignment}
                    onClose={() => {
                        setShowSubmitModal(false);
                        setSelectedAssignment(null);
                    }}
                    onSubmitted={() => {
                        fetchAssignments(); // Refresh list
                    }}
                />
            )}
        </>
    );
}
