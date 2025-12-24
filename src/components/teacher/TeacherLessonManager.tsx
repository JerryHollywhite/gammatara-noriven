"use client";

import { useState, useEffect } from "react";
import { BookOpen, Plus, Upload, Youtube, FileText } from "lucide-react";

interface Subject {
    id: string; // CODE
    name: string;
}

export default function TeacherLessonManager() {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [selectedSubject, setSelectedSubject] = useState("");

    // Form
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [youtube, setYoutube] = useState("");
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [creating, setCreating] = useState(false);

    // Fetch subjects available
    useEffect(() => {
        setSubjects([
            { id: "CALISTUNG", name: "Calistung" },
            { id: "MATH_SD_1", name: "Mathematics Grade 1" },
            { id: "ENGLISH_SD_1", name: "English Grade 1" },
            { id: "ADAB_KARAKTER", name: "Adab & Karakter" }
        ]);
    }, []);

    const handleCreateLesson = async () => {
        if (!selectedSubject || !title) {
            alert("Subject and Title are required");
            return;
        }

        setCreating(true);
        let fileUrl = "";

        try {
            // 1. Upload Files
            const uploadedAttachments = [];

            if (files.length > 0) {
                setUploading(true);

                for (const f of files) {
                    const formData = new FormData();
                    formData.append("file", f);

                    const uploadRes = await fetch("/api/teacher/upload", {
                        method: "POST",
                        body: formData
                    });
                    const uploadJson = await uploadRes.json();

                    if (uploadJson.success) {
                        uploadedAttachments.push({
                            name: f.name,
                            url: uploadJson.file.id, // Drive ID
                            type: f.type,
                            size: f.size
                        });
                    } else {
                        // If one fails, ask user to retry or continue?
                        // For now, alert and stop.
                        alert(`Failed to upload ${f.name}: ${uploadJson.error}`);
                        setCreating(false);
                        setUploading(false);
                        return;
                    }
                }
                setUploading(false);
            }

            // Legacy support: set first file as fileUrl for old UI
            fileUrl = uploadedAttachments.length > 0 ? uploadedAttachments[0].url : "";

            // 2. Create Lesson
            const res = await fetch("/api/teacher/lessons", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    subjectId: selectedSubject,
                    title,
                    description: desc,
                    videoUrl: youtube,
                    fileUrl: fileUrl, // Primary file
                    attachments: uploadedAttachments, // All files
                    order: 0
                })
            });

            const json = await res.json();
            if (json.success) {
                alert("Lesson created successfully!");
                setTitle("");
                setDesc("");
                setYoutube("");
                setFiles([]);
            } else {
                alert(json.error || "Failed to create lesson");
            }

        } catch (e) {
            console.error(e);
            alert("Error creating lesson");
        } finally {
            setCreating(false);
            setUploading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mt-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                Create Lesson Material
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                    <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                    >
                        <option value="">Select Subject</option>
                        {subjects.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Lesson Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Intro to Algebra"
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Brief summary of the lesson..."
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                        <Youtube className="w-4 h-4 text-red-500" /> YouTube Link
                    </label>
                    <input
                        type="text"
                        value={youtube}
                        onChange={(e) => setYoutube(e.target.value)}
                        placeholder="https://youtube.com/..."
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                        <Upload className="w-4 h-4 text-blue-500" /> File Upload (Max 20MB, No Video)
                    </label>
                    <div className="relative">
                        <input
                            type="file"
                            multiple // Enable multiple
                            onChange={(e) => {
                                const selected = e.target.files;
                                if (selected) {
                                    const validFiles: File[] = [];
                                    for (let i = 0; i < selected.length; i++) {
                                        const f = selected[i];
                                        if (f.size > 20 * 1024 * 1024) {
                                            alert(`File ${f.name} too large (Size tidak lebih dari 20mb)`);
                                        } else {
                                            validFiles.push(f);
                                        }
                                    }
                                    setFiles(prev => [...prev, ...validFiles]);
                                    // Reset input so same file can be selected again if needed (or unique check)
                                    e.target.value = "";
                                }
                            }}
                            className="block w-full text-sm text-slate-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-indigo-50 file:text-indigo-700
                                hover:file:bg-indigo-100
                            "
                        />
                    </div>
                    {/* File List */}
                    <div className="mt-2 space-y-2">
                        {files.map((f, i) => (
                            <div key={i} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg text-xs">
                                <span className="truncate max-w-[200px]">{f.name} ({(f.size / 1024 / 1024).toFixed(2)} MB)</span>
                                <button onClick={() => setFiles(files.filter((_, idx) => idx !== i))} className="text-red-500 font-bold hover:bg-red-50 p-1 rounded">X</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <button
                onClick={handleCreateLesson}
                disabled={creating}
                className="w-full py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
                {creating ? "Saving Lesson..." : <><Plus className="w-4 h-4" /> Save Lesson</>}
            </button>
        </div>
    );
}
