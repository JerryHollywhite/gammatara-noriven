"use client";

import { useState } from "react";
import { X, Link as LinkIcon, CheckCircle } from "lucide-react";

interface AssignmentSubmissionModalProps {
    isOpen: boolean;
    onClose: () => void;
    assignmentId: string;
    onSubmitted: () => void;
}

export default function AssignmentSubmissionModal({ isOpen, onClose, assignmentId, onSubmitted }: AssignmentSubmissionModalProps) {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/assignments/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    assignmentId,
                    contentUrl: url
                })
            });

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => {
                    onSubmitted();
                    onClose();
                }, 1500);
            } else {
                alert("Failed to submit assignment");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl w-full max-w-sm p-8 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-200">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-4">
                        <CheckCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Submitted!</h3>
                    <p className="text-slate-500 text-sm mt-2">Your assignment has been turned in.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full text-slate-400"
                >
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-xl font-bold text-slate-800 mb-2">Submit Assignment</h2>
                <p className="text-slate-500 text-sm mb-6">Paste the link to your work (Google Doc, Slide, or Drive File).</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Google Drive Link</label>
                        <div className="relative">
                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="url"
                                required
                                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                placeholder="https://docs.google.com/..."
                                value={url}
                                onChange={e => setUrl(e.target.value)}
                            />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2">
                            * Make sure your file sharing permissions are set to "Anyone with the link".
                        </p>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading || !url}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-slate-500/30 flex justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Submitting..." : "Turn In Assignment"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
