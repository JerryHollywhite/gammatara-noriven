"use client";

import { useState, useEffect } from "react";
import {
    Plus, Trash2, Save, FileText, CheckSquare, Clock, ArrowLeft,
    MoreVertical, Copy, GripVertical, CheckCircle2, XCircle,
    AlignLeft, List, UploadCloud, DivideSquare, Star, Grid as GridIcon,
    Type, Image as ImageIcon, PlusCircle, Search, Calendar, BookOpen
} from "lucide-react";
import { motion, Reorder } from "framer-motion";

interface Question {
    id: string;
    questionText: string;
    type: 'MCQ' | 'SHORT_ANSWER' | 'PARAGRAPH' | 'CHECKBOXES' | 'FILE_UPLOAD' | 'LINEAR_SCALE' | 'RATING' | 'GRID_MCQ' | 'GRID_CHECKBOX';
    options: string[]; // For MCQ, Checkboxes
    rows?: string[]; // For Grids
    cols?: string[]; // For Grids
    scaleMin?: number; // For Linear Scale
    scaleMax?: number; // For Linear Scale
    scaleMinLabel?: string; // For Linear Scale
    scaleMaxLabel?: string; // For Linear Scale
    correctAnswer: string; // JSON string for complex types
    points: number | string;
}

const QUESTION_TYPES = [
    { value: 'SHORT_ANSWER', label: 'Short answer', icon: <AlignLeft className="w-4 h-4" /> },
    { value: 'PARAGRAPH', label: 'Paragraph', icon: <AlignLeft className="w-4 h-4" /> },
    { value: 'MCQ', label: 'Multiple choice', icon: <CheckCircle2 className="w-4 h-4" /> },
    { value: 'CHECKBOXES', label: 'Checkboxes', icon: <CheckSquare className="w-4 h-4" /> },
    { value: 'FILE_UPLOAD', label: 'File upload', icon: <UploadCloud className="w-4 h-4" /> },
    { value: 'LINEAR_SCALE', label: 'Linear scale', icon: <DivideSquare className="w-4 h-4" /> },
    { value: 'RATING', label: 'Rating', icon: <Star className="w-4 h-4" /> },
    { value: 'GRID_MCQ', label: 'Multiple choice grid', icon: <GridIcon className="w-4 h-4" /> },
    { value: 'GRID_CHECKBOX', label: 'Checkbox grid', icon: <GridIcon className="w-4 h-4" /> },
];

export default function TeacherExamManager({ subjectId, classId }: { subjectId?: string, classId?: string }) {
    const [exams, setExams] = useState<any[]>([]);
    const [view, setView] = useState<'LIST' | 'CREATE' | 'RESULTS'>('LIST');
    const [loading, setLoading] = useState(false);
    const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
    const [editingExamId, setEditingExamId] = useState<string | null>(null);
    const [examResults, setExamResults] = useState<any>(null); // { exam, stats }
    const [selectedAttempt, setSelectedAttempt] = useState<any>(null);

    // Import/Clone Logic
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [libraryExams, setLibraryExams] = useState<any[]>([]);
    const [selectedImportExam, setSelectedImportExam] = useState<any>(null);
    const [importStartTime, setImportStartTime] = useState("");
    const [importEndTime, setImportEndTime] = useState(""); // For Review Modal

    // Filters
    const [filterStatus, setFilterStatus] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');
    const [searchQuery, setSearchQuery] = useState("");

    // Form State
    const [title, setTitle] = useState("Untitled Exam");
    const [description, setDescription] = useState("");
    const [duration, setDuration] = useState<number | string>(60);
    const [passingGrade, setPassingGrade] = useState<number | string>(75);
    const [isActive, setIsActive] = useState(true);
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [questions, setQuestions] = useState<Question[]>([]);

    useEffect(() => {
        // if (subjectId || classId) fetchExams();
        fetchExams();
        if (classId) fetchLibraryExams();
    }, [subjectId, classId]);

    const fetchExams = async () => {
        // if (!subjectId && !classId) return; // Allow fetching all if no filter
        const query = new URLSearchParams();
        if (subjectId) query.append('subjectId', subjectId);
        if (classId) query.append('classId', classId);

        try {
            const res = await fetch(`/api/teacher/exams?${query.toString()}`);
            const json = await res.json();
            if (json.success) setExams(json.exams);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchResults = async (examId: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/teacher/exams/${examId}/results`);
            const json = await res.json();
            if (json.success) {
                setExamResults(json.data);
                setView('RESULTS');
            }
        } catch (e) {
            alert("Failed to load results");
        } finally {
            setLoading(false);
        }
    };

    const addQuestion = () => {
        setQuestions([...questions, {
            id: Math.random().toString(36).substr(2, 9),
            questionText: "",
            type: "MCQ",
            options: [""], // Start empty for placeholder behavior
            correctAnswer: "",
            points: 10
        }]);
    };

    const insertQuestion = (index: number) => {
        const newQuestion: Question = {
            id: Math.random().toString(36).substr(2, 9),
            questionText: "",
            type: "MCQ",
            options: [""],
            correctAnswer: "",
            points: 10
        };
        const newQuestions = [...questions];
        newQuestions.splice(index, 0, newQuestion);
        setQuestions(newQuestions);
    };

    const duplicateQuestion = (index: number) => {
        const q = questions[index];
        // Deep copy needed for arrays/objects
        const newQ: Question = {
            ...q,
            id: Math.random().toString(36).substr(2, 9),
            options: [...q.options],
            rows: q.rows ? [...q.rows] : undefined,
            cols: q.cols ? [...q.cols] : undefined
        };
        const newQuestions = [...questions];
        newQuestions.splice(index + 1, 0, newQ);
        setQuestions(newQuestions);
    };

    const updateQuestion = (index: number, field: keyof Question, value: any) => {
        const newQuestions = [...questions];
        // @ts-ignore
        newQuestions[index][field] = value;
        setQuestions(newQuestions);
    };

    // --- OPTION HELPERS ---
    const addOption = (index: number) => {
        const newQuestions = [...questions];
        newQuestions[index].options.push(""); // Start empty
        setQuestions(newQuestions);
    };

    const updateOption = (qIndex: number, oIndex: number, value: string) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options[oIndex] = value;
        setQuestions(newQuestions);
    };

    const removeOption = (qIndex: number, oIndex: number) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options.splice(oIndex, 1);
        setQuestions(newQuestions);
    };

    // --- GRID HELPERS (Rows/Cols) ---
    const addGridItem = (index: number, type: 'rows' | 'cols') => {
        const newQuestions = [...questions];
        if (!newQuestions[index][type]) newQuestions[index][type] = [];
        // @ts-ignore
        newQuestions[index][type].push(`${type === 'rows' ? 'Row' : 'Column'} ${newQuestions[index][type].length + 1}`);
        setQuestions(newQuestions);
    };

    const updateGridItem = (qIndex: number, type: 'rows' | 'cols', itemIndex: number, value: string) => {
        const newQuestions = [...questions];
        if (!newQuestions[qIndex][type]) return;
        // @ts-ignore
        newQuestions[qIndex][type][itemIndex] = value;
        setQuestions(newQuestions);
    };

    const removeGridItem = (qIndex: number, type: 'rows' | 'cols', itemIndex: number) => {
        const newQuestions = [...questions];
        if (!newQuestions[qIndex][type]) return;
        // @ts-ignore
        newQuestions[qIndex][type].splice(itemIndex, 1);
        setQuestions(newQuestions);
    };


    const removeQuestion = (index: number) => {
        const newQuestions = [...questions];
        newQuestions.splice(index, 1);
        setQuestions(newQuestions);
    };

    const resetForm = () => {
        setEditingExamId(null);
        setTitle("Untitled Exam");
        setDescription("");
        setQuestions([]);
        setIsActive(true);
        setStartTime("");
        setEndTime("");
    };

    const handleEdit = (exam: any) => {
        setEditingExamId(exam.id);
        setTitle(exam.title);
        setDescription(exam.description || "");
        setDuration(exam.durationMinutes);
        setPassingGrade(exam.passingGrade);
        setQuestions(exam.examQuestions || []);
        setIsActive(exam.active);

        const formatForInput = (dateStr?: string) => {
            if (!dateStr) return "";
            return new Date(dateStr).toISOString().slice(0, 16);
        };

        setStartTime(formatForInput(exam.startTime));
        setEndTime(formatForInput(exam.endTime));

        setView('CREATE');
    };

    const handleDelete = async (examId: string) => {
        if (!confirm("Are you sure you want to delete this exam?")) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/teacher/exams/${examId}`, { method: 'DELETE' });
            const json = await res.json();
            if (res.ok) {
                fetchExams();
            } else {
                alert("Failed: " + (json.error || "Unknown error"));
            }
        } catch (e) {
            console.error(e);
            alert("Error deleting exam");
        } finally {
            setLoading(false);
        }
    };

    const fetchLibraryExams = async () => {
        setLoading(true);
        try {
            // Fetch all exams (no filters) to serve as library
            const res = await fetch('/api/teacher/exams');
            const data = await res.json();
            if (data.success) {
                setLibraryExams(data.exams);
            }
        } catch (e) {
            console.error("Fetch Library Error", e);
        } finally {
            setLoading(false);
        }
    };

    const handleImportExam = async () => {
        if (!selectedImportExam || !classId) return;

        setLoading(true);
        try {
            const res = await fetch('/api/teacher/exams/assign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sourceExamId: selectedImportExam.id,
                    classId: classId,
                    startTime: importStartTime ? new Date(importStartTime).toISOString() : undefined,
                    endTime: importEndTime ? new Date(importEndTime).toISOString() : undefined,
                })
            });
            const json = await res.json();

            if (json.success) {
                setIsImportModalOpen(false);
                setSelectedImportExam(null);
                setImportStartTime("");
                setImportEndTime("");
                fetchExams(); // Refresh class exams
                alert("Exam assigned to class successfully!");
            } else {
                alert("Failed to assign: " + json.error);
            }
        } catch (e) {
            console.error(e);
            alert("Error assigning exam");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (saveAsDraft = false) => {
        if (!title || questions.length === 0) {
            alert("Title and at least one question are required.");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                title,
                description,
                subjectId,
                classId,
                durationMinutes: Number(duration),
                passingGrade: Number(passingGrade),
                questions: questions.map(q => ({
                    ...q,
                    points: Number(q.points) || 0
                })),
                active: !saveAsDraft,
                startTime: startTime ? new Date(startTime).toISOString() : undefined,
                endTime: endTime ? new Date(endTime).toISOString() : undefined,
            };

            const url = editingExamId ? `/api/teacher/exams/${editingExamId}` : '/api/teacher/exams';
            const method = editingExamId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const json = await res.json();
            if (json.success) {
                alert(saveAsDraft ? "Exam Saved as Draft!" : "Exam Published Successfully!");
                setView('LIST');
                resetForm();
                fetchExams();
            } else {
                alert("Failed: " + json.error);
            }
        } catch (e) {
            alert("Error creating exam");
        } finally {
            setLoading(false);
        }
    };



    // --- VIEW: LIST EXAMS ---
    if (view === 'LIST') {
        const filteredExams = exams.filter(e => {
            const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = filterStatus === 'ALL'
                ? true
                : filterStatus === 'PUBLISHED' ? e.active
                    : !e.active;
            return matchesSearch && matchesStatus;
        });

        return (
            <div className="space-y-8 animate-in fade-in duration-300">
                <div className="flex flex-col md:flex-row justify-between items-end gap-4 text-slate-800">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Examinations</h2>
                        <p className="text-slate-500 mt-1">Manage assessments, quizzes, and view student results.</p>
                    </div>

                    {/* Filters */}
                    <div className="flex items-center gap-3 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                className="pl-9 pr-4 py-2 text-sm outline-none bg-transparent w-40 md:w-60 placeholder:text-slate-400"
                                placeholder="Search exams..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="h-6 w-px bg-slate-200" />
                        <select
                            className="text-sm font-bold text-slate-600 bg-transparent outline-none px-2 cursor-pointer hover:text-purple-600"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as any)}
                        >
                            <option value="ALL">All Status</option>
                            <option value="PUBLISHED">Published</option>
                            <option value="DRAFT">Drafts</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Create New Card (Only if NOT in Class Mode) */}
                    {!classId && (
                        <div
                            onClick={() => {
                                setQuestions([{
                                    id: '1',
                                    questionText: "Untitled Question",
                                    type: "MCQ",
                                    options: [""],
                                    correctAnswer: "",
                                    points: 10
                                }]);
                                setView('CREATE');
                            }}
                            className="bg-white rounded-2xl border-2 border-dashed border-slate-200 hover:border-purple-400 hover:bg-purple-50/30 flex flex-col items-center justify-center p-12 cursor-pointer transition-all group h-[220px]"
                        >
                            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Plus className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-700 group-hover:text-purple-700">Create New Exam</h3>
                        </div>
                    )}



                    {/* Exam Cards */}
                    {filteredExams.map((exam: any) => (
                        <div key={exam.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all p-6 flex flex-col justify-between h-[220px] relative overflow-hidden group">
                            <div className={`absolute top-0 left-0 w-full h-1 ${exam.active ? 'bg-emerald-500' : 'bg-amber-400'}`} />

                            <div className="flex justify-between items-start">
                                <div>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mb-2 inline-block ${exam.active ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                        {exam.active ? 'PUBLISHED' : 'DRAFT'}
                                    </span>
                                    <h4 className="font-bold text-xl text-slate-800 mb-1 line-clamp-2 leading-tight group-hover:text-purple-700 transition-colors">{exam.title}</h4>
                                    <p className="text-xs text-slate-500 line-clamp-2">{exam.description || "No description provided."}</p>

                                    {/* Class Info */}
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {exam.class ? (
                                            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded flex items-center gap-1">
                                                Linked to: {exam.class.name}
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1">
                                                Unlinked Draft
                                            </span>
                                        )}
                                        <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded">
                                            <CheckSquare className="w-3.5 h-3.5" /> {exam._count?.examQuestions || 0} Qs
                                        </span>
                                    </div>

                                    {(exam.startTime || exam.endTime) && (
                                        <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1.5 mt-2 bg-slate-50 p-2 rounded border border-slate-100">
                                            <Calendar className="w-3 h-3" />
                                            <span>
                                                {exam.startTime ? new Date(exam.startTime).toLocaleDateString() : 'Now'}
                                                {' - '}
                                                {exam.endTime ? new Date(exam.endTime).toLocaleDateString() : 'Forever'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleDelete(exam.id)}
                                    className="text-slate-300 hover:text-red-500 transition-colors"
                                    title="Delete Exam"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                                    <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded">
                                        <Clock className="w-3.5 h-3.5" /> {exam.durationMinutes}m
                                    </span>
                                    <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded">
                                        <CheckSquare className="w-3.5 h-3.5" /> {exam._count?.examQuestions || 0} Qs
                                    </span>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(exam)}
                                        className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold py-2 rounded-lg transition-colors border border-slate-200"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => fetchResults(exam.id)}
                                        className="flex-1 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold py-2 rounded-lg transition-colors border border-purple-100"
                                    >
                                        Results
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Empty State in List */}
                    {exams.length === 0 && (
                        <div className="col-span-1 md:col-span-2 flex flex-col items-center justify-center p-8 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
                            <div className="bg-slate-50 p-4 rounded-full mb-4">
                                <FileText className="w-8 h-8 text-slate-300" />
                            </div>
                            <h3 className="font-bold text-slate-600">No Exams Found</h3>
                            <p className="text-sm max-w-xs mx-auto mt-2">Get started by creating your first exam using the card on the left!</p>
                        </div>
                    )}
                </div>

                {/* --- LIBRARY EXAMS SECTION (Only in Class Mode) --- */}
                {classId && libraryExams.length > 0 && (
                    <div className="pt-8 border-t border-slate-200 mt-8">
                        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-purple-600" />
                            Available from Library
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {libraryExams.map(ex => (
                                <div key={ex.id} className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between h-[200px] hover:border-purple-300 transition-all shadow-sm group">
                                    <div>
                                        <h4 className="font-bold text-lg text-slate-800 line-clamp-2 mt-1">{ex.title}</h4>
                                        <p className="text-sm text-slate-500 mt-2 line-clamp-2">{ex.description || "No description provided."}</p>
                                        <span className="text-xs bg-slate-50 text-slate-500 px-2 py-0.5 rounded mt-3 inline-block border border-slate-100">
                                            {ex._count?.examQuestions || 0} Questions
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => { setSelectedImportExam(ex); setIsImportModalOpen(true); }}
                                        className="w-full mt-4 bg-purple-50 text-purple-700 font-bold py-2.5 rounded-xl hover:bg-purple-100 transition-colors flex items-center justify-center gap-2 text-sm"
                                    >
                                        <PlusCircle className="w-4 h-4" /> Assign to Class
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}


                {/* --- IMPORT MODAL --- */}
                {
                    isImportModalOpen && (
                        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
                            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                        <BookOpen className="w-5 h-5 text-purple-600" />
                                        Import Exam from Library
                                    </h3>
                                    <button onClick={() => setIsImportModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                        <XCircle className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                    {!selectedImportExam ? (
                                        <div className="space-y-4">
                                            <p className="text-sm text-slate-500">Select an exam to assign to this class. A copy will be created.</p>
                                            <div className="grid grid-cols-1 gap-3">
                                                {libraryExams.length === 0 ? (
                                                    <p className="text-center text-slate-400 py-8">No exams found in library.</p>
                                                ) : (
                                                    libraryExams.map(ex => (
                                                        <div
                                                            key={ex.id}
                                                            onClick={() => setSelectedImportExam(ex)}
                                                            className="p-4 rounded-xl border border-slate-200 hover:border-purple-400 hover:bg-purple-50 cursor-pointer transition-all flex justify-between items-center"
                                                        >
                                                            <div>
                                                                <h4 className="font-bold text-slate-800">{ex.title}</h4>
                                                                <p className="text-xs text-slate-500 line-clamp-1">{ex.description || "No description"}</p>
                                                                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded mt-1 inline-block">
                                                                    {ex._count?.examQuestions || 0} Questions
                                                                </span>
                                                            </div>
                                                            <div className="bg-white p-2 rounded-full border border-slate-100 shadow-sm text-purple-600">
                                                                <Copy className="w-4 h-4" />
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-bold text-purple-900">{selectedImportExam.title}</h4>
                                                        <p className="text-xs text-purple-700 mt-1">{selectedImportExam._count?.examQuestions || 0} Questions</p>
                                                    </div>
                                                    <button
                                                        onClick={() => setSelectedImportExam(null)}
                                                        className="text-xs font-bold text-purple-600 hover:underline"
                                                    >
                                                        Change
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Start Time</label>
                                                    <input
                                                        type="datetime-local"
                                                        className="w-full p-2 rounded-lg border border-slate-200 text-sm"
                                                        value={importStartTime}
                                                        onChange={e => setImportStartTime(e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">End Time</label>
                                                    <input
                                                        type="datetime-local"
                                                        className="w-full p-2 rounded-lg border border-slate-200 text-sm"
                                                        value={importEndTime}
                                                        onChange={e => setImportEndTime(e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            <button
                                                onClick={handleImportExam}
                                                disabled={loading}
                                                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
                                            >
                                                {loading ? "Assigning..." : "Assign to Class"}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                }
            </div>
        );
    }

    // --- VIEW: RESULTS ---
    if (view === 'RESULTS' && examResults) {
        const { exam, stats } = examResults;

        // Calculate missing status
        // Create a map of attempts by studentId
        const attemptMap = new Map();
        exam.attempts.forEach((a: any) => attemptMap.set(a.studentId, a));

        // Get list of all students involved (if class is linked, use class students, else just those who attempted)
        // Use 'any' type for students to avoid complex type merging issues for now
        let allStudents: any[] = [];
        if (exam.class && exam.class.students) {
            allStudents = exam.class.students.map((enrollment: any) => enrollment.student);
        } else {
            // Fallback for unlinked exams: just show attempters
            allStudents = exam.attempts.map((a: any) => a.student);
            // Deduplicate
            allStudents = Array.from(new Map(allStudents.map((s: any) => [s.id, s])).values());
        }

        const studentRows = allStudents.map((student: any) => {
            const attempt = attemptMap.get(student.id);
            return {
                student,
                attempt,
                status: attempt ? (attempt.completedAt ? "COMPLETED" : "IN_PROGRESS") : "NOT_STARTED",
                score: attempt?.score || 0
            };
        });

        const notStartedCount = studentRows.filter(r => r.status === "NOT_STARTED").length;
        const completedCount = studentRows.filter(r => r.status === "COMPLETED").length;
        const completionRate = allStudents.length ? Math.round((completedCount / allStudents.length) * 100) : 0;

        return (
            <div className="space-y-8 animate-in slide-in-from-right duration-300 pb-20">
                {/* Header */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setView('LIST')} className="p-2 hover:bg-slate-50 rounded-full text-slate-500 hover:text-slate-800 transition-colors border border-slate-200">
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800">{exam.title}</h2>
                                <div className="flex flex-wrap gap-3 text-sm font-medium mt-1">
                                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide border ${exam.active ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-amber-50 text-amber-700 border-amber-100"}`}>
                                        {exam.active ? "Published" : "Draft"}
                                    </span>
                                    {exam.class && (
                                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center gap-1">
                                            Class: {exam.class.name || "Unknown"}
                                        </span>
                                    )}
                                    <span className="text-slate-400 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {exam.durationMinutes}m duration
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleEdit(exam)}
                                className="bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 px-4 py-2 rounded-lg font-bold text-sm transition-colors"
                            >
                                Edit Exam
                            </button>
                            <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-md shadow-purple-200 transition-colors">
                                Download Report
                            </button>
                        </div>
                    </div>

                    {/* Schedule Info */}
                    {(exam.startTime || exam.endTime) && (
                        <div className="flex gap-6 pt-4 border-t border-slate-100 text-sm">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Start Time</p>
                                <p className="font-bold text-slate-700">{exam.startTime ? new Date(exam.startTime).toLocaleString() : "Anytime"}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">End Time</p>
                                <p className="font-bold text-slate-700">{exam.endTime ? new Date(exam.endTime).toLocaleString() : "No Limit"}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <PlusCircle className="w-12 h-12 text-blue-600" />
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Participation</p>
                        <p className="text-3xl font-bold text-blue-600">{completedCount}/{allStudents.length}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{completionRate}% Completed</p>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Avg Score</p>
                        <p className="text-3xl font-bold text-purple-600">{stats.averageScore.toFixed(1)}</p>
                        <div className="w-full bg-slate-100 h-1.5 mt-2 rounded-full overflow-hidden">
                            <div className="bg-purple-500 h-full rounded-full" style={{ width: `${stats.averageScore}%` }} />
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Highest</p>
                        <p className="text-3xl font-bold text-emerald-600">{stats.highestScore}</p>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Lowest</p>
                        <p className="text-3xl font-bold text-red-600">{stats.lowestScore}</p>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Pending</p>
                        <p className="text-3xl font-bold text-amber-500">{notStartedCount}</p>
                    </div>
                </div>

                {/* Students Table */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h3 className="font-bold text-slate-800">Student Performance</h3>
                        <div className="flex gap-2">
                            {/* Filters could go here */}
                        </div>
                    </div>

                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                            <tr>
                                <th className="px-6 py-3">Student</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Time Taken</th>
                                <th className="px-6 py-3 text-right">Score</th>
                                <th className="px-6 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {studentRows.length > 0 ? studentRows.map((row: any) => (
                                <tr key={row.student.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden border border-slate-100">
                                                {row.student.user?.image ? (
                                                    <img src={row.student.user.image} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-bold">
                                                        {row.student.user?.name?.[0]}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-700">{row.student.user?.name}</p>
                                                <p className="text-xs text-slate-400">{row.student.user?.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {row.status === "COMPLETED" && (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                                                <CheckCircle2 className="w-3 h-3" /> Submitted
                                            </span>
                                        )}
                                        {row.status === "IN_PROGRESS" && (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200">
                                                <Clock className="w-3 h-3" /> In Progress
                                            </span>
                                        )}
                                        {row.status === "NOT_STARTED" && (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                                                <XCircle className="w-3 h-3" /> Not Started
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 font-mono text-xs">
                                        {row.attempt && row.attempt.completedAt
                                            ? Math.round((new Date(row.attempt.completedAt).getTime() - new Date(row.attempt.startedAt).getTime()) / 60000) + "m"
                                            : "--"}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {row.attempt ? (
                                            <span className={`font-bold px-2 py-1 rounded text-xs border ${(row.score || 0) >= (exam.passingGrade || 75)
                                                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                                : "bg-red-50 text-red-700 border-red-100"
                                                }`}>
                                                {row.score || 0} / {questions.reduce((a, b) => a + Number(b.points || 0), 0) || 100}
                                            </span>
                                        ) : (
                                            <span className="text-slate-300 font-bold">--</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {row.attempt ? (
                                            <button
                                                onClick={() => setSelectedAttempt(row.attempt)}
                                                className="text-xs font-bold text-purple-600 hover:text-purple-800 hover:bg-purple-50 px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-purple-200"
                                            >
                                                View Review
                                            </button>
                                        ) : (
                                            <button disabled className="text-xs font-bold text-slate-300 cursor-not-allowed px-3 py-1.5">
                                                No Data
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center text-slate-400">
                                        No students found in this class.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {selectedAttempt && (
                    <AttemptReviewModal
                        attempt={selectedAttempt}
                        questions={exam.examQuestions || []}
                        onClose={() => setSelectedAttempt(null)}
                    />
                )}
            </div>
        );
    }

    // --- VIEW: CREATE EXAM (Google Forms Style) ---
    return (
        <div className="max-w-3xl mx-auto pb-24">
            {/* Header / Nav */}
            <div className="sticky top-0 z-20 bg-slate-100/90 backdrop-blur-sm -mx-4 px-4 py-2 mb-6 flex justify-between items-center border-b border-transparent">
                <button onClick={() => setView('LIST')} className="flex items-center gap-2 text-slate-500 hover:text-purple-700 font-bold transition-colors">
                    <ArrowLeft className="w-5 h-5" /> Back
                </button>
                <div className="flex gap-3">
                    <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 flex items-center gap-2">
                        <span className="uppercase text-[10px] font-bold tracking-wider text-slate-400">Total Points</span>
                        <span className="text-purple-600 font-bold text-lg">{questions.reduce((a, b) => a + Number(b.points || 0), 0)}</span>
                    </div>
                    <button
                        onClick={() => handleSubmit(true)}
                        disabled={loading}
                        className="bg-white hover:bg-slate-50 text-slate-500 border border-slate-200 px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all text-sm"
                    >
                        <Save className="w-4 h-4" /> {classId ? "Save Draft" : "Save to Library"}
                    </button>
                    {classId && (
                        <button
                            onClick={() => handleSubmit(false)}
                            disabled={loading}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-bold shadow-md shadow-purple-200 flex items-center gap-2 transition-all"
                        >
                            {loading ? "Saving..." : "Publish Exam"}
                        </button>
                    )}
                </div>
            </div>

            {/* Title Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 border-t-8 border-t-purple-600 p-6 mb-6 relative group overflow-hidden">
                <input
                    className="w-full text-3xl font-bold text-slate-800 placeholder:text-slate-300 border-b-2 border-transparent focus:border-purple-600 focus:outline-none focus:bg-slate-50 transition-colors py-2 mb-2"
                    placeholder="Exam Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <textarea
                    className="w-full text-base text-slate-600 placeholder:text-slate-400 resize-none border-b border-transparent focus:border-purple-200 focus:outline-none focus:bg-slate-50 transition-colors py-2"
                    placeholder="Form description"
                    rows={1}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onInput={(e) => { e.currentTarget.style.height = "auto"; e.currentTarget.style.height = e.currentTarget.scrollHeight + "px"; }}
                />

                {/* Settings Inline */}
                <div className="flex gap-4 mt-4 pt-4 border-t border-slate-100">
                    <div className="flex-1">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Duration</label>
                        <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 border border-slate-200 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-200">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <input
                                type="number"
                                className="bg-transparent w-full text-sm font-bold text-slate-700 outline-none"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                            />
                            <span className="text-xs text-slate-400 font-medium">min</span>
                        </div>
                    </div>
                    <div className="flex-1">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Passing Score</label>
                        <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 border border-slate-200 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-200">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            <input
                                type="number"
                                className="bg-transparent w-full text-sm font-bold text-slate-700 outline-none"
                                value={passingGrade}
                                onChange={(e) => setPassingGrade(e.target.value)}
                            />
                            <span className="text-xs text-slate-400 font-medium font-mono">%</span>
                        </div>
                    </div>
                </div>

                {/* Date Settings (Only in Class Mode) */}
                {classId && (
                    <div className="flex gap-4 mt-4 pt-4 border-t border-slate-100">
                        <div className="flex-1">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Start Time (Optional)</label>
                            <input
                                type="datetime-local"
                                className="w-full bg-slate-50 rounded-lg px-3 py-2 border border-slate-200 focus:border-purple-500 text-sm font-bold text-slate-700 outline-none"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">End Time (Optional)</label>
                            <input
                                type="datetime-local"
                                className="w-full bg-slate-50 rounded-lg px-3 py-2 border border-slate-200 focus:border-purple-500 text-sm font-bold text-slate-700 outline-none"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Questions List */}
            <div className="space-y-4">
                {questions.map((q, i) => (
                    <div key={q.id || i} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 relative group transition-all hover:shadow-md">
                        {/* Drag Handle */}
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 text-slate-200 cursor-grab active:cursor-grabbing hover:text-slate-400">
                            <GripVertical className="w-4 h-4 rotate-90" />
                        </div>

                        <div className="flex flex-col md:flex-row gap-4 mb-4">
                            {/* Question Input */}
                            <div className="flex-1 bg-slate-50 rounded-lg px-4 py-3 border-b-2 border-slate-300 focus-within:border-purple-600 focus-within:bg-purple-50/20 transition-colors">
                                <input
                                    className="w-full bg-transparent text-lg font-medium text-slate-800 placeholder:text-slate-400 outline-none"
                                    placeholder="Question"
                                    value={q.questionText}
                                    onChange={(e) => updateQuestion(i, 'questionText', e.target.value)}
                                />
                            </div>

                            {/* Type Selector (Google Style) */}
                            <div className="w-full md:w-60 bg-white border border-slate-200 rounded-lg px-2 flex items-center cursor-pointer hover:bg-slate-50 relative group/select">
                                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                    {QUESTION_TYPES.find(t => t.value === q.type)?.icon}
                                </div>
                                <select
                                    className="w-full appearance-none bg-transparent outline-none font-medium text-slate-600 text-sm py-3 pl-10 pr-8 cursor-pointer"
                                    value={q.type}
                                    onChange={(e) => updateQuestion(i, 'type', e.target.value)}
                                >
                                    {QUESTION_TYPES.map(type => (
                                        <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* CONTENT AREA BASED ON TYPE */}

                        {/* 1. TEXT TYPES */}
                        {(q.type === 'SHORT_ANSWER' || q.type === 'PARAGRAPH') && (
                            <div className="mb-6 opacity-50 pl-2">
                                <div className={`border-b border-dotted border-slate-300 w-1/2 py-2 text-sm text-slate-400`}>
                                    {q.type === 'SHORT_ANSWER' ? 'Short answer text' : 'Long answer text'}
                                </div>
                            </div>
                        )}

                        {/* 2. MCQ / CHECKBOXES */}
                        {(q.type === 'MCQ' || q.type === 'CHECKBOXES') && (
                            <div className="space-y-2 mb-6">
                                {q.options.map((opt, oIndex) => (
                                    <div key={oIndex} className="flex items-center gap-3 group/option">
                                        <div
                                            onClick={() => {
                                                if (q.type === 'MCQ') {
                                                    updateQuestion(i, 'correctAnswer', opt);
                                                } else if (q.type === 'CHECKBOXES') {
                                                    let current = [];
                                                    try {
                                                        current = JSON.parse(q.correctAnswer || "[]");
                                                        if (!Array.isArray(current)) current = [];
                                                    } catch (e) { current = []; }

                                                    if (current.includes(opt)) {
                                                        current = current.filter((c: string) => c !== opt);
                                                    } else {
                                                        current.push(opt);
                                                    }
                                                    updateQuestion(i, 'correctAnswer', JSON.stringify(current));
                                                }
                                            }}
                                            className={`w-5 h-5 border-2 flex items-center justify-center cursor-pointer transition-all
                                                ${q.type === 'MCQ' ? 'rounded-full' : 'rounded-sm'}
                                                ${(q.type === 'MCQ' && q.correctAnswer === opt && opt !== "") || (q.type === 'CHECKBOXES' && (q.correctAnswer || "").includes(`"${opt}"`))
                                                    ? "border-emerald-500 bg-emerald-50"
                                                    : "border-slate-300 hover:border-slate-400"
                                                }`}
                                        >
                                            {q.type === 'MCQ' && q.correctAnswer === opt && opt !== "" && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />}
                                            {q.type === 'CHECKBOXES' && (q.correctAnswer || "").includes(`"${opt}"`) && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-sm" />}
                                        </div>

                                        <textarea
                                            ref={(el) => {
                                                // @ts-ignore
                                                if (!window.optionRefs) window.optionRefs = {};
                                                // @ts-ignore
                                                window.optionRefs[`${i}-${oIndex}`] = el;
                                            }}
                                            className="flex-1 text-sm text-slate-700 outline-none border-b border-transparent hover:border-slate-200 focus:border-purple-500 py-1 resize-none overflow-hidden bg-transparent"
                                            value={opt}
                                            rows={1}
                                            onChange={(e) => {
                                                updateOption(i, oIndex, e.target.value);
                                                e.target.style.height = 'auto';
                                                e.target.style.height = e.target.scrollHeight + 'px';
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    addOption(i);
                                                    setTimeout(() => {
                                                        // @ts-ignore
                                                        const nextInput = window.optionRefs[`${i}-${oIndex + 1}`];
                                                        if (nextInput) nextInput.focus();
                                                    }, 0);
                                                }
                                            }}
                                            placeholder={`Option ${oIndex + 1}`}
                                        />

                                        {q.options.length > 1 && (
                                            <button onClick={() => removeOption(i, oIndex)} className="text-slate-300 hover:text-red-400 opacity-0 group-hover/option:opacity-100 transition-opacity">
                                                <XCircle className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <div className="flex gap-2 items-center mt-2 pl-8">
                                    <button onClick={() => addOption(i)} className="text-sm font-bold text-slate-400 hover:text-purple-600 flex items-center gap-1 transition-colors">
                                        Add option
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* 3. FILE UPLOAD */}
                        {q.type === 'FILE_UPLOAD' && (
                            <div className="mb-6 border border-slate-200 rounded-lg p-4 flex flex-col items-center justify-center bg-slate-50 text-slate-400 gap-2">
                                <UploadCloud className="w-8 h-8 opacity-50" />
                                <span className="text-sm font-medium">File upload enabled for students</span>
                            </div>
                        )}

                        {/* 4. LINEAR SCALE */}
                        {q.type === 'LINEAR_SCALE' && (
                            <div className="mb-6 space-y-4">
                                <div className="flex items-center gap-4">
                                    <select
                                        className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-sm"
                                        value={q.scaleMin || 1}
                                        onChange={(e) => updateQuestion(i, 'scaleMin', Number(e.target.value))}
                                    >
                                        <option value="0">0</option>
                                        <option value="1">1</option>
                                    </select>
                                    <span className="text-xs font-bold text-slate-400">to</span>
                                    <select
                                        className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-sm"
                                        value={q.scaleMax || 5}
                                        onChange={(e) => updateQuestion(i, 'scaleMax', Number(e.target.value))}
                                    >
                                        {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => <option key={n} value={n}>{n}</option>)}
                                    </select>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-xs font-mono text-slate-400 w-6 text-right">{q.scaleMin || 1}</span>
                                    <input
                                        className="border-b border-transparent hover:border-slate-200 focus:border-purple-500 outline-none text-sm py-1 placeholder:text-slate-300"
                                        placeholder="Label (optional)"
                                        value={q.scaleMinLabel || ""}
                                        onChange={(e) => updateQuestion(i, 'scaleMinLabel', e.target.value)}
                                    />
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-xs font-mono text-slate-400 w-6 text-right">{q.scaleMax || 5}</span>
                                    <input
                                        className="border-b border-transparent hover:border-slate-200 focus:border-purple-500 outline-none text-sm py-1 placeholder:text-slate-300"
                                        placeholder="Label (optional)"
                                        value={q.scaleMaxLabel || ""}
                                        onChange={(e) => updateQuestion(i, 'scaleMaxLabel', e.target.value)}
                                    />
                                </div>

                                {/* Scale Preview */}
                                <div className="mt-6 flex items-end justify-center gap-8 px-4 pt-4 border-t border-slate-50">
                                    {q.scaleMinLabel && <span className="text-xs font-bold text-slate-400 mb-2">{q.scaleMinLabel}</span>}
                                    <div className="flex items-center gap-4">
                                        {Array.from({ length: (q.scaleMax || 5) - (q.scaleMin || 1) + 1 }).map((_, idx) => {
                                            const val = (q.scaleMin || 1) + idx;
                                            return (
                                                <div key={val} className="flex flex-col items-center gap-2">
                                                    <span className="text-xs font-medium text-slate-500">{val}</span>
                                                    <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {q.scaleMaxLabel && <span className="text-xs font-bold text-slate-400 mb-2">{q.scaleMaxLabel}</span>}
                                </div>
                            </div>
                        )}

                        {/* 5. RATING */}
                        {q.type === 'RATING' && (
                            <div className="mb-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-xs font-bold text-slate-400 uppercase">Max Rating:</span>
                                    <select
                                        className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-sm font-bold text-slate-700"
                                        value={q.scaleMax || 5}
                                        onChange={(e) => updateQuestion(i, 'scaleMax', Number(e.target.value))}
                                    >
                                        {[3, 4, 5, 6, 7, 8, 9, 10].map(n => <option key={n} value={n}>{n} Stars</option>)}
                                    </select>
                                </div>
                                <div className="flex gap-2">
                                    {Array.from({ length: q.scaleMax || 5 }).map((_, idx) => (
                                        <Star key={idx} className="w-8 h-8 text-slate-200 fill-slate-100" />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 5. GRIDS */}
                        {(q.type === 'GRID_MCQ' || q.type === 'GRID_CHECKBOX') && (
                            <div className="mb-6 grid grid-cols-2 gap-8">
                                <div>
                                    <h5 className="text-xs font-bold text-slate-500 mb-2 uppercase">Rows</h5>
                                    <div className="space-y-2">
                                        {(q.rows || ['Row 1']).map((row, rIdx) => (
                                            <div key={rIdx} className="flex items-center gap-2 group/row">
                                                <span className="text-xs text-slate-400">{rIdx + 1}.</span>
                                                <textarea
                                                    ref={(el) => {
                                                        // @ts-ignore
                                                        if (!window.gridRowRefs) window.gridRowRefs = {};
                                                        // @ts-ignore
                                                        window.gridRowRefs[`${i}-${rIdx}`] = el;
                                                    }}
                                                    className="flex-1 text-sm border-b border-transparent hover:border-slate-200 focus:border-purple-500 outline-none resize-none overflow-hidden bg-transparent py-1"
                                                    value={row}
                                                    rows={1}
                                                    onChange={(e) => {
                                                        updateGridItem(i, 'rows', rIdx, e.target.value);
                                                        e.target.style.height = 'auto';
                                                        e.target.style.height = e.target.scrollHeight + 'px';
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && !e.shiftKey) {
                                                            e.preventDefault();
                                                            addGridItem(i, 'rows');
                                                            setTimeout(() => {
                                                                // @ts-ignore
                                                                const nextInput = window.gridRowRefs[`${i}-${rIdx + 1}`];
                                                                if (nextInput) nextInput.focus();
                                                            }, 0);
                                                        }
                                                    }}
                                                    placeholder={`Row ${rIdx + 1}`}
                                                />
                                                <button onClick={() => removeGridItem(i, 'rows', rIdx)} className="opacity-0 group-hover/row:opacity-100 text-slate-300 hover:text-red-400"><XCircle className="w-4 h-4" /></button>
                                            </div>
                                        ))}
                                        <button onClick={() => addGridItem(i, 'rows')} className="text-xs font-bold text-slate-400 hover:text-purple-600 mt-2">Add row</button>
                                    </div>
                                </div>
                                <div>
                                    <h5 className="text-xs font-bold text-slate-500 mb-2 uppercase">Columns</h5>
                                    <div className="space-y-2">
                                        {(q.cols || ['Column 1']).map((col, cIdx) => (
                                            <div key={cIdx} className="flex items-center gap-2 group/col">
                                                <div className={`w-3 h-3 border border-slate-300 ${q.type === 'GRID_MCQ' ? 'rounded-full' : 'rounded-sm'}`} />
                                                <textarea
                                                    ref={(el) => {
                                                        // @ts-ignore
                                                        if (!window.gridColRefs) window.gridColRefs = {};
                                                        // @ts-ignore
                                                        window.gridColRefs[`${i}-${cIdx}`] = el;
                                                    }}
                                                    className="flex-1 text-sm border-b border-transparent hover:border-slate-200 focus:border-purple-500 outline-none resize-none overflow-hidden bg-transparent py-1"
                                                    value={col}
                                                    rows={1}
                                                    onChange={(e) => {
                                                        updateGridItem(i, 'cols', cIdx, e.target.value);
                                                        e.target.style.height = 'auto';
                                                        e.target.style.height = e.target.scrollHeight + 'px';
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && !e.shiftKey) {
                                                            e.preventDefault();
                                                            addGridItem(i, 'cols');
                                                            setTimeout(() => {
                                                                // @ts-ignore
                                                                const nextInput = window.gridColRefs[`${i}-${cIdx + 1}`];
                                                                if (nextInput) nextInput.focus();
                                                            }, 0);
                                                        }
                                                    }}
                                                    placeholder={`Column ${cIdx + 1}`}
                                                />
                                                <button onClick={() => removeGridItem(i, 'cols', cIdx)} className="opacity-0 group-hover/col:opacity-100 text-slate-300 hover:text-red-400"><XCircle className="w-4 h-4" /></button>
                                            </div>
                                        ))}
                                        <button onClick={() => addGridItem(i, 'cols')} className="text-xs font-bold text-slate-400 hover:text-purple-600 mt-2">Add column</button>
                                    </div>
                                </div>
                            </div>
                        )}


                        {/* Footer Actions */}
                        <div className="flex items-center justify-end gap-0 border-t border-slate-100 pt-3 mt-4">
                            <div className="flex items-center gap-2 border-r border-slate-200 pr-4 mr-4">
                                <span className="text-xs uppercase font-bold text-slate-400">Points</span>
                                <input
                                    type="number"
                                    className="w-12 text-center text-sm font-bold text-slate-700 bg-slate-50 rounded border border-slate-200 py-1"
                                    value={q.points}
                                    onChange={(e) => updateQuestion(i, 'points', e.target.value)}
                                />
                            </div>
                            <button onClick={() => insertQuestion(i + 1)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full hover:text-purple-600" title="Add Question Below">
                                <PlusCircle className="w-5 h-5" />
                            </button>
                            <button onClick={() => removeQuestion(i)} className="p-2 text-slate-400 hover:bg-red-50 rounded-full hover:text-red-500" title="Delete">
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Floating Action Menu */}
            <div className="fixed bottom-8 right-8 flex flex-col items-end gap-3 pointer-events-none">
                <div className="pointer-events-auto shadow-lg shadow-purple-900/20 bg-white rounded-full p-1.5 flex flex-col gap-2 border border-slate-100">
                    <button onClick={addQuestion} className="w-10 h-10 bg-white hover:bg-slate-50 rounded-full text-slate-500 hover:text-purple-600 flex items-center justify-center transition-colors" title="Add Question">
                        <Plus className="w-6 h-6 border-[3px] border-current rounded-full p-0.5" />
                    </button>
                </div>
            </div>



        </div>
    );
}

// --- HELPER COMPONENT: Attempt Review Modal ---
function AttemptReviewModal({ attempt, questions, onClose }: { attempt: any, questions: any[], onClose: () => void }) {
    if (!attempt) return null;

    const answers = typeof attempt.answers === 'string'
        ? JSON.parse(attempt.answers)
        : attempt.answers || {};

    return (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm">
                            {attempt.student.user.image ? <img src={attempt.student.user.image} /> : null}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800">{attempt.student.user.name}'s Result</h3>
                            <p className="text-xs text-slate-500">Score: <span className="font-bold text-purple-600">{attempt.score}</span></p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                        <XCircle className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
                    {questions.map((q, i) => {
                        const studentAnswer = answers[q.id];
                        const isCorrect = JSON.stringify(studentAnswer) === JSON.stringify(q.correctAnswer) || studentAnswer === q.correctAnswer;

                        return (
                            <div key={q.id} className={`bg-white p-5 rounded-xl border-l-4 shadow-sm ${isCorrect ? 'border-l-emerald-500' : 'border-l-red-500'}`}>
                                <h4 className="font-bold text-slate-800 mb-2 flex gap-2">
                                    <span className="text-slate-400">{i + 1}.</span>
                                    {q.questionText}
                                </h4>

                                <div className="grid md:grid-cols-2 gap-4 mt-4 text-sm">
                                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Student Answer</p>
                                        <p className={`font-medium ${isCorrect ? 'text-emerald-700' : 'text-red-700'}`}>
                                            {typeof studentAnswer === 'object' ? JSON.stringify(studentAnswer) : (studentAnswer || "No Answer")}
                                        </p>
                                    </div>
                                    <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                                        <p className="text-[10px] font-bold text-purple-400 uppercase tracking-wider mb-1">Correct Answer</p>
                                        <p className="font-medium text-purple-700">
                                            {q.correctAnswer || "Not set"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
