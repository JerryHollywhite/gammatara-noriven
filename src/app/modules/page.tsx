"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
    Folder, FileText, Download, Search, Filter, SortAsc, Clock, Star,
    LayoutGrid, List as ListIcon, PlayCircle, Image as ImageIcon,
    File as FileIcon, PieChart, BookOpen, Layers, Eye, Book
} from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import ProgramsList from "@/components/lms/ProgramsList";
import SubjectCard from "@/components/lms/SubjectCard";
import { Program, Subject, Lesson } from "@/types/tara";

export default function ModulesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    // Legacy State (Drive Folders)
    const [modules, setModules] = useState<any[]>([]);

    // TaraLMS State (Sheet Data)
    const [lmsPrograms, setLmsPrograms] = useState<Program[]>([]);
    const [lmsSubjects, setLmsSubjects] = useState<Subject[]>([]);
    const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
    const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
    const [lmsLessons, setLmsLessons] = useState<Lesson[]>([]);

    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [favorites, setFavorites] = useState<string[]>([]);

    useEffect(() => {
        if (status === "unauthenticated") router.push("/login");
    }, [status, router]);

    useEffect(() => {
        if (session?.user?.email) {
            Promise.all([
                fetchLegacyModules(),
                fetchLmsData()
            ]).finally(() => setLoading(false));
        }
        const storedFavs = localStorage.getItem("gamma_favs");
        if (storedFavs) setFavorites(JSON.parse(storedFavs));
    }, [session]);

    // Data Fetching
    const fetchLegacyModules = async () => {
        try {
            const res = await fetch("/api/modules");
            if (res.ok) {
                const data = await res.json();
                setModules(data.modules || []);
            }
        } catch (error) {
            console.error("Failed to fetch legacy modules", error);
        }
    };

    const fetchLmsData = async () => {
        try {
            // Fetch Programs
            const resP = await fetch("/api/tara/content?type=programs");
            const dataP = await resP.json();
            if (dataP.success) {
                const activePrograms = (dataP.data as Program[]).filter(p => p.active);
                setLmsPrograms(activePrograms);
                if (activePrograms.length > 0) setSelectedProgramId(activePrograms[0].id);
            }

            // Fetch Subjects
            const resS = await fetch("/api/tara/content?type=subjects");
            const dataS = await resS.json();
            if (dataS.success) setLmsSubjects(dataS.data);

        } catch (error) {
            console.error("Failed to fetch TaraLMS data", error);
        }
    }

    // Handle Subject Click (Drill down to lessons)
    const handleSubjectClick = async (subjectId: string) => {
        setSelectedSubjectId(subjectId);
        try {
            const res = await fetch(`/api/tara/content?type=lessons&id=${subjectId}`);
            const data = await res.json();
            if (data.success) {
                setLmsLessons(data.data);
            }
        } catch (e) {
            console.error("Failed lessons", e);
        }
    };

    const toggleFavorite = (folderName: string) => {
        const newFavs = favorites.includes(folderName)
            ? favorites.filter(f => f !== folderName)
            : [...favorites, folderName];
        setFavorites(newFavs);
        localStorage.setItem("gamma_favs", JSON.stringify(newFavs));
    };

    const filteredModules = modules.filter(m => {
        const query = searchQuery.toLowerCase();
        const matchesFolder = m.folderName.toLowerCase().includes(query);
        const matchesDesc = m.description.toLowerCase().includes(query);
        const matchesFiles = m.files?.some((f: any) => f.name.toLowerCase().includes(query));
        return matchesFolder || matchesDesc || matchesFiles;
    });

    // LMS Filtering
    const displayedSubjects = lmsSubjects.filter(s => s.programId === selectedProgramId);

    const favoriteModules = filteredModules.filter(m => favorites.includes(m.folderName));
    const nonFavoriteModules = filteredModules.filter(m => !favorites.includes(m.folderName));

    const totalFiles = modules.reduce((acc, m) => acc + (m.files?.length || 0), 0);
    const totalModules = modules.length;

    if (status === "loading" || (status === "authenticated" && loading)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                    <p className="text-slate-500 animate-pulse">Syncing TaraLMS...</p>
                </div>
            </div>
        );
    }

    if (!session) return null;

    // --- LESSON VIEW (Drill Down) ---
    if (selectedSubjectId) {
        const subject = lmsSubjects.find(s => s.id === selectedSubjectId);
        return (
            <div className="min-h-screen bg-slate-50 pt-28 pb-12 font-sans px-4">
                <div className="max-w-5xl mx-auto">
                    <button
                        onClick={() => setSelectedSubjectId(null)}
                        className="mb-6 text-primary font-bold hover:underline flex items-center gap-2"
                    >
                        ← Back to Dashboard
                    </button>

                    <div className="bg-white rounded-3xl p-8 shadow-md border border-slate-100 mb-8">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600">
                                <Book className="w-8 h-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900">{subject?.name}</h1>
                                <p className="text-slate-500">{subject?.description}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {lmsLessons.length === 0 ? (
                            <div className="text-center py-12 text-slate-400">No lessons found for this subject yet.</div>
                        ) : (
                            lmsLessons.map((lesson, idx) => (
                                <div key={lesson.id} className="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="text-xs font-bold text-primary uppercase tracking-widest mb-1 block">Lesson {lesson.order || idx + 1}</span>
                                            <h3 className="text-xl font-bold text-slate-800 mb-2">{lesson.title}</h3>
                                            <p className="text-slate-600 mb-4">{lesson.description}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        {lesson.videoDriveId && (
                                            <a href={`https://drive.google.com/file/d/${lesson.videoDriveId}/preview`} target="_blank" className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-red-100">
                                                <PlayCircle className="w-4 h-4" /> Watch Video
                                            </a>
                                        )}
                                        {lesson.pdfDriveId && (
                                            <a href={`https://drive.google.com/file/d/${lesson.pdfDriveId}/preview`} target="_blank" className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-100">
                                                <FileText className="w-4 h-4" /> Read Material
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        )
    }

    // --- MAIN DASHBOARD ---
    return (
        <div className="min-h-screen bg-slate-50 pt-28 pb-12 font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Welcome Header */}
                <div className="mb-12 text-center">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">My Learning Dashboard</h1>
                    <p className="text-slate-500">Select a program to view your courses.</p>
                </div>

                {/* 1. TARA LMS SECTION (Sheet Data) */}
                {lmsPrograms.length > 0 && (
                    <div className="mb-16">
                        <ProgramsList
                            programs={lmsPrograms}
                            selectedId={selectedProgramId}
                            onSelect={setSelectedProgramId}
                        />

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={selectedProgramId}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                            >
                                {displayedSubjects.map(subject => (
                                    <SubjectCard
                                        key={subject.id}
                                        subject={subject}
                                        onClick={() => handleSubjectClick(subject.id)}
                                    />
                                ))}
                                {displayedSubjects.length === 0 && (
                                    <div className="col-span-full text-center py-12 text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
                                        No subjects active for this program.
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                )}


                <div className="border-t border-slate-200 my-10"></div>

                {/* 2. LEGACY DRIVE FOLDERS HEADER */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <Folder className="w-5 h-5 text-slate-400" /> Additional Resources
                        </h2>
                        <p className="text-sm text-slate-500">Direct access to your shared Drive folders.</p>
                    </div>
                    {/* Search Bar - Simplified */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Data pencarian..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                </div>

                {/* Favorites Section */}
                {favoriteModules.length > 0 && searchQuery === "" && (
                    <div className="mb-8">
                        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                            Pinned Folders
                        </h2>
                        <div className={viewMode === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
                            {favoriteModules.map((module: any, idx: number) => (
                                <ModuleCard
                                    key={idx}
                                    module={module}
                                    viewMode={viewMode}
                                    isFavorite={true}
                                    onToggleFavorite={() => toggleFavorite(module.folderName)}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* All Modules (or Search Results) */}
                <div className="mb-8">
                    {nonFavoriteModules.length > 0 || (searchQuery !== "" && favoriteModules.length > 0) ? (
                        <motion.div
                            layout
                            className={viewMode === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}
                        >
                            <AnimatePresence>
                                {(searchQuery !== "" ? filteredModules : nonFavoriteModules).map((module: any, idx: number) => (
                                    <ModuleCard
                                        key={idx}
                                        module={module}
                                        viewMode={viewMode}
                                        isFavorite={favorites.includes(module.folderName)}
                                        onToggleFavorite={() => toggleFavorite(module.folderName)}
                                    />
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    ) : (
                        favorites.length === 0 && (
                            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Folder className="w-10 h-10 text-slate-300" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">No folder resources found</h3>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}

// Group files by type helper (Legacy)
const groupFilesByType = (files: any[]) => {
    const groups: { [key: string]: any[] } = {
        Documents: [],
        Videos: [],
        Images: [],
        Others: []
    };

    files.forEach(file => {
        const mime = file.mimeType || "";
        if (mime.includes("pdf") || mime.includes("document") || mime.includes("sheet") || mime.includes("presentation") || mime.includes("text")) {
            groups.Documents.push(file);
        } else if (mime.includes("video")) {
            groups.Videos.push(file);
        } else if (mime.includes("image")) {
            groups.Images.push(file);
        } else {
            groups.Others.push(file);
        }
    });

    return groups;
};

// Legacy Card Component preserved
function ModuleCard({ module, viewMode, isFavorite, onToggleFavorite }: any) {
    const fileGroups = groupFilesByType(module.files || []);
    const hasFiles = module.files && module.files.length > 0;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-slate-200 group relative ${viewMode === 'list' ? 'flex flex-row items-stretch' : 'flex-col'}`}
        >
            <div className={`${viewMode === 'list' ? 'w-48 shrink-0' : 'h-32'} bg-slate-50 relative p-6 flex flex-col justify-between overflow-hidden border-b border-slate-100`}>
                <div className="absolute top-3 right-3 z-10">
                    <button
                        onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
                        className={`p-2 rounded-full transition-all ${isFavorite ? "bg-yellow-400/20 text-yellow-500" : "bg-white/50 text-slate-400 hover:bg-white hover:text-yellow-500"}`}
                    >
                        <Star className={`w-5 h-5 ${isFavorite ? "fill-yellow-500" : ""}`} />
                    </button>
                </div>

                <div className="relative z-10">
                    <Folder className="w-8 h-8 text-primary mb-3" />
                    <h3 className="font-bold text-lg text-slate-900 leading-tight group-hover:text-primary transition-colors line-clamp-2">{module.folderName}</h3>
                </div>
                <div className="absolute right-0 bottom-0 opacity-10">
                    <Folder className="w-32 h-32 transform translate-x-8 translate-y-8" />
                </div>
            </div>

            <div className="p-5 flex-1 flex flex-col">
                <p className="text-slate-500 text-sm line-clamp-2 mb-4 h-10">
                    {module.description}
                </p>

                <div className="flex-1 space-y-4 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                    {!hasFiles ? (
                        <div className="text-center py-4 border border-dashed border-slate-200 rounded-lg">
                            <p className="text-xs text-slate-400">Empty Folder</p>
                        </div>
                    ) : (
                        Object.entries(fileGroups).map(([category, files]) => {
                            if (files.length === 0) return null;
                            return (
                                <div key={category}>
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                        {category === "Documents" && <BookOpen className="w-3 h-3" />}
                                        {category === "Videos" && <PlayCircle className="w-3 h-3" />}
                                        {category === "Images" && <ImageIcon className="w-3 h-3" />}
                                        {category === "Others" && <FileIcon className="w-3 h-3" />}
                                        {category} ({files.length})
                                    </h4>
                                    <div className="space-y-2">
                                        {files.map((file: any) => (
                                            <a
                                                key={file.id}
                                                href={`https://drive.google.com/file/d/${file.id}/preview`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg border border-slate-100 hover:border-primary/30 hover:bg-white hover:shadow-sm transition-all group/file"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                                                    {category === "Videos" ? (
                                                        <PlayCircle className="w-4 h-4 text-red-500" />
                                                    ) : category === "Images" ? (
                                                        <ImageIcon className="w-4 h-4 text-purple-500" />
                                                    ) : (
                                                        <FileText className="w-4 h-4 text-blue-500" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-slate-700 truncate group-hover/file:text-primary transition-colors">{file.name}</p>
                                                    {file.modifiedTime && (
                                                        <p className="text-[10px] text-slate-400">
                                                            {format(new Date(file.modifiedTime), 'MMM d, yyyy')}
                                                        </p>
                                                    )}
                                                </div>
                                                <Eye className="w-4 h-4 text-slate-300 group-hover/file:text-primary opacity-0 group-hover/file:opacity-100 transition-all" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </motion.div>
    );
}
