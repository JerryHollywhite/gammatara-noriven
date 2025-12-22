"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Folder, FileText, Download } from "lucide-react";
import Image from "next/image";

export default function ModulesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
                        Role: {session.user?.role || "Student"}
                    </div>
                </div>

                {/* Modules Grid (Mock Data for now) */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Mock Item 1 */}
                    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-slate-200 group cursor-pointer">
                        <div className="h-40 bg-slate-100 relative flex items-center justify-center">
                            <Folder className="w-16 h-16 text-secondary/30 group-hover:text-secondary/50 transition-colors" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/10 to-transparent" />
                        </div>
                        <div className="p-6">
                            <h3 className="font-bold text-lg text-slate-900 mb-2">Mathematics - Grade 10</h3>
                            <p className="text-slate-500 text-sm mb-4 line-clamp-2">
                                Advanced Algebra, Trigonometry, and Calculus introduction materials.
                            </p>
                            <button className="w-full py-2 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg font-medium text-sm transition-colors border border-slate-200 flex items-center justify-center gap-2">
                                <Folder className="w-4 h-4" /> Open Folder
                            </button>
                        </div>
                    </div>

                    {/* Mock Item 2 */}
                    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-slate-200 group cursor-pointer">
                        <div className="h-40 bg-slate-100 relative flex items-center justify-center">
                            <FileText className="w-16 h-16 text-primary/30 group-hover:text-primary/50 transition-colors" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/10 to-transparent" />
                        </div>
                        <div className="p-6">
                            <h3 className="font-bold text-lg text-slate-900 mb-2">Physics Lab Guide.pdf</h3>
                            <p className="text-slate-500 text-sm mb-4 line-clamp-2">
                                Complete guide for Semester 1 laboratory experiments and safety protocols.
                            </p>
                            <button className="w-full py-2 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg font-medium text-sm transition-colors border border-slate-200 flex items-center justify-center gap-2">
                                <Download className="w-4 h-4" /> Download PDF
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-12 text-center text-slate-400 text-sm">
                    <p>Folder content is dynamically verified via Google Drive API.</p>
                </div>
            </div>
        </div>
    );
}
