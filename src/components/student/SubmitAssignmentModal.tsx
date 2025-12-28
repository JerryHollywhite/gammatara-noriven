"use client";

import { useState } from "react";
import { X, Upload, Link as LinkIcon, CheckCircle } from "lucide-react";

interface SubmitAssignmentModalProps {
    assignment: {
        id: string;
        title: string;
        class: { name: string };
        dueDate: Date | null;
        maxScore: number;
    };
    onClose: () => void;
    onSubmitted: () => void;
}

export default function SubmitAssignmentModal({ assignment, onClose, onSubmitted }: SubmitAssignmentModalProps) {
    const [contentUrl, setContentUrl] = useState("");
    const [contentText, setContentText] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        // Validation
        if (!contentUrl.trim() && !contentText.trim()) {
            alert("Please provide either a link or write your answer");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/student/assignments/${assignment.id}/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contentUrl: contentUrl.trim() || null,
                    contentText: contentText.trim() || null
                })
            });

            const json = await res.json();
            if (json.success) {
                alert(`✅ ${json.message}`);
                onSubmitted(); //Trigger refresh
                onClose();
            } else {
                alert(json.error || "Failed to submit assignment");
            }
        } catch (e) {
            alert("Error submitting assignment");
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-in zoom-in duration-200">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between rounded-t-2xl">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">{assignment.title}</h3>
                        <p className="text-sm text-slate-500 mt-1">
                            {assignment.class.name} • Max: {assignment.maxScore} points
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 bg-red-500 hover:bg-red-600 rounded-full text-white shadow-sm transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {assignment.dueDate && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                            <p className="text-sm font-medium text-yellow-800">
                                📅 Due: {new Date(assignment.dueDate).toLocaleString('id-ID', {
                                    dateStyle: 'medium',
                                    timeStyle: 'short'
                                })}
                            </p>
                        </div>
                    )}

                    {/* Option 1: Submit Link */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Option 1: Submit Link (Google Drive, etc.)
                        </label>
                        <div className="relative">
                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="url"
                                value={contentUrl}
                                onChange={(e) => setContentUrl(e.target.value)}
                                placeholder="https://drive.google.com/..."
                                className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="text-center text-sm font-medium text-slate-400">
                        — OR —
                    </div>

                    {/* Option 2: Text Answer */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Option 2: Write Your Answer
                        </label>
                        <textarea
                            value={contentText}
                            onChange={(e) => setContentText(e.target.value)}
                            rows={8}
                            placeholder="Type your answer here..."
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none font-mono text-sm"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-slate-50 p-6 rounded-b-2xl flex items-center gap-3 border-t border-slate-200">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || (!contentUrl.trim() && !contentText.trim())}
                        className="flex-1 px-4 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            "Submitting..."
                        ) : (
                            <>
                                <Upload className="w-5 h-5" />
                                Submit Work
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
