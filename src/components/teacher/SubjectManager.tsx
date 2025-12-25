"use client";

import { useState, useEffect } from "react";
import { Plus, BookOpen } from "lucide-react";

interface Program {
    id: string;
    name: string;
    code: string;
}

interface Subject {
    id: string;
    name: string;
    code: string;
    program?: { name: string };
}

export default function SubjectManager() {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [programs, setPrograms] = useState<Program[]>([]);

    // Form State
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [programId, setProgramId] = useState("");
    const [desc, setDesc] = useState("");

    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchData();
        fetchPrograms();
    }, []);

    const fetchData = async () => {
        const res = await fetch('/api/teacher/subjects');
        const data = await res.json();
        if (data.success) setSubjects(data.subjects);
    };

    const fetchPrograms = async () => {
        const res = await fetch('/api/teacher/programs');
        const data = await res.json();
        if (data.success) setPrograms(data.programs);
    };

    const handleCreate = async () => {
        if (!name || !code || !programId) {
            alert("Please fill in Name, Code, and select a Program.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/teacher/subjects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, code, programId, description: desc })
            });
            const json = await res.json();

            if (json.success) {
                alert("Subject Created Successfully!");
                setSubjects([...subjects, json.subject]);
                setName(""); setCode(""); setProgramId(""); setDesc("");
                setIsOpen(false);
                // Refresh list
                fetchData();
            } else {
                alert(json.error || "Failed");
            }
        } catch (e) {
            alert("Error creating subject");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete/archive subject "${name}"?`)) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/teacher/subjects/${id}`, {
                method: 'DELETE'
            });
            const json = await res.json();

            if (json.success) {
                alert(json.message);
                fetchData();
            } else {
                alert(json.error || "Failed to delete");
            }
        } catch (e) {
            alert("Error deleting subject");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mt-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                    Subject Manager
                </h3>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100 flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Add Subject
                </button>
            </div>

            {/* Create Form */}
            {isOpen && (
                <div className="mb-8 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <h4 className="font-semibold text-slate-700 mb-4">Create New Subject</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Subject Name</label>
                            <input
                                autoFocus
                                type="text"
                                placeholder="e.g. Mathematics Grade 10"
                                value={name}
                                onChange={e => {
                                    setName(e.target.value);
                                    // Auto-generate code if empty
                                    if (!code && e.target.value) {
                                        setCode(e.target.value.toUpperCase().replace(/\s+/g, '_').substring(0, 10));
                                    }
                                }}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Subject Code (ID)</label>
                            <input
                                type="text"
                                placeholder="e.g. MATH_10"
                                value={code}
                                onChange={e => setCode(e.target.value.toUpperCase())}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono uppercase"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Program</label>
                            <select
                                value={programId}
                                onChange={e => setProgramId(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                            >
                                <option value="">-- Select Program --</option>
                                {programs.map(p => (
                                    <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Description (Optional)</label>
                            <input
                                type="text"
                                placeholder="Brief description"
                                value={desc}
                                onChange={e => setDesc(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                            />
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                        <button onClick={() => setIsOpen(false)} className="px-4 py-2 text-slate-600 text-sm">Cancel</button>
                        <button
                            onClick={handleCreate}
                            disabled={loading}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {loading ? "Saving..." : "Create Subject"}
                        </button>
                    </div>
                </div>
            )}

            {/* List */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                        <tr>
                            <th className="px-4 py-3">Code</th>
                            <th className="px-4 py-3">Subject Name</th>
                            <th className="px-4 py-3">Program</th>
                            <th className="px-4 py-3 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subjects.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-4 py-8 text-center text-slate-400">No subjects found. Create one above!</td>
                            </tr>
                        ) : (
                            subjects.map(sub => (
                                <tr key={sub.id} className="border-b border-slate-100 hover:bg-slate-50">
                                    <td className="px-4 py-3 font-mono text-slate-600">{sub.code}</td>
                                    <td className="px-4 py-3 font-medium text-slate-800">{sub.name}</td>
                                    <td className="px-4 py-3 text-slate-600">
                                        <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs">
                                            {sub.program?.name || '-'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right text-slate-400 text-xs">
                                        <button
                                            onClick={() => handleDelete(sub.id, sub.name)}
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                                            title="Delete Subject"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
