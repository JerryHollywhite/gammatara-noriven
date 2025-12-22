"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Folder, FileText, Download, Loader2 } from "lucide-react";
import Image from "next/image";

export default function ModulesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [modules, setModules] = useState<any[]>([]);
    const [loadingModules, setLoadingModules] = useState(true);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    useEffect(() => {
        if (session?.user?.email) {
            fetchModules();
        }
    }, [session]);

    const fetchModules = async () => {
        try {
            // Since we don't have a dedicated API route for this yet, we should create one.
            // Wait, previously this page was Mock Data. I need to implement the fetch Logic!
            // I'll assume we'll create /api/modules route.
            const res = await fetch("/api/modules");
            if (res.ok) {
                const data = await res.json();
                setModules(data.modules || []);
            }
        } catch (error) {
            console.error("Failed to fetch modules", error);
        } finally {
            setLoadingModules(false);
        }
    };

    if (status === "loading" || (status === "authenticated" && loadingModules)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-slate-500">Loading your modules...</p>
                </div>
            </div>
        );
    }

    if (!session) return null;

    return (
        <div className="min-h-screen bg-slate-50 pt-28 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 font-heading">Learning Modules</h1>
                        <p className="text-slate-600 mt-2">
                            Welcome back, <span className="font-semibold text-primary">{session.user?.name}</span>! Here are your assigned materials.
                        </p>
                    </div>
                    <div className="bg-primary/10 text-primary px-4 py-2 rounded-full font-medium text-sm border border-primary/20">
                        {session.user?.email}
                    </div>
                </div>

                {/* Modules Grid */}
                {modules.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {modules.map((module: any, idx: number) => (
                            <div key={idx} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-slate-200 group">
                                <div className="h-40 bg-slate-100 relative flex items-center justify-center">
                                    <Folder className="w-16 h-16 text-secondary/30 group-hover:text-secondary/50 transition-colors" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/10 to-transparent" />
                                </div>
                                <div className="p-6">
                                    <h3 className="font-bold text-lg text-slate-900 mb-2">{module.folderName}</h3>
                                    <p className="text-slate-500 text-sm mb-4 line-clamp-2">
                                        {module.description}
                                    </p>

                                    {/* Files List */}
                                    <div className="space-y-2 mb-4">
                                        {module.files.length > 0 ? (
                                            module.files.slice(0, 3).map((file: any) => (
                                                <a
                                                    key={file.id}
                                                    href={file.webViewLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 text-sm text-slate-600 hover:text-primary transition-colors p-2 rounded-md hover:bg-slate-50"
                                                >
                                                    <FileText className="w-4 h-4 text-slate-400" />
                                                    <span className="truncate">{file.name}</span>
                                                </a>
                                            ))
                                        ) : (
                                            <p className="text-xs text-slate-400 italic">Empty folder</p>
                                        )}
                                        {module.files.length > 3 && (
                                            <p className="text-xs text-slate-400 pl-2">+ {module.files.length - 3} more files</p>
                                        )}
                                    </div>

                                    <a
                                        href={`https://drive.google.com/drive/folders/${module.files[0]?.parents?.[0] || ""}`} // Fallback link logic is tricky without parent ID, but usually user clicks specific files.
                                        // Actually better to just link to the first file's parent if available or just disable the open folder button if we don't store folder webLink. 
                                        // AccessControl sheet has FolderID. We should return that in API.
                                        // For now, let's just use a direct link if we can pass it through.
                                        target="_blank"
                                        rel="noreferrer"
                                        className="w-full py-2 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg font-medium text-sm transition-colors border border-slate-200 flex items-center justify-center gap-2 cursor-pointer"
                                        onClick={(e) => {
                                            if (module.files.length > 0) {
                                                // Try to open folder of first file
                                                // Or better: Use the FolderID from DB which we should pass.
                                                // I need to update drive-db to pass folderID too.
                                            }
                                        }}
                                    >
                                        <Folder className="w-4 h-4" /> Open Folder
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 border-dashed">
                        <Folder className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-900">No modules found</h3>
                        <p className="text-slate-500 max-w-sm mx-auto mt-2">
                            We couldn't find any learning modules assigned to <strong>{session.user?.email}</strong>.
                            Please ask the admin to assign folders to your email in the Access Control sheet.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
