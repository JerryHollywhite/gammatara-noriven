"use client";

import { useState, useEffect } from "react";
import { Users, Plus, Check, Search, BookOpen, ChevronDown, ChevronRight, FileText, Youtube } from "lucide-react";
import TeacherLessonManager from "./TeacherLessonManager";

interface Student {
    id: string;
    name: string;
    email: string;
}

interface Lesson {
    id: string;
    title: string;
    order: number;
}

interface Subject {
    id: string;
    name: string;
    code: string;
    program?: { id: string; name: string };
    programId?: string;
    lessons?: Lesson[];
}

interface Program {
    id: string;
    name: string;
    code: string;
}

interface TeacherClassManagerProps {
    onClassCreated?: () => void;
    classId?: string | null;
}

export default function TeacherClassManager({ onClassCreated, classId }: TeacherClassManagerProps) {
    // Tabs: 'settings' | 'curriculum'
    const [activeTab, setActiveTab] = useState<'settings' | 'curriculum'>('settings');

    // Data State
    const [students, setStudents] = useState<Student[]>([]);
    const [allSubjects, setAllSubjects] = useState<Subject[]>([]); // For selection in Settings
    const [programs, setPrograms] = useState<Program[]>([]);

    // Class Data (Settings)
    const [className, setClassName] = useState("");
    const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
    const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
    const [selectedProgramId, setSelectedProgramId] = useState("");

    // Curriculum Data (Fetched from API)
    const [classSubjects, setClassSubjects] = useState<Subject[]>([]);
    const [expandedSubjectId, setExpandedSubjectId] = useState<string | null>(null);
    const [addingLessonSubjectId, setAddingLessonSubjectId] = useState<string | null>(null);

    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");

    // Fetch initial data (Students, All Subjects, Programs)
    useEffect(() => {
        fetch('/api/teacher/classes').then(res => res.json()).then(data => { if (data.success) setStudents(data.students); });
        fetch('/api/teacher/subjects').then(res => res.json()).then(data => { if (data.success) setAllSubjects(data.subjects); });
        fetch('/api/teacher/programs').then(res => res.json()).then(data => { if (data.success) setPrograms(data.programs); });
    }, []);

    // Fetch Class Details
    const fetchClassDetails = () => {
        if (classId) {
            setLoading(true);
            fetch(`/api/teacher/classes/${classId}`)
                .then(res => res.json())
                .then(json => {
                    if (json.success) {
                        setClassName(json.class.name);
                        setSelectedStudents(json.class.studentIds);
                        // The API now returns subjects with lessons!
                        if (json.class.subjects) {
                            setClassSubjects(json.class.subjects);
                            // Pre-fill selected subjects for the settings form
                            setSelectedSubjectIds(json.class.subjects.map((s: any) => s.id));
                        }
                    }
                    setLoading(false);
                });
        }
    }

    useEffect(() => {
        fetchClassDetails();
    }, [classId]);

    // Handle Class Save/Update
    const handleSaveClass = async () => {
        if (!className || selectedStudents.length === 0) {
            alert("Please enter a class name and select at least one student.");
            return;
        }

        setLoading(true);
        try {
            const url = classId ? `/api/teacher/classes/${classId}` : '/api/teacher/classes';
            const method = classId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: className,
                    studentIds: selectedStudents,
                    subjectIds: selectedSubjectIds,
                    programId: selectedProgramId
                })
            });
            const json = await res.json();
            if (json.success) {
                alert(classId ? "Class updated successfully!" : "Class created successfully!");
                if (!classId) {
                    setClassName("");
                    setSelectedStudents([]);
                }
                if (onClassCreated) onClassCreated();
                // Refresh data
                fetchClassDetails();
            } else {
                alert(json.error || "Failed");
            }
        } catch (e) {
            alert("Error saving class");
        } finally {
            setLoading(false);
        }
    };

    const toggleStudent = (id: string) => {
        if (selectedStudents.includes(id)) {
            setSelectedStudents(selectedStudents.filter(s => s !== id));
        } else {
            setSelectedStudents([...selectedStudents, id]);
        }
    };

    const toggleSubjectSelection = (id: string) => {
        if (selectedSubjectIds.includes(id)) {
            setSelectedSubjectIds(selectedSubjectIds.filter(s => s !== id));
        } else {
            setSelectedSubjectIds([...selectedSubjectIds, id]);
        }
    };

    const filteredStudents = students.filter(s =>
        (s.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (s.email?.toLowerCase() || "").includes(search.toLowerCase())
    );

    // Render Settings Tab
    const renderSettings = () => (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Class Name</label>
                    <input
                        type="text"
                        value={className}
                        onChange={(e) => setClassName(e.target.value)}
                        placeholder="e.g. Mathematics - Grade 10 A"
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Program</label>
                    <select
                        value={selectedProgramId}
                        onChange={(e) => setSelectedProgramId(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-white"
                    >
                        <option value="">-- Select Program --</option>
                        {programs.sort((a, b) => {
                            const getIndex = (name: string) => {
                                const upper = name?.toUpperCase() || "";
                                if (upper.includes("TK")) return 0;
                                if (upper.includes("SD")) return 1;
                                if (upper.includes("SMP")) return 2;
                                if (upper.includes("SMA")) return 3;
                                if (upper.includes("ADULT") || upper.includes("DEWASA")) return 4;
                                return 99;
                            };
                            return getIndex(a.name) - getIndex(b.name);
                        }).map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Subject Selection */}
            <div>
                <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-slate-700">
                        Assigned Subjects ({selectedSubjectIds.length})
                    </label>
                    <button
                        onClick={() => {
                            const name = prompt("Enter new Subject Name (e.g., Mathematics):");
                            if (!name) return;
                            const code = prompt("Enter Subject Code (e.g., MATH-101):");
                            if (!code) return;

                            // Optimistic UI or API call to create
                            setLoading(true);
                            fetch('/api/teacher/subjects', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ name, code, programId: selectedProgramId || undefined })
                            })
                                .then(res => res.json())
                                .then(data => {
                                    setLoading(false);
                                    if (data.success) {
                                        alert("Subject created!");
                                        // Refresh existing subjects
                                        fetch('/api/teacher/subjects').then(res => res.json()).then(d => { if (d.success) setAllSubjects(d.subjects); });
                                        // Auto-select
                                        if (data.subject?.id) toggleSubjectSelection(data.subject.id);
                                    } else {
                                        alert(data.error || "Failed to create subject");
                                    }
                                });
                        }}
                        className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-bold bg-indigo-50 px-2 py-1 rounded-lg"
                    >
                        <Plus className="w-3 h-3" /> Create New
                    </button>
                </div>
                <div className="h-40 overflow-y-auto border border-slate-200 rounded-xl p-2 space-y-1">
                    {allSubjects
                        .filter(sub => {
                            // If no program selected, SHOW ONLY UNIVERSAL (No Program)
                            if (!selectedProgramId) {
                                return !sub.programId && !sub.program?.id;
                            }

                            // If Program Selected: Show Program Specific + Universal
                            if (!sub.programId && !sub.program?.id) return true;
                            return sub.programId === selectedProgramId || sub.program?.id === selectedProgramId;
                        })
                        .map(sub => (
                            <div
                                key={sub.id}
                                onClick={() => toggleSubjectSelection(sub.id)}
                                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-sm transition-colors
                                ${selectedSubjectIds.includes(sub.id) ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'hover:bg-slate-50 text-slate-700 border border-transparent'}`}
                            >
                                <span className="flex items-center gap-2">
                                    <span className={selectedSubjectIds.includes(sub.id) ? "font-semibold" : ""}>{sub.name}</span>
                                    <span className="text-xs opacity-70">({sub.code})</span>
                                </span>
                                {selectedSubjectIds.includes(sub.id) && <Check className="w-4 h-4" />}
                            </div>
                        ))}
                </div>
                <p className="text-xs text-slate-500 mt-2">
                    Tip: Manage Lessons for these subjects in the "Curriculum" tab.
                </p>
            </div>

            {/* Student Selection */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select Students ({selectedStudents.length})</label>
                <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search students..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg outline-none"
                    />
                </div>
                <div className="h-48 overflow-y-auto border border-slate-200 rounded-xl p-2 space-y-1">
                    {filteredStudents.map(student => (
                        <div
                            key={student.id}
                            onClick={() => toggleStudent(student.id)}
                            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-sm
                                ${selectedStudents.includes(student.id) ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50 text-slate-700'}`}
                        >
                            <span>{student.name} <span className="text-slate-400 text-xs">({student.email})</span></span>
                            {selectedStudents.includes(student.id) && <Check className="w-4 h-4" />}
                        </div>
                    ))}
                </div>
            </div>

            <button
                onClick={handleSaveClass}
                disabled={loading}
                className="w-full py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
                {loading ? "Saving..." : <Check className="w-4 h-4" />} {classId ? "Update Settings" : "Create Class"}
            </button>
        </div>
    );

    // Render Curriculum Tab
    const renderCurriculum = () => {
        if (!classId) return <div className="text-center py-10 text-slate-500">Please create the class first in Settings.</div>;

        if (addingLessonSubjectId) {
            // Render Inline Lesson Manager
            return (
                <div className="animate-in slide-in-from-right duration-300">
                    <button
                        onClick={() => setAddingLessonSubjectId(null)}
                        className="mb-4 text-sm text-slate-500 hover:text-indigo-600 flex items-center gap-1"
                    >
                        ← Back to Curriculum
                    </button>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <h4 className="font-bold text-slate-800 mb-2">Add New Lesson</h4>
                        <TeacherLessonManager
                            initialSubjectId={addingLessonSubjectId}
                            onSuccess={() => {
                                setAddingLessonSubjectId(null);
                                fetchClassDetails(); // Refresh to show new lesson
                            }}
                        />
                    </div>
                </div>
            );
        }

        return (
            <div className="space-y-4 animate-in fade-in duration-300">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-slate-800">Subjects & Lessons</h3>
                    <button
                        onClick={() => setActiveTab('settings')} // Direct user to settings to add subjects
                        className="text-xs text-indigo-600 hover:underline"
                    >
                        + Manage Subjects
                    </button>
                </div>

                {classSubjects.length === 0 ? (
                    <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                        <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-slate-500 text-sm">No subjects assigned.</p>
                        <button onClick={() => setActiveTab('settings')} className="text-indigo-600 text-sm font-bold mt-2">Go to Settings to Add Subjects</button>
                    </div>
                ) : (
                    classSubjects.map(subject => (
                        <div key={subject.id} className="border border-slate-200 rounded-xl overflow-hidden">
                            {/* Subject Header */}
                            <div
                                onClick={() => setExpandedSubjectId(expandedSubjectId === subject.id ? null : subject.id)}
                                className="bg-white p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                        <BookOpen className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800">{subject.name}</h4>
                                        <p className="text-xs text-slate-500">{subject.lessons?.length || 0} Lessons</p>
                                    </div>
                                </div>
                                {expandedSubjectId === subject.id ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
                            </div>

                            {/* Lessons List (Expanded) */}
                            {expandedSubjectId === subject.id && (
                                <div className="bg-slate-50 border-t border-slate-100 p-4 space-y-2">
                                    {/* List */}
                                    {subject.lessons && subject.lessons.length > 0 ? (
                                        subject.lessons.map(lesson => (
                                            <div key={lesson.id} className="bg-white p-3 rounded-lg border border-slate-200 flex items-center gap-3">
                                                <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded">
                                                    <FileText className="w-4 h-4" />
                                                </div>
                                                <span className="text-sm font-medium text-slate-700">{lesson.title}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-xs text-slate-400 italic px-2">No lessons yet.</p>
                                    )}

                                    {/* Add Button */}
                                    <button
                                        onClick={() => setAddingLessonSubjectId(subject.id)}
                                        className="w-full mt-2 py-2 border border-dashed border-indigo-300 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-50 flex items-center justify-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" /> Add Lesson to {subject.name}
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        );
    };

    return (
        <div className="bg-white p-6 rounded-2xl md:min-w-[500px]">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        {classId ? `Manage: ${className || 'Class'}` : "Create New Class"}
                    </h3>
                    <p className="text-xs text-slate-500">Manage students, subjects, and curriculum.</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 mb-6 bg-slate-100 p-1 rounded-xl">
                <button
                    onClick={() => setActiveTab('settings')}
                    className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'settings' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Settings & Students
                </button>
                <button
                    onClick={() => {
                        if (classId) setActiveTab('curriculum');
                        else alert("Please save the class first to manage curriculum.");
                    }}
                    className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'curriculum' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'} ${!classId ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title={!classId ? "Save class first" : ""}
                >
                    Curriculum
                    {!classId && <span className="ml-2 text-[10px] bg-slate-200 px-1 rounded text-slate-500">Locked</span>}
                </button>
            </div>

            {/* Content */}
            {activeTab === 'settings' ? renderSettings() : renderCurriculum()}
        </div>
    );
}
