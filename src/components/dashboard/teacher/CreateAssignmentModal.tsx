"use client";

import { useState, useEffect } from "react";
import { X, Plus, Link as LinkIcon } from "lucide-react";

interface CreateAssignmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreated: () => void;
}

export default function CreateAssignmentModal({ isOpen, onClose, onCreated }: CreateAssignmentModalProps) {
    const [classes, setClasses] = useState<any[]>([]);
    const [selectedClassId, setSelectedClassId] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [dueTime, setDueTime] = useState("23:59");
    const [attachmentUrl, setAttachmentUrl] = useState("");
    const [maxScore, setMaxScore] = useState("100");
    const [loading, setLoading] = useState(false);

    // Fetch teacher's classes
    useEffect(() => {
        if (isOpen) {
            fetchClasses();
        }
    }, [isOpen]);

    const fetchClasses = async () => {
        try {
            const res = await fetch('/api/teacher/dashboard');
            const json = await res.json();
            if (json.success && json.data.classes) {
                setClasses(json.data.classes);
            }
        } catch (e) {
            console.error("Error fetching classes:", e);
        }
    };

    const handleSubmit = async () => {
        // Validation
        if (!selectedClassId) {
            alert("Please select a class");
            return;
        }
        if (!title.trim()) {
            alert("Please enter assignment title");
            return;
        }

        const maxScoreNum = parseInt(maxScore);
        if (isNaN(maxScoreNum) || maxScoreNum < 1 || maxScoreNum > 1000) {
            alert("Max score must be between 1 and 1000");
            return;
        }

        setLoading(true);
        try {
            // Combine date and time
            const dueDatetime = dueDate && dueTime
                ? new Date(`${dueDate}T${dueTime}:00`)
                : null;

            const res = await fetch('/api/teacher/assignments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    classId: selectedClassId,
                    title: title.trim(),
                    description: description.trim() || null,
                    dueDate: dueDatetime?.toISOString(),
                    attachmentUrl: attachmentUrl.trim() || null,
                    maxScore: maxScoreNum
                })
            });

            const json = await res.json();
            if (json.success) {
                alert(`✅ Assignment "${title}" created successfully!`);
                resetForm();
                onCreated(); // Trigger parent refresh
                onClose();
            } else {
                alert(json.error || "Failed to create assignment");
            }
        } catch (e) {
            alert("Error creating assignment");
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setSelectedClassId("");
        setTitle("");
        setDescription("");
        setDueDate("");
        setDueTime("23:59");
        setAttachmentUrl("");
        setMaxScore("100");
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-in zoom-in duration-200">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between rounded-t-2xl">
                    <h3 className="text-xl font-bold text-slate-800">Create Assignment</h3>
                    <button
                        onClick={onClose}
                        className="p-2 bg-red-500 hover:bg-red-600 rounded-full text-white shadow-sm transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {/* Class Selector */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Select Class <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={selectedClassId}
                            onChange={(e) => setSelectedClassId(e.target.value)}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        >
                            <option value="">-- Select a class --</option>
                            {classes.map(cls => (
                                <option key={cls.id} value={cls.id}>
                                    {cls.name} ({cls.students} students)
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Math Homework Chapter 5"
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Description (Optional)
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            placeholder="Instructions for students..."
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                        />
                    </div>

                    {/* Resource Link */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Resource Link (Optional)
                        </label>
                        <div className="relative">
                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="url"
                                value={attachmentUrl}
                                onChange={(e) => setAttachmentUrl(e.target.value)}
                                placeholder="https://drive.google.com/..."
                                className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                            />
                        </div>
                        <p className="mt-1 text-xs text-slate-500">💡 Google Drive, YouTube, or other resource</p>
                    </div>

                    {/* Due Date & Time */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Due Date & Time (Optional)
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                            />
                            <input
                                type="time"
                                value={dueTime}
                                onChange={(e) => setDueTime(e.target.value)}
                                className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Max Score */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Max Score
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="1000"
                            value={maxScore}
                            onChange={(e) => setMaxScore(e.target.value)}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
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
                        disabled={loading || !selectedClassId || !title.trim()}
                        className="flex-1 px-4 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            "Creating..."
                        ) : (
                            <>
                                <Plus className="w-5 h-5" />
                                Create Assignment
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
