"use client";

import { useState, useEffect } from "react";
import { Users, Plus, Check, Search } from "lucide-react";

interface Student {
    id: string;
    name: string;
    email: string;
}

interface TeacherClassManagerProps {
    onClassCreated?: () => void;
}

export default function TeacherClassManager({ onClassCreated }: TeacherClassManagerProps) {
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
    const [className, setClassName] = useState("");
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");

    // Fetch students list
    useEffect(() => {
        fetch('/api/teacher/classes')
            .then(res => res.json())
            .then(data => {
                if (data.success) setStudents(data.students);
            });
    }, []);

    const handleCreateClass = async () => {
        if (!className || selectedStudents.length === 0) {
            alert("Please enter a class name and select at least one student.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/teacher/classes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: className, studentIds: selectedStudents })
            });
            const json = await res.json();
            if (json.success) {
                alert("Class created successfully!");
                setClassName("");
                setSelectedStudents([]);
                if (onClassCreated) onClassCreated();
            } else {
                alert(json.error || "Failed");
            }
        } catch (e) {
            alert("Error creating class");
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

    const filteredStudents = students.filter(s =>
        (s.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (s.email?.toLowerCase() || "").includes(search.toLowerCase())
    );

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                Manage Classes
            </h3>

            <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Class Name</label>
                <input
                    type="text"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    placeholder="e.g. Mathematics - Grade 10 A"
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
            </div>

            <div className="mb-4">
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
                onClick={handleCreateClass}
                disabled={loading}
                className="w-full py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
                {loading ? "Creating..." : <><Plus className="w-4 h-4" /> Create Class</>}
            </button>
        </div>
    );
}
