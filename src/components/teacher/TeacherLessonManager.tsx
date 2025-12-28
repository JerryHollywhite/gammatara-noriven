"use client";

import { useState, useEffect } from "react";
import { BookOpen, Plus, Upload, Youtube, FileText, Trash } from "lucide-react";

interface Subject {
    id: string; // CODE
    name: string;
}

interface Attachment {
    id?: string;
    name: string;
    url: string;
    type: string;
    size: number;
}

interface TeacherLessonManagerProps {
    initialSubjectId?: string;
    initialData?: {
        id: string;
        title: string;
        description: string;
        videoUrl: string;
        attachments: Attachment[];
    };
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function TeacherLessonManager({ initialSubjectId, initialData, onSuccess, onCancel }: TeacherLessonManagerProps = {}) {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [selectedSubject, setSelectedSubject] = useState(initialSubjectId || "");

    // Form
    const [title, setTitle] = useState(initialData?.title || "");
    const [desc, setDesc] = useState(initialData?.description || "");
    const [youtube, setYoutube] = useState(initialData?.videoUrl || "");

    // Files
    const [files, setFiles] = useState<File[]>([]);
    const [existingFiles, setExistingFiles] = useState<Attachment[]>(initialData?.attachments || []);

    // Extra Videos
    const [extraVideos, setExtraVideos] = useState<{ id?: string, name: string, url: string }[]>([]);
    const [newVideoUrl, setNewVideoUrl] = useState("");
    const [newVideoTitle, setNewVideoTitle] = useState("");

    const [uploading, setUploading] = useState(false);
    const [creating, setCreating] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    // Sync if prop changes
    useEffect(() => {
        if (initialSubjectId) setSelectedSubject(initialSubjectId);
    }, [initialSubjectId]);

    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title);
            setDesc(initialData.description);
            setYoutube(initialData.videoUrl);

            // Split attachments
            const docs: Attachment[] = [];
            const vids: { id?: string, name: string, url: string }[] = [];

            if (initialData.attachments) {
                initialData.attachments.forEach(att => {
                    if (att.type === 'video/youtube' || att.url.includes('youtube') || att.url.includes('youtu.be')) {
                        vids.push({ id: att.id, name: att.name, url: att.url });
                    } else {
                        docs.push(att);
                    }
                });
            }

            setExistingFiles(docs);
            setExtraVideos(vids);
        }
    }, [initialData]);

    // Fetch subjects available
    useEffect(() => {
        async function fetchSubjects() {
            try {
                const res = await fetch('/api/teacher/subjects');
                const data = await res.json();
                if (data.success) {
                    setSubjects(data.subjects.map((s: any) => ({
                        id: s.code, // IMPORTANT: Use CODE as ID because CreateLesson expects code
                        name: s.name + (s.program?.name ? ` (${s.program.name})` : " (Universal)")
                    })));
                }
            } catch (e) {
                console.error("Failed to fetch subjects", e);
            }
        }
        fetchSubjects();
    }, []);

    const handleDeleteExistingFile = async (attId: string) => {
        if (!confirm("Are you sure you want to delete this file completely? This cannot be undone by cancelling the edit.")) return;

        try {
            const res = await fetch(`/api/teacher/attachments/${attId}`, { method: 'DELETE' });
            const json = await res.json();
            if (json.success) {
                setExistingFiles(prev => prev.filter(f => f.id !== attId));
            } else {
                alert(json.error || "Failed to delete file");
            }
        } catch (e) {
            console.error(e);
            alert("Error deleting file");
        }
    };

    const handleCreateLesson = async () => {
        if (!selectedSubject && !initialData) { // Subject required for new
            if (!selectedSubject) { alert("Subject is required"); return; }
        }
        if (!title) {
            alert("Title is required");
            return;
        }

        setCreating(true);
        let fileUrl = "";

        try {
            // 1. Upload NEW Files
            const uploadedAttachments = [...existingFiles]; // Start with existing (already processed)

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
                        alert(`Failed to upload ${f.name}: ${uploadJson.error}`);
                        setCreating(false);
                        setUploading(false);
                        return;
                    }
                }
                setUploading(false);
            }

            // Legacy support
            fileUrl = uploadedAttachments.length > 0 ? uploadedAttachments[0].url : "";

            // Prepare Video Attachments
            const videoAttachments = extraVideos.map(v => ({
                name: v.name,
                url: v.url,
                type: 'video/youtube',
                size: 0
            }));

            // 2. Create or Update Lesson
            const url = initialData ? `/api/teacher/lessons/${initialData.id}` : "/api/teacher/lessons";
            const method = initialData ? "PUT" : "POST";

            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    subjectId: selectedSubject,
                    title,
                    description: desc,
                    videoUrl: youtube,
                    fileUrl: fileUrl,
                    attachments: [...uploadedAttachments, ...videoAttachments], // Send merged list
                    order: 0
                })
            });

            const json = await res.json();
            if (json.success) {
                alert(initialData ? "Lesson updated!" : "Lesson created successfully!");
                setTitle("");
                setDesc("");
                setYoutube("");
                setFiles([]);
                setExistingFiles([]);
                setExtraVideos([]);
                setNewVideoUrl("");
                setNewVideoTitle("");
                if (onSuccess) onSuccess();
            } else {
                alert(json.error || "Failed");
            }

        } catch (e) {
            console.error(e);
            alert("Error saving lesson");
        } finally {
            setCreating(false);
            setUploading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mt-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                {initialData ? "Edit Lesson Material" : "Create Lesson Material"}
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
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                            <Youtube className="w-4 h-4 text-red-500" /> Primary YouTube Link
                        </label>
                        <input
                            type="text"
                            value={youtube}
                            onChange={(e) => setYoutube(e.target.value)}
                            placeholder="https://youtube.com/..."
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Additional Video Links</label>

                        {extraVideos.map((vid, idx) => (
                            <div key={idx} className="flex items-center gap-2 mb-2 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
                                <Youtube className="w-4 h-4 text-red-500 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-slate-800 truncate">{vid.name}</p>
                                    <p className="text-[10px] text-slate-500 truncate">{vid.url}</p>
                                </div>
                                <button
                                    onClick={() => setExtraVideos(prev => prev.filter((_, i) => i !== idx))}
                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                >
                                    <Trash className="w-3 h-3" />
                                </button>
                            </div>
                        ))}

                        <div className="flex gap-2 items-start mt-2">
                            <div className="flex-1 space-y-2">
                                <input
                                    type="text"
                                    value={newVideoTitle}
                                    onChange={(e) => setNewVideoTitle(e.target.value)}
                                    placeholder="Title (e.g. Part 2)"
                                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                <input
                                    type="text"
                                    value={newVideoUrl}
                                    onChange={(e) => setNewVideoUrl(e.target.value)}
                                    placeholder="https://youtube.com/..."
                                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                            <button
                                onClick={() => {
                                    if (!newVideoUrl) return;
                                    setExtraVideos(prev => [...prev, { name: newVideoTitle || `Video ${prev.length + 2}`, url: newVideoUrl }]);
                                    setNewVideoUrl("");
                                    setNewVideoTitle("");
                                }}
                                disabled={!newVideoUrl}
                                className="h-[70px] w-10 flex items-center justify-center bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:bg-slate-300"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
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
                                    const duplicateNames: string[] = [];
                                    const oversizedFiles: string[] = [];

                                    for (let i = 0; i < selected.length; i++) {
                                        const f = selected[i];

                                        // 1. Check Duplicates (Existing & New)
                                        const isDuplicateExisting = existingFiles.some(ef => ef.name === f.name);
                                        const isDuplicateNew = files.some(nf => nf.name === f.name);

                                        if (isDuplicateExisting || isDuplicateNew) {
                                            duplicateNames.push(f.name);
                                            continue;
                                        }

                                        // 2. Check Size
                                        if (f.size > 20 * 1024 * 1024) {
                                            oversizedFiles.push(f.name);
                                        } else {
                                            validFiles.push(f);
                                        }
                                    }

                                    let errorMessage = "";
                                    if (duplicateNames.length > 0) {
                                        errorMessage += `Duplicate files rejected: ${duplicateNames.join(', ')} (File dengan nama yang sama sudah ada).\n`;
                                    }
                                    if (oversizedFiles.length > 0) {
                                        errorMessage += `Files too large (max 20MB): ${oversizedFiles.join(', ')}.\n`;
                                    }

                                    if (errorMessage) {
                                        setUploadError(errorMessage.trim());
                                    } else {
                                        setUploadError(null);
                                    }

                                    if (validFiles.length > 0) {
                                        setFiles(prev => [...prev, ...validFiles]);
                                    }

                                    // Reset input
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
                    {uploadError && (
                        <p className="text-xs text-red-500 font-bold mt-2 animate-in fade-in slide-in-from-top-1">
                            {uploadError}
                        </p>
                    )}

                    {/* Existing Files List */}
                    {existingFiles.length > 0 && (
                        <div className="mt-3 space-y-2">
                            <p className="text-xs font-semibold text-slate-500">Existing Files:</p>
                            {existingFiles.map((f, i) => (
                                <div key={f.id || i} className="flex items-center justify-between bg-white border border-slate-200 p-2 rounded-lg text-xs">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <FileText className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                                        <a
                                            href={f.url.startsWith('http') ? f.url : `https://drive.google.com/file/d/${f.url}/view`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="truncate hover:underline text-indigo-600 max-w-[200px]"
                                        >
                                            {f.name}
                                        </a>
                                        <span className="text-slate-400">({(f.size ? f.size / 1024 / 1024 : 0).toFixed(2)} MB)</span>
                                    </div>
                                    <button
                                        onClick={() => f.id && handleDeleteExistingFile(f.id)}
                                        className="text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors"
                                        title="Delete File Permanently"
                                    >
                                        <Trash className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* New File List */}
                    {files.length > 0 && (
                        <div className="mt-3 space-y-2">
                            <p className="text-xs font-semibold text-slate-500">New Files to Upload:</p>
                            {files.map((f, i) => (
                                <div key={i} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg text-xs">
                                    <span className="truncate max-w-[200px]">{f.name} ({(f.size / 1024 / 1024).toFixed(2)} MB)</span>
                                    <button onClick={() => setFiles(files.filter((_, idx) => idx !== i))} className="text-red-500 font-bold hover:bg-red-50 p-1 rounded">X</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex gap-2">
                {onCancel && (
                    <button
                        onClick={onCancel}
                        disabled={creating || uploading}
                        className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-xl font-medium hover:bg-slate-200"
                    >
                        Cancel
                    </button>
                )}
                <button
                    onClick={handleCreateLesson}
                    disabled={creating}
                    className="flex-1 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {creating ? "Saving Lesson..." : <>{initialData ? "Update Lesson" : <><Plus className="w-4 h-4" /> Save Lesson</>}</>}
                </button>
            </div>
        </div>
    );
}
