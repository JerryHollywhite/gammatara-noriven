"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Folder, FileText, Download, Search, Filter, SortAsc, Clock, Star, LayoutGrid, List as ListIcon } from "lucide-react";
import Image from "next/image";
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

        // Load favorites from local storage
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

    // Filter Logic
    const filteredModules = modules.filter(m =>
        m.folderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => {
        // Sort favorites first
        const aFav = favorites.includes(a.folderName);
        const bFav = favorites.includes(b.folderName);
        if (aFav && !bFav) return -1;
        if (!aFav && bFav) return 1;
        return 0; // Default order
    });

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

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 font-heading">Learning Modules</h1>
                        <p className="text-slate-600 mt-1">Hello, <span className="font-semibold text-primary">{session.user?.name}</span> 👋</p>
                    </div>

                    <div className="flex items-center gap-3 bg-white p-1 rounded-full border border-slate-200 shadow-sm">
                        <button
                            onClick={() => setViewMode("grid")}
                            className={`p-2 rounded-full transition-all ${viewMode === "grid" ? "bg-primary text-white shadow-md" : "text-slate-400 hover:text-slate-600"}`}
                        >
                            <LayoutGrid className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode("list")}
                            className={`p-2 rounded-full transition-all ${viewMode === "list" ? "bg-primary text-white shadow-md" : "text-slate-400 hover:text-slate-600"}`}
                        >
                            <ListIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-8 sticky top-24 z-30 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search topics, modules, or descriptions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900"
                        />
                    </div>
                    <div className="flex gap-2">
                        {/* Placeholder for future advanced filters */}
                        <button className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl border border-slate-200 hover:bg-slate-100 flex items-center gap-2 text-sm font-medium transition-colors">
                            <Clock className="w-4 h-4" /> Recent
                        </button>
                        <button className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl border border-slate-200 hover:bg-slate-100 flex items-center gap-2 text-sm font-medium transition-colors">
                            <Star className="w-4 h-4" /> Favorites
                        </button>
                    </div>
                </div>

                {/* Content Grid */}
                {filteredModules.length > 0 ? (
                    <motion.div
                        layout
                        className={viewMode === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}
                    >
                        <AnimatePresence>
                            {filteredModules.map((module: any, idx: number) => (
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
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Folder className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">No modules found</h3>
                        <p className="text-slate-500 max-w-md mx-auto mt-2">
                            {searchQuery ? `No results for "${searchQuery}"` : "You haven't been assigned any learning modules yet."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

function ModuleCard({ module, viewMode, isFavorite, onToggleFavorite }: any) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-slate-200 group relative ${viewMode === 'list' ? 'flex flex-row items-stretch' : 'flex-col'}`}
        >
            {/* Header / Icon */}
            <div className={`${viewMode === 'list' ? 'w-48 shrink-0' : 'h-40'} bg-gradient-to-br from-slate-50 to-slate-100 relative items-center justify-center flex overflow-hidden`}>
                <div className="absolute top-3 right-3 z-10">
                    <button
                        onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
                        className={`p-2 rounded-full backdrop-blur-sm transition-all ${isFavorite ? "bg-yellow-400/20 text-yellow-500" : "bg-white/50 text-slate-400 hover:bg-white hover:text-yellow-500"}`}
                    >
                        <Star className={`w-5 h-5 ${isFavorite ? "fill-yellow-500" : ""}`} />
                    </button>
                </div>

                <Folder className="w-20 h-20 text-blue-200/50 group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent" />
            </div>

            {/* Content */}
            <div className="p-6 flex-1 flex flex-col">
                <div className="mb-4">
                    <h3 className="font-bold text-xl text-slate-900 mb-1 group-hover:text-primary transition-colors line-clamp-1">{module.folderName}</h3>
                    <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">
                        {module.description}
                    </p>
                </div>

                {/* Files List - Scrollable */}
                <div className="flex-1 bg-slate-50/50 rounded-xl p-3 border border-slate-100 mb-4 max-h-48 overflow-y-auto custom-scrollbar">
                    {module.files && module.files.length > 0 ? (
                        <div className="space-y-2">
                            {module.files.map((file: any) => (
                                <a
                                    key={file.id}
                                    href={file.webViewLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-2 bg-white rounded-lg border border-slate-200/60 hover:border-primary/50 hover:shadow-sm transition-all group/file"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                        <FileText className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-700 truncate group-hover/file:text-primary transition-colors">{file.name}</p>
                                        {file.modifiedTime && (
                                            <p className="text-[10px] text-slate-400">
                                                Update: {format(new Date(file.modifiedTime), 'MMM d, yyyy')}
                                            </p>
                                        )}
                                    </div>
                                    <Download className="w-4 h-4 text-slate-300 group-hover/file:text-primary opacity-0 group-hover/file:opacity-100 transition-all" />
                                </a>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-6">
                            <p className="text-xs text-slate-400 italic">No files in this folder.</p>
                        </div>
                    )}
                </div>

                <div className="mt-auto pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                    <span>{module.files?.length || 0} Files</span>
                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide">Sync Active</span>
                </div>
            </div>
        </motion.div>
    );
}
