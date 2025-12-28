"use client";

import { useState } from "react";
import { X, CheckCircle } from "lucide-react";

interface GradingModalProps {
    submission: {
        id: string;
        studentName: string;
        assignment: string;
        submitted: string;
    };
    onClose: () => void;
    onGraded: () => void;
}

export default function GradingModal({ submission, onClose, onGraded }: GradingModalProps) {
    const [grade, setGrade] = useState("");
    const [feedback, setFeedback] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        const gradeNum = parseInt(grade);

        if (!grade || isNaN(gradeNum) || gradeNum < 0 || gradeNum > 100) {
            alert("Please enter a valid grade (0-100)");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/teacher/submissions/${submission.id}/grade`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    grade: gradeNum,
                    feedback: feedback || null
                })
            });

            const json = await res.json();
            if (json.success) {
                alert(`✅ Grade submitted: ${gradeNum}/100`);
                onGraded(); // Trigger parent refresh
                onClose();
            } else {
                alert(json.error || "Failed to submit grade");
            }
        } catch (e) {
            alert("Error submitting grade");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <h3 className="text-xl font-bold text-slate-800">Grade Submission</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {/* Student Info */}
                    <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                        <p className="text-sm text-indigo-600 font-medium mb-1">Student</p>
                        <p className="text-lg font-bold text-slate-800">{submission.studentName}</p>
                    </div>

                    {/* Assignment Info */}
                    <div>
                        <p className="text-sm text-slate-500 font-medium mb-1">Assignment</p>
                        <p className="text-slate-800 font-semibold">{submission.assignment}</p>
                        <p className="text-xs text-slate-400 mt-1">Submitted: {submission.submitted}</p>
                    </div>

                    {/* Grade Input */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Grade (0-100) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            value={grade}
                            onChange={(e) => setGrade(e.target.value)}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-lg font-bold text-center"
                            placeholder="85"
                            autoFocus
                        />
                    </div>

                    {/* Feedback */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Feedback (Optional)
                        </label>
                        <textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                            placeholder="Good work! Consider improving..."
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center gap-3 p-6 bg-slate-50 rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !grade}
                        className="flex-1 px-4 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            "Submitting..."
                        ) : (
                            <>
                                <CheckCircle className="w-5 h-5" />
                                Submit Grade
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
