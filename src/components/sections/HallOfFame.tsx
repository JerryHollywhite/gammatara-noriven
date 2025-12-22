"use client";

import { useState } from "react";
import Image from "next/image";
import { Award, GraduationCap, Briefcase, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { teachersData } from "@/data/teachers";
import { clsx } from "clsx";

interface HallOfFameProps {
    siteContent?: Record<string, string>;
}

export default function HallOfFame({ siteContent = {} }: HallOfFameProps) {
    const [activeTeacher, setActiveTeacher] = useState(0);

    return (
        <section id="teachers" className="py-24 bg-white font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <span className="text-secondary font-bold tracking-widest uppercase text-xs">
                        {siteContent["Teachers_Header_Label"] || "World-Class Mentors"}
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold font-heading text-slate-900 mt-2 mb-4">
                        {siteContent["Teachers_Header_Title"] || "Meet Our Expert Mentors"}
                    </h2>
                    <p className="text-lg text-slate-600">
                        {siteContent["Teachers_Header_Subtitle"] || "Passionate educators who are also high-achievers in their respective fields."}
                    </p>
                </div>

                {/* Teacher Tabs (Scrollable on mobile) */}
                <div className="flex overflow-x-auto pb-6 gap-3 mb-8 no-scrollbar justify-start md:justify-center px-4 snap-x">
                    {teachersData.map((teacher, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveTeacher(index)}
                            className={clsx(
                                "flex items-center gap-3 px-5 py-3 rounded-full border transition-all duration-300 whitespace-nowrap snap-center shrink-0",
                                activeTeacher === index
                                    ? "bg-primary text-white border-primary shadow-lg scale-105"
                                    : "bg-white text-slate-600 border-slate-200 hover:border-primary/50 hover:bg-slate-50"
                            )}
                        >
                            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-slate-200 border border-white/20">
                                <Image
                                    src={teacher.image}
                                    alt={teacher.shortName}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <span className="font-semibold text-sm">{teacher.shortName}</span>
                        </button>
                    ))}
                </div>

                {/* Active Teacher Profile - Animated */}
                <div className="min-h-[500px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTeacher}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="bg-slate-50 rounded-3xl p-6 md:p-12 shadow-inner border border-slate-100"
                        >
                            <div className="grid md:grid-cols-[300px_1fr] gap-10 items-start">
                                {/* Profile Card */}
                                <div className="bg-white p-6 rounded-2xl shadow-xl transform md:-translate-y-8 border-t-4 border-secondary text-center">
                                    <div className="relative w-48 h-48 mx-auto mb-6 rounded-full overflow-hidden border-4 border-slate-50 shadow-md">
                                        <Image
                                            src={teachersData[activeTeacher].image}
                                            alt={teachersData[activeTeacher].name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900">{teachersData[activeTeacher].name}</h3>
                                    <div className="text-secondary font-semibold text-sm mt-1">{teachersData[activeTeacher].role}</div>
                                    <div className="mt-6 flex flex-wrap justify-center gap-2">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                                            <BookOpen className="w-3 h-3" /> {teachersData[activeTeacher].subjects.split(',')[0]}
                                        </span>
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="space-y-8">
                                    <div>
                                        <h4 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                                            <GraduationCap className="w-6 h-6 text-primary" /> Education
                                        </h4>
                                        <p className="text-slate-700 text-lg leading-relaxed">
                                            {teachersData[activeTeacher].education}
                                        </p>
                                    </div>

                                    <div>
                                        <h4 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                            <Briefcase className="w-5 h-5 text-secondary" /> Professional Experience
                                        </h4>
                                        <ul className="grid gap-3">
                                            {teachersData[activeTeacher].experience.map((exp, i) => (
                                                <li key={i} className="flex gap-3 text-slate-700">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-2.5 shrink-0" />
                                                    {exp}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {teachersData[activeTeacher].achievements.length > 0 && (
                                        <div>
                                            <h4 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                                <Award className="w-5 h-5 text-yellow-500" /> Key Achievements
                                            </h4>
                                            <div className="grid gap-3">
                                                {teachersData[activeTeacher].achievements.map((acc, i) => (
                                                    <div key={i} className="flex gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                                                        <Award className="w-4 h-4 text-yellow-500 mt-1 shrink-0" />
                                                        <span className="text-slate-700 text-sm">{acc}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
}
