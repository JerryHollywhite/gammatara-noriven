"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Folder, Video, FileText, Check, Search, Plus, Save } from "lucide-react";
import { Program, Subject } from "@/types/tara";

export default function ContentManagerPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [programs, setPrograms] = useState<Program[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [selectedProgramId, setSelectedProgramId] = useState("");
    const [selectedSubjectId, setSelectedSubjectId] = useState("");

    // Form State
    const [lessonTitle, setLessonTitle] = useState("");
    const [lessonDesc, setLessonDesc] = useState("");
    const [videoDriveId, setVideoDriveId] = useState("");

    // Drive Picker State
    const [showPicker, setShowPicker] = useState(false);
    const [driveFiles, setDriveFiles] = useState<any[]>([]);
    const [driveQuery, setDriveQuery] = useState("");
    const [pickerLoading, setPickerLoading] = useState(false);

    useEffect(() => {
        if (status === "loading") return;

        if (status === "unauthenticated") {
            router.push("/login");
            return;
        }

        // Allow ADMIN and TEACHER
        const userRole = (session?.user as any)?.role;
        if (userRole !== "ADMIN" && userRole !== "TEACHER") {
            router.push("/");
            return;
        }

        fetchPrograms();
    }, [status, session]);

    useEffect(() => {
        if (selectedProgramId) fetchSubjects(selectedProgramId);
    }, [selectedProgramId]);

    const fetchPrograms = async () => {
        const res = await fetch("/api/tara/content?type=programs");
        const data = await res.json();
        if (data.success) setPrograms(data.data);
    };

    const fetchSubjects = async (progId: string) => {
        const res = await fetch(`/api/tara/content?type=subjects&id=${progId}`);
        const data = await res.json();
        if (data.success) {
            setSubjects(data.data);
            if (data.data.length > 0) setSelectedSubjectId(data.data[0].id);
        }
    };

    // Drive Picker Logic
    const searchDrive = async () => {
        setPickerLoading(true);
        try {
            const res = await fetch(`/api/tara/admin/files?query=${driveQuery}`);
            const data = await res.json();
            if (data.success) setDriveFiles(data.files);
        } finally {
            setPickerLoading(false);
        }
    };

    const selectFile = (file: any) => {
        setVideoDriveId(file.id);
        setShowPicker(false);
    };

    const handleSubmit = async () => {
        if (!selectedSubjectId || !lessonTitle) {
            alert("Please fill Title and Subject");
            return;
        }

        const newLesson = {
            id: `L_${Date.now()}`, // Temporary ID gen
            subjectId: selectedSubjectId,
            title: lessonTitle,
            description: lessonDesc,
            videoDriveId: videoDriveId,
            order: 99 // Default order, user can sort in logic later or I can fetch max order
        };

        const res = await fetch("/api/tara/content", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newLesson)
        });

        const data = await res.json();
        if (data.success) {
            alert("Lesson Added Successfully!");
            setLessonTitle("");
            setLessonDesc("");
            setVideoDriveId("");
        } else {
            alert("Failed: " + data.error);
        }
    };

    if (status === "loading") return <div className="p-8">Loading...</div>;

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4">
            <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 mb-6">
                    TaraLMS Content Manager
                </h1>

                {/* 1. Select Context */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Program Level</label>
                        <select
                            className="w-full p-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                            value={selectedProgramId}
                            onChange={(e) => setSelectedProgramId(e.target.value)}
                        >
                            <option value="">Select Level</option>
                            {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Subject</label>
                        <select
                            className="w-full p-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                            value={selectedSubjectId}
                            onChange={(e) => setSelectedSubjectId(e.target.value)}
                        >
                            <option value="">Select Subject</option>
                            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                </div>

                {/* 2. Add Lesson Form */}
                <div className="border-t border-slate-100 pt-8">
                    <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Plus className="w-5 h-5 text-green-500" /> Add New Lesson
                    </h2>

                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder="Lesson Title"
                            className="w-full p-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                            value={lessonTitle}
                            onChange={(e) => setLessonTitle(e.target.value)}
                        />
                        <textarea
                            placeholder="Description"
                            className="w-full p-3 rounded-xl border border-slate-200 bg-white text-slate-900 h-24 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                            value={lessonDesc}
                            onChange={(e) => setLessonDesc(e.target.value)}
                        />

                        {/* Video Picker Field */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Media</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Google Drive ID (or pick from list)"
                                    className="flex-1 p-3 rounded-xl border border-slate-200 font-mono text-sm bg-white text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    value={videoDriveId}
                                    onChange={(e) => setVideoDriveId(e.target.value)}
                                />
                                <button
                                    onClick={() => { setShowPicker(true); searchDrive(); }}
                                    className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-100 transition-colors"
                                >
                                    <Folder className="w-4 h-4" /> Pick File
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={handleSubmit}
                            className="w-full py-4 bg-primary text-white rounded-xl font-bold hover:shadow-lg hover:shadow-primary/30 transition-all mt-4 flex items-center justify-center gap-2"
                        >
                            <Save className="w-5 h-5" /> Save Lesson to Sheet
                        </button>
                    </div>
                </div>
            </div>

            {/* Drive Picker Modal */}
            {showPicker && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-lg text-slate-900">Select File from Drive</h3>
                            <button onClick={() => setShowPicker(false)} className="text-slate-400 hover:text-red-500">Close</button>
                        </div>

                        <div className="p-4 border-b border-slate-100 flex gap-2">
                            <input
                                type="text"
                                placeholder="Search filename..."
                                className="flex-1 p-2 rounded-lg border border-slate-200 bg-white text-slate-900"
                                value={driveQuery}
                                onChange={(e) => setDriveQuery(e.target.value)}
                            />
                            <button onClick={searchDrive} className="p-2 bg-slate-800 text-white rounded-lg">
                                <Search className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {pickerLoading && <div className="text-center p-4">Loading files...</div>}

                            {!pickerLoading && driveFiles.map(file => (
                                <div
                                    key={file.id}
                                    onClick={() => selectFile(file)}
                                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 transition-all group"
                                >
                                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                                        {file.mimeType.includes('video') ? <Video className="w-5 h-5 text-red-500" /> : <FileText className="w-5 h-5 text-blue-500" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-slate-700 truncate">{file.name}</p>
                                        <p className="text-xs text-slate-400 font-mono">{file.id}</p>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 text-primary font-bold text-sm flex items-center gap-1">
                                        Select <Check className="w-4 h-4" />
                                    </div>
                                </div>
                            ))}

                            {!pickerLoading && driveFiles.length === 0 && (
                                <div className="text-center py-12 text-slate-400">
                                    <p>No files found.</p>
                                    <p className="text-xs mt-2">Did you share your folder with the Service Account?</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
