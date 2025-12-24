"use client";

import { motion } from "framer-motion";
import { GraduationCap, School, BookOpen } from "lucide-react";
import { Program } from "@/types/tara";

interface ProgramsListProps {
    programs: Program[];
    selectedId: string | null;
    onSelect: (id: string) => void;
}

export default function ProgramsList({ programs, selectedId, onSelect }: ProgramsListProps) {
    if (!programs || programs.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-4 mb-8 justify-center">
            {programs.map((program) => (
                <motion.button
                    key={program.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onSelect(program.id)}
                    className={`
                        px-6 py-3 rounded-full flex items-center gap-2 font-bold transition-all shadow-sm
                        ${selectedId === program.id
                            ? "bg-primary text-white shadow-primary/30"
                            : "bg-white text-slate-600 hover:bg-white hover:text-primary border border-slate-200"}
                    `}
                >
                    {program.id.includes("TK") && <School className="w-5 h-5" />}
                    {program.id.includes("SD") && <BookOpen className="w-5 h-5" />}
                    {(program.id.includes("SMP") || program.id.includes("SMA")) && <GraduationCap className="w-5 h-5" />}
                    {program.name}
                </motion.button>
            ))}
        </div>
    );
}
