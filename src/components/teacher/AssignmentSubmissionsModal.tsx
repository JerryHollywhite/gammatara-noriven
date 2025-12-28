"use client";

import { useState, useEffect } from "react";
import { X, Users, CheckCircle, Clock, FileText, ExternalLink } from "lucide-react";
import GradingModal from "../dashboard/teacher/GradingModal";

interface AssignmentSubmissionsModalProps {
    assignmentId: string;
    onClose: () => void;
    onGraded: () => void;
}

export default function AssignmentSubmissionsModal({ assignmentId, onClose, onGraded }: AssignmentSubmissionsModalProps) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedSubmission, setSelectedSubmission] = useState<any>(null);

    useEffect(() => {
        fetchSubmissions();
    }, [assignmentId]);

    const fetchSubmissions = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/teacher/assignments/${assignmentId}/submissions`);
            const json = await res.json();
            if (json.success) {
                setData(json);
            }
        } catch (e) {
            console.error("Error fetching submissions:", e);
        } finally {
            setLoading(false);
        }
    };

    const handleGradeClick = (student: any) => {
        if (!student.submission) return;

        setSelectedSubmission({
            id: student.submission.id,
            studentName: student.studentName,
            assignment: data.assignment.title,
            submitted: new Date(student.submission.submittedAt).toLocaleDateString('id-ID')
        });
    };

    const handleGraded = () => {
        fetchSubmissions(); // Refresh list
        onGraded(); // Trigger parent refresh
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl p-12">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
            </div>
        );
    }

    if (!data) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in duration-200">
                    {/* Header */}
                    <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between rounded-t-2xl z-10">
                        <div>
                            <h3 className="text-xl font-bold text-slate-800">{data.assignment.title}</h3>
                            <p className="text-sm text-slate-500 mt-1">
                                {data.assignment.class.name} • Max: {data.assignment.maxScore} points
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-slate-500" />
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-4 p-6 bg-slate-50 border-b border-slate-200">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-slate-800">{data.stats.totalStudents}</p>
                            <p className="text-xs text-slate-500">Total Students</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-blue-600">{data.stats.submitted}</p>
                            <p className="text-xs text-slate-500">Submitted</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">{data.stats.graded}</p>
                            <p className="text-xs text-slate-500">Graded</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-orange-600">{data.stats.notSubmitted}</p>
                            <p className="text-xs text-slate-500">Not Submitted</p>
                        </div>
                    </div>

                    {/* Students List */}
                    <div className="p-6">
                        <div className="space-y-3">
                            {data.students.map((student: any) => (
                                <div
                                    key={student.studentId}
                                    className={`p-4 border rounded-xl ${student.status === 'graded' ? 'border-green-200 bg-green-50' :
                                            student.status === 'submitted' ? 'border-blue-200 bg-blue-50' :
                                                'border-slate-200'
                                        }`}
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <Users className="w-5 h-5 text-slate-400" />
                                                <div>
                                                    <p className="font-bold text-slate-800">{student.studentName}</p>
                                                    <p className="text-xs text-slate-500">{student.studentEmail}</p>
                                                </div>
                                            </div>

                                            {student.submission && (
                                                <div className="mt-3 ml-8 space-y-2">
                                                    <p className="text-xs text-slate-600">
                                                        📅 Submitted: {new Date(student.submission.submittedAt).toLocaleString('id-ID', {
                                                            dateStyle: 'medium',
                                                            timeStyle: 'short'
                                                        })}
                                                    </p>

                                                    {student.submission.contentUrl && (
                                                        <a
                                                            href={student.submission.contentUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                                                        >
                                                            <ExternalLink className="w-3 h-3" />
                                                            View Submission Link
                                                        </a>
                                                    )}

                                                    {student.submission.contentText && (
                                                        <div className="bg-white p-3 rounded border border-slate-200 text-sm text-slate-700 font-mono max-h-24 overflow-y-auto">
                                                            {student.submission.contentText}
                                                        </div>
                                                    )}

                                                    {student.submission.grade !== null && (
                                                        <div className="flex items-center gap-4">
                                                            <p className="text-sm font-bold text-green-600">
                                                                Grade: {student.submission.grade}/{data.assignment.maxScore}
                                                            </p>
                                                            {student.submission.feedback && (
                                                                <p className="text-xs text-slate-600 italic">
                                                                    "{student.submission.feedback}"
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {student.status === 'not_submitted' && (
                                                <span className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg">
                                                    Not Submitted
                                                </span>
                                            )}
                                            {student.status === 'submitted' && (
                                                <button
                                                    onClick={() => handleGradeClick(student)}
                                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg transition-colors"
                                                >
                                                    Grade Now
                                                </button>
                                            )}
                                            {student.status === 'graded' && (
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                                    <span className="text-xs font-bold text-green-600">Graded</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Grading Modal */}
            {selectedSubmission && (
                <GradingModal
                    submission={selectedSubmission}
                    onClose={() => setSelectedSubmission(null)}
                    onGraded={() => {
                        handleGraded();
                        setSelectedSubmission(null);
                    }}
                />
            )}
        </>
    );
}
