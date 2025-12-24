"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Save, FileText, CheckSquare, Clock } from "lucide-react";

interface Question {
    questionText: string;
    type: 'MCQ' | 'ESSAY';
    options: string[]; // For UI, we handle this as array
    correctAnswer: string;
    points: number;
}

export default function TeacherExamManager({ subjectId }: { subjectId: string }) {
    const [exams, setExams] = useState<any[]>([]);
    const [view, setView] = useState<'LIST' | 'CREATE'>('LIST');
    const [loading, setLoading] = useState(false);

    // Form State
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [duration, setDuration] = useState(60);
    const [passingGrade, setPassingGrade] = useState(75);
    const [questions, setQuestions] = useState<Question[]>([]);

    useEffect(() => {
        if (subjectId) fetchExams();
    }, [subjectId]);

    const fetchExams = async () => {
        if (!subjectId) return;
        try {
            const res = await fetch(`/api/teacher/exams?subjectId=${subjectId}`);
            const json = await res.json();
            if (json.success) setExams(json.exams);
        } catch (e) {
            console.error(e);
        }
    };

    const addQuestion = () => {
        setQuestions([...questions, {
            questionText: "",
            type: "MCQ",
            options: ["", "", "", ""],
            correctAnswer: "",
            points: 10
        }]);
    };

    const updateQuestion = (index: number, field: keyof Question, value: any) => {
        const newQuestions = [...questions];
        // @ts-ignore
        newQuestions[index][field] = value;
        setQuestions(newQuestions);
    };

    const updateOption = (qIndex: number, oIndex: number, value: string) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options[oIndex] = value;
        setQuestions(newQuestions);
    };

    const removeQuestion = (index: number) => {
        const newQuestions = [...questions];
        newQuestions.splice(index, 1);
        setQuestions(newQuestions);
    };

    const handleSubmit = async () => {
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
                durationMinutes: duration,
                passingGrade,
                questions
            };

            const res = await fetch('/api/teacher/exams', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const json = await res.json();
            if (json.success) {
                alert("Exam Created Successfully!");
                setView('LIST');
                setTitle("");
                setQuestions([]);
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

    if (view === 'LIST') {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">Subject Exams</h3>
                        <p className="text-slate-500 text-sm">Manage assessments for this subject.</p>
                    </div>
                    <button
                        onClick={() => setView('CREATE')}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Create Exam
                    </button>
                </div>

                <div className="grid gap-4">
                    {exams.length === 0 ? (
                        <p className="text-slate-400 text-center py-8">No exams created yet.</p>
                    ) : (
                        exams.map((exam: any) => (
                            <div key={exam.id} className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition bg-white">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-lg">{exam.title}</h4>
                                        <div className="flex gap-4 text-xs text-slate-500 mt-1">
                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {exam.durationMinutes} mins</span>
                                            <span className="flex items-center gap-1"><CheckSquare className="w-3 h-3" /> {exam._count?.examQuestions || 0} Questions</span>
                                        </div>
                                    </div>
                                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded">Active</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => setView('LIST')} className="text-slate-500 hover:text-slate-800 text-sm font-bold">← Back to List</button>
                <h3 className="text-xl font-bold text-slate-800">Create New Exam</h3>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl space-y-4 border border-slate-200">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Exam Title</label>
                        <input className="w-full p-2 border rounded-xl" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Midterm Physics" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Passing Grade</label>
                        <input type="number" className="w-full p-2 border rounded-xl" value={passingGrade} onChange={e => setPassingGrade(Number(e.target.value))} />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Description</label>
                    <textarea className="w-full p-2 border rounded-xl h-20" value={description} onChange={e => setDescription(e.target.value)} placeholder="Instructions for students..." />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Duration (Minutes)</label>
                    <input type="number" className="w-full p-2 border rounded-xl" value={duration} onChange={e => setDuration(Number(e.target.value))} />
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-end">
                    <h4 className="font-bold text-lg text-slate-800">Questions ({questions.length})</h4>
                    <button onClick={addQuestion} className="text-indigo-600 font-bold text-xs bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100">+ Add Question</button>
                </div>

                {questions.map((q, i) => (
                    <div key={i} className="bg-white border border-slate-200 p-4 rounded-xl relative group">
                        <button onClick={() => removeQuestion(i)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                        <div className="flex gap-2 items-center mb-2">
                            <span className="font-bold text-slate-400">#{i + 1}</span>
                            <input
                                className="flex-1 p-2 border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none font-bold text-slate-800 placeholder:font-normal transition-colors"
                                placeholder="Enter Question Text..."
                                value={q.questionText}
                                onChange={e => updateQuestion(i, 'questionText', e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-2 pl-6">
                            {q.options.map((opt, oIndex) => (
                                <div key={oIndex} className="flex items-center gap-2">
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] font-bold cursor-pointer transition
                                        ${q.correctAnswer === opt && opt !== "" ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300 text-slate-400"}`}
                                        onClick={() => updateQuestion(i, 'correctAnswer', opt)}
                                    >
                                        {['A', 'B', 'C', 'D'][oIndex]}
                                    </div>
                                    <input
                                        className="flex-1 p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-indigo-200 focus:outline-none transition-colors"
                                        placeholder={`Option ${oIndex + 1}`}
                                        value={opt}
                                        onChange={e => updateOption(i, oIndex, e.target.value)}
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="pl-6 mt-2 text-xs text-slate-400 flex justify-between">
                            <span>Click the circle to mark correct answer.</span>
                            <input
                                type="number"
                                className="w-16 p-1 border rounded text-center"
                                value={q.points}
                                onChange={e => updateQuestion(i, 'points', Number(e.target.value))}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="pt-6 border-t border-slate-100 sticky bottom-0 bg-white p-4 -mx-4 -mb-4 rounded-b-2xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] flex justify-end">
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 flex items-center gap-2 disabled:opacity-50"
                >
                    {loading ? "Saving Exam..." : <><Save className="w-4 h-4" /> Save Exam</>}
                </button>
            </div>
        </div>
    );
}
