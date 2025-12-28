"use client";

import { useState, useEffect } from "react";
import { FileText, Users, CheckCircle, Clock, Trash2, Edit } from "lucide-react";
import AssignmentSubmissionsModal from "./AssignmentSubmissionsModal";

interface Assignment {
    id: string;
    title: string;
    description: string | null;
    dueDate: Date | null;
    maxScore: number;
    class: {
        id: string;
        name: string;
        studentCount: number;
    };
    stats: {
        totalStudents: number;
        submitted: number;
        graded: number;
    };
    createdAt: Date;
}

export default function TeacherAssignmentsWidget({ onRefresh }: { onRefresh?: () => void }) {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);

    useEffect(() => {
        fetchAssignments();
    }, []);

    const fetchAssignments = async () => {
        try {
            const res = await fetch('/api/teacher/assignments');
            const json = await res.json();
            if (json.success) {
                setAssignments(json.assignments);
            }
        } catch (e) {
            console.error("Error fetching assignments:", e);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Delete assignment "${title}"? All submissions will be lost.`)) {
            return;
        }

        try {
            const res = await fetch(`/api/teacher/assignments/${id}`, {
                method: 'DELETE'
            });
            const json = await res.json();
            if (json.success) {
                alert("✅ Assignment deleted");
                fetchAssignments();
                onRefresh?.();
            } else {
                alert(json.error || "Failed to delete");
            }
        } catch (e) {
            alert("Error deleting assignment");
        }
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
                        <span className="ml-auto text-sm font-normal text-slate-500">
                            {assignments.length} total
                        </span>
                    </h3>
                </div>

                <div className="p-6">
                    {assignments.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileText className="w-8 h-8 text-slate-400" />
                            </div>
                            <p className="text-slate-600 font-medium">No assignments yet</p>
                            <p className="text-sm text-slate-500 mt-1">Create your first assignment</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {assignments.map((assignment) => {
                                const submissionRate = assignment.stats.totalStudents > 0
                                    ? Math.round((assignment.stats.submitted / assignment.stats.totalStudents) * 100)
                                    : 0;
                                const gradingProgress = assignment.stats.submitted > 0
                                    ? Math.round((assignment.stats.graded / assignment.stats.submitted) * 100)
                                    : 0;

                                return (
                                    <div
                                        key={assignment.id}
                                        className="p-4 border border-slate-200 rounded-xl hover:border-indigo-200 hover:shadow-md transition-all"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <h4 className="font-bold text-slate-800">{assignment.title}</h4>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    {assignment.class.name} • {assignment.class.studentCount} students
                                                </p>
                                                {assignment.dueDate && (
                                                    <p className="text-xs text-slate-600 mt-2">
                                                        📅 Due: {new Date(assignment.dueDate).toLocaleDateString('id-ID', {
                                                            dateStyle: 'medium',
                                                            timeStyle: 'short'
                                                        })}
                                                    </p>
                                                )}

                                                {/* Stats */}
                                                <div className="flex items-center gap-4 mt-3">
                                                    <div className="text-xs">
                                                        <span className="text-slate-500">Submitted: </span>
                                                        <span className="font-bold text-blue-600">
                                                            {assignment.stats.submitted}/{assignment.stats.totalStudents} ({submissionRate}%)
                                                        </span>
                                                    </div>
                                                    <div className="text-xs">
                                                        <span className="text-slate-500">Graded: </span>
                                                        <span className="font-bold text-green-600">
                                                            {assignment.stats.graded}/{assignment.stats.submitted} ({gradingProgress}%)
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setSelectedAssignmentId(assignment.id)}
                                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg transition-colors"
                                                >
                                                    View Submissions
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(assignment.id, assignment.title)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete Assignment"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Submissions Modal */}
            {selectedAssignmentId && (
                <AssignmentSubmissionsModal
                    assignmentId={selectedAssignmentId}
                    onClose={() => setSelectedAssignmentId(null)}
                    onGraded={() => {
                        fetchAssignments();
                        onRefresh?.();
                    }}
                />
            )}
        </>
    );
}
