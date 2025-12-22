"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
    Folder, FileText, Download, Search, Filter, SortAsc, Clock, Star,
    LayoutGrid, List as ListIcon, PlayCircle, Image as ImageIcon,
    File as FileIcon, PieChart, BookOpen, Layers, Eye
} from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

export default function ModulesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [modules, setModules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [favorites, setFavorites] = useState<string[]>([]);

    useEffect(() => {
        if (status === "unauthenticated") router.push("/login");
    }, [status, router]);

    useEffect(() => {
        if (session?.user?.email) fetchModules();
        const storedFavs = localStorage.getItem("gamma_favs");
        if (storedFavs) setFavorites(JSON.parse(storedFavs));
    }, [session]);

    const fetchModules = async () => {
        try {
            const res = await fetch("/api/modules");
            if (res.ok) {
                const data = await res.json();
                setModules(data.modules || []);
            }
        } catch (error) {
            console.error("Failed to fetch modules", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleFavorite = (folderName: string) => {
        const newFavs = favorites.includes(folderName)
            ? favorites.filter(f => f !== folderName)
            : [...favorites, folderName];
        setFavorites(newFavs);
        localStorage.setItem("gamma_favs", JSON.stringify(newFavs));
    };

    // Advanced Filtering: Search in FolderName, Description, AND File Names
    const filteredModules = modules.filter(m => {
        const query = searchQuery.toLowerCase();
        const matchesFolder = m.folderName.toLowerCase().includes(query);
        const matchesDesc = m.description.toLowerCase().includes(query);
        const matchesFiles = m.files?.some((f: any) => f.name.toLowerCase().includes(query));
        return matchesFolder || matchesDesc || matchesFiles;
    });

    const favoriteModules = filteredModules.filter(m => favorites.includes(m.folderName));
    const nonFavoriteModules = filteredModules.filter(m => !favorites.includes(m.folderName));

    // Stats
    const totalFiles = modules.reduce((acc, m) => acc + (m.files?.length || 0), 0);
    const totalModules = modules.length;

    if (status === "loading" || (status === "authenticated" && loading)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                    <p className="text-slate-500 animate-pulse">Syncing with Learning Database...</p>
                </div>
            </div>
        );
    }

    if (!session) return null;

    return (
        <div className="min-h-screen bg-slate-50 pt-28 pb-12 font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Dashboard Stats Header */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="md:col-span-2 bg-gradient-to-r from-primary to-blue-900 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
                        <div className="relative z-10">
                            <h1 className="text-3xl font-bold font-heading mb-2">My Learning Dashboard</h1>
                            <p className="text-blue-100">Welcome back, {session.user?.name}!</p>
                        </div>
                        <div className="absolute right-0 top-0 h-full w-1/3 bg-white/5 skew-x-12 transform translate-x-8" />
                    </div>

                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-primary">
                            <PieChart className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm font-medium">Total Modules</p>
                            <h3 className="text-2xl font-bold text-slate-900">{totalModules}</h3>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500">
                            <Layers className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm font-medium">Total Materials</p>
                            <h3 className="text-2xl font-bold text-slate-900">{totalFiles}</h3>
                        </div>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-8 sticky top-24 z-30 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Find modules, videos, or documents..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900"
                        />
                    </div>
                    <div className="flex gap-2">
                        <div className="bg-slate-100/50 p-1 rounded-xl flex border border-slate-200">
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                            >
                                <LayoutGrid className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode("list")}
                                className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                            >
                                <ListIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Favorites Section */}
                {favoriteModules.length > 0 && searchQuery === "" && (
                    <div className="mb-12">
                        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" /> Pinned Modules
                        </h2>
                        <div className={viewMode === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
                            {favoriteModules.map((module: any, idx: number) => (
                                <ModuleCard
                                    key={`fav-${idx}`}
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
                    {favoriteModules.length > 0 && searchQuery === "" && <h2 className="text-lg font-bold text-slate-900 mb-4">All Modules</h2>}

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
                                <h3 className="text-xl font-bold text-slate-900">No matching results</h3>
                                <p className="text-slate-500 max-w-md mx-auto mt-2">
                                    Try adjusting your search terms.
                                </p>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}

// Group files by type helper
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
            {/* Header */}
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

            {/* Content Body */}
            <div className="p-5 flex-1 flex flex-col">
                <p className="text-slate-500 text-sm line-clamp-2 mb-4 h-10">
                    {module.description}
                </p>

                {/* Categorized Files */}
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
                                                {/* Icon based on mime */}
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
