import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { X, Check, Award } from "lucide-react";

interface GradingModalProps {
    isOpen: boolean;
    onClose: () => void;
    submissionId: string;
    studentName: string;
    assignmentTitle: string;
    onGraded: () => void;
}

export default function GradingModal({ isOpen, onClose, submissionId, studentName, assignmentTitle, onGraded }: GradingModalProps) {
    const [grade, setGrade] = useState("");
    const [feedback, setFeedback] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/assignments/grade", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    submissionId,
                    grade: parseInt(grade),
                    feedback
                }),
            });
            const data = await res.json();
            if (data.success) {
                onGraded();
                onClose();
            } else {
                alert("Failed to save grade: " + data.error);
            }
        } catch (error) {
            console.error(error);
            alert("Error saving grade");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 transition-opacity"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 m-auto z-50 w-full max-w-md h-fit bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100"
                    >
                        <div className="relative p-6 px-8 border-b border-slate-100 bg-slate-50/50">
                            <button
                                onClick={onClose}
                                className="absolute top-6 right-6 p-2 bg-white rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all shadow-sm"
                            >
                                <X className="w-4 h-4" />
                            </button>
                            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                                <Award className="w-6 h-6 text-indigo-500" /> Grade Submission
                            </h2>
                            <p className="text-slate-500 mt-1.5 text-sm">
                                Grading <b>{studentName}'s</b> work for <b>{assignmentTitle}</b>
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Grade (0-100)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all font-bold text-lg text-slate-800"
                                    placeholder="e.g. 95"
                                    value={grade}
                                    onChange={(e) => setGrade(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Feedback (Optional)</label>
                                <textarea
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all min-h-[100px] font-medium text-slate-600"
                                    placeholder="Great job! Next time try to..."
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
                            >
                                {loading ? (
                                    <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Check className="w-5 h-5 group-hover:scale-110 transition-transform" /> Submit Grade
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
