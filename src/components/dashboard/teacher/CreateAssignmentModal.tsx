"use client";

import { useState } from "react";
import { X, Calendar } from "lucide-react";
import { Subject } from "@/types/tara";

interface CreateAssignmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    courseId: string; // Pre-selected or derived context
    onCreated: () => void;
}

export default function CreateAssignmentModal({ isOpen, onClose, courseId, onCreated }: CreateAssignmentModalProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/assignments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    description,
                    dueDate,
                    courseId // For now, we link to a courseId (SubjectID from sheet)
                })
            });

            if (res.ok) {
                onCreated();
                onClose();
            } else {
                alert("Failed to create assignment");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full text-slate-400"
                >
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-xl font-bold text-slate-800 mb-6">Create Assignment</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Title</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            placeholder="e.g., Algebra Homework 1"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                        <textarea
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 min-h-[100px]"
                            placeholder="Instructions for students..."
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Due Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="datetime-local"
                                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                                value={dueDate}
                                onChange={e => setDueDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/30 flex justify-center"
                        >
                            {loading ? "Creating..." : "Create Assignment"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
