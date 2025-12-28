"use client";

import { useState } from "react";
import { X, Search, Clock, CheckCircle, AlertCircle, Filter } from "lucide-react";

interface AllAssignmentsModalProps {
    isOpen: boolean;
    onClose: () => void;
    assignments: any[];
    onSelectAssignment: (id: string) => void;
}

export default function AllAssignmentsModal({ isOpen, onClose, assignments, onSelectAssignment }: AllAssignmentsModalProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "urgent" | "completed" | "overdue">("all");
    const [sortBy, setSortBy] = useState<"dueDate" | "status" | "course">("dueDate");

    if (!isOpen) return null;

    // Filter assignments
    let filteredAssignments = assignments;

    if (filterStatus !== "all") {
        filteredAssignments = filteredAssignments.filter(a => a.status === filterStatus);
    }

    if (searchQuery) {
        filteredAssignments = filteredAssignments.filter(a =>
            a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.course.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    // Sort assignments
    filteredAssignments = [...filteredAssignments].sort((a, b) => {
        if (sortBy === "dueDate") {
            return new Date(a.due).getTime() - new Date(b.due).getTime();
        } else if (sortBy === "status") {
            const statusOrder = { urgent: 0, overdue: 1, pending: 2, submitted: 3, completed: 4 };
            return (statusOrder[a.status as keyof typeof statusOrder] || 5) - (statusOrder[b.status as keyof typeof statusOrder] || 5);
        } else {
            return a.course.localeCompare(b.course);
        }
    });

    const statusCounts = {
        all: assignments.length,
        pending: assignments.filter(a => a.status === "pending").length,
        urgent: assignments.filter(a => a.status === "urgent").length,
        completed: assignments.filter(a => a.status === "completed").length,
        overdue: assignments.filter(a => a.status === "overdue").length,
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "urgent": return <AlertCircle className="w-4 h-4 text-red-500" />;
            case "overdue": return <AlertCircle className="w-4 h-4 text-orange-500" />;
            case "completed": return <CheckCircle className="w-4 h-4 text-emerald-500" />;
            default: return <Clock className="w-4 h-4 text-slate-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "urgent": return "bg-red-50 border-red-200 text-red-700";
            case "overdue": return "bg-orange-50 border-orange-200 text-orange-700";
            case "completed": return "bg-emerald-50 border-emerald-200 text-emerald-700";
            case "submitted": return "bg-blue-50 border-blue-200 text-blue-700";
            default: return "bg-slate-50 border-slate-200 text-slate-700";
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">All Assignments</h2>
                        <p className="text-sm text-slate-500 mt-1">{filteredAssignments.length} of {assignments.length} assignments</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 bg-red-500 hover:bg-red-600 rounded-full text-white shadow-sm transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Filters & Search */}
                <div className="p-6 border-b border-slate-200 space-y-4">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search assignments or courses..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                        {(["all", "urgent", "pending", "overdue", "completed"] as const).map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${filterStatus === status
                                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                    }`}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                                <span className="ml-2 text-xs opacity-75">({statusCounts[status]})</span>
                            </button>
                        ))}
                    </div>

                    {/* Sort Dropdown */}
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-slate-400" />
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="text-sm font-medium text-slate-600 bg-transparent border-none focus:outline-none cursor-pointer"
                        >
                            <option value="dueDate">Sort by Due Date</option>
                            <option value="status">Sort by Status</option>
                            <option value="course">Sort by Course</option>
                        </select>
                    </div>
                </div>

                {/* Assignment List */}
                <div className="flex-1 overflow-y-auto p-6">
                    {filteredAssignments.length > 0 ? (
                        <div className="space-y-3">
                            {filteredAssignments.map((assignment) => (
                                <div
                                    key={assignment.id}
                                    onClick={() => {
                                        onSelectAssignment(assignment.id);
                                        onClose();
                                    }}
                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg ${getStatusColor(assignment.status)} hover:scale-[1.02]`}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                {getStatusIcon(assignment.status)}
                                                <h3 className="font-bold text-slate-800">{assignment.title}</h3>
                                            </div>
                                            <p className="text-sm text-slate-600 mb-2">{assignment.course}</p>
                                            <div className="flex items-center gap-4 text-xs">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    Due: {assignment.due}
                                                </span>
                                                {assignment.grade && (
                                                    <span className="font-bold text-emerald-600">
                                                        Grade: {assignment.grade}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${assignment.status === "urgent" ? "bg-red-100 text-red-600" :
                                                assignment.status === "overdue" ? "bg-orange-100 text-orange-600" :
                                                    assignment.status === "completed" ? "bg-emerald-100 text-emerald-600" :
                                                        "bg-slate-100 text-slate-600"
                                            }`}>
                                            {assignment.status.toUpperCase()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-slate-400" />
                            </div>
                            <p className="text-slate-600 font-bold">No assignments found</p>
                            <p className="text-sm text-slate-400 mt-1">Try adjusting your filters or search query</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
