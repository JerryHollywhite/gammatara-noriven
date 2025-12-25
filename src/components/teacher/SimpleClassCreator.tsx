"use client";

import { useState, useEffect } from "react";
import { Check } from "lucide-react";

interface Program {
    id: string;
    name: string;
    code: string;
}

interface SimpleClassCreatorProps {
    onClassCreated: () => void;
}

export default function SimpleClassCreator({ onClassCreated }: SimpleClassCreatorProps) {
    const [className, setClassName] = useState("");
    const [selectedProgramId, setSelectedProgramId] = useState("");
    const [programs, setPrograms] = useState<Program[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetch('/api/teacher/programs').then(res => res.json()).then(data => { if (data.success) setPrograms(data.programs); });
    }, []);

    const handleCreate = async () => {
        if (!className) {
            alert("Please enter a class name.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/teacher/classes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: className,
                    programId: selectedProgramId || undefined,
                    studentIds: [], // Empty initially
                    subjectIds: []  // Empty initially
                })
            });
            const json = await res.json();
            if (json.success) {
                alert("Class created successfully! Now you can manage it from the dashboard.");
                onClassCreated();
            } else {
                alert(json.error || "Failed to create class");
            }
        } catch (e) {
            alert("Error creating class");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl md:min-w-[400px]">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Create New Class</h3>
            <p className="text-sm text-slate-500 mb-6">Start by naming your class. You can add students and subjects later.</p>

            <div className="space-y-4">
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
                    <label className="block text-sm font-medium text-slate-700 mb-1">Program (Optional)</label>
                    <select
                        value={selectedProgramId}
                        onChange={(e) => setSelectedProgramId(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-white"
                    >
                        <option value="">-- Select Program --</option>
                        {programs.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={handleCreate}
                    disabled={loading}
                    className="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                >
                    {loading ? "Creating..." : <Check className="w-5 h-5" />} Create Class
                </button>
            </div>
        </div>
    );
}
