"use client";

import { Subject } from "@/types/tara";
import { motion } from "framer-motion";
import { Book, ChevronRight } from "lucide-react";
import Link from "next/link"; // Placeholder for future link

interface SubjectCardProps {
    subject: Subject;
    onClick?: () => void;
}

export default function SubjectCard({ subject, onClick }: SubjectCardProps) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all group cursor-pointer"
            onClick={onClick}
        >
            <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 group-hover:bg-primary group-hover:text-white transition-colors">
                    {/* Future: Use subject.imageUrl if available */}
                    <Book className="w-6 h-6" />
                </div>
                <div className="bg-slate-100 px-2 py-1 rounded text-xs font-bold text-slate-500">
                    {subject.programId}
                </div>
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors">
                {subject.name}
            </h3>
            <p className="text-slate-500 text-sm line-clamp-2 mb-4">
                {subject.description || "No description provided."}
            </p>

            <div className="flex items-center text-sm font-bold text-primary">
                View Lessons <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
        </motion.div>
    );
}
