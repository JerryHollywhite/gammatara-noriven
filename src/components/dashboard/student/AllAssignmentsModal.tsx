"use client";

import { useState } from "react";
import { X, Clock, CheckCircle, AlertCircle, FileText } from "lucide-react";

interface AllAssignmentsModalProps {
    isOpen: boolean;
    onClose: () => void;
    assignments: any[];
    onSelectAssignment: (id: string) => void;
}

export default function AllAssignmentsModal({ isOpen, onClose, assignments, onSelectAssignment }: AllAssignmentsModalProps) {
    const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');

    if (!isOpen) return null;

    const pendingAssignments = assignments.filter(a => a.status !== 'completed' && a.status !== 'submitted');
    const completedAssignments = assignments.filter(a => a.status === 'completed' || a.status === 'submitted');

    const displayAssignments = activeTab === 'pending' ? pendingAssignments : completedAssignments;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl h-[80vh] flex flex-col animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">All Assignments</h2>
                        <p className="text-sm text-slate-500">Track and manage your classwork</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex p-4 gap-2">
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'pending'
                                ? 'bg-slate-900 text-white shadow-md'
                                : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                            }`}
                    >
                        Pending ({pendingAssignments.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('completed')}
                        className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'completed'
                                ? 'bg-slate-900 text-white shadow-md'
                                : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                            }`}
                    >
                        Completed ({completedAssignments.length})
                    </button>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {displayAssignments.length > 0 ? (
                        displayAssignments.map((task) => (
                            <div
                                key={task.id}
                                onClick={() => { onClose(); onSelectAssignment(task.id); }}
                                className="group p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
                            >
                                {task.status === 'urgent' && (
                                    <div className="absolute top-0 right-0 p-1.5 bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-wider rounded-bl-xl border-l border-b border-red-100 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" /> Urgent
                                    </div>
                                )}

                                <div className="flex items-start gap-4">
                                    <div className={`mt-1 w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${task.status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
                                            task.status === 'urgent' ? 'bg-red-100 text-red-600' :
                                                'bg-slate-100 text-slate-500'
                                        }`}>
                                        {task.status === 'completed' ? <CheckCircle className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{task.title}</h4>
                                        <p className="text-xs text-slate-500 font-medium">{task.course}</p>

                                        <div className="flex items-center gap-4 mt-2">
                                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                <Clock className="w-3.5 h-3.5" />
                                                {task.due}
                                            </div>
                                            {task.grade && (
                                                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                                                    Grade: {task.grade}/100
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle className="w-8 h-8 opacity-20" />
                            </div>
                            <p className="font-medium">No assignments found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
