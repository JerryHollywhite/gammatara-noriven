"use client";

import Image from "next/image";
import { Award, GraduationCap } from "lucide-react";

export interface Teacher {
    name: string;
    role: string;
    education: string;
    accolades: string[];
    image: string;
}

interface HallOfFameProps {
    teachers?: Teacher[];
}

export default function HallOfFame({ teachers = [] }: HallOfFameProps) {
    // Fallback data if no props provided (or waiting for API)
    const displayTeachers = teachers.length > 0 ? teachers : [
        {
            name: "Noriven",
            role: "Founder & Math Expert",
            education: "S1 Ekonomi",
            accolades: ["2nd Place, Teacher Olympiad (Math) 2022"],
            image: "https://ui-avatars.com/api/?name=Noriven&background=1e3a8a&color=ffffff&size=200",
        },
        {
            name: "Irma Wulandari",
            role: "Chemistry, Math, English",
            education: "ITS Chemical Engineering Graduate",
            accolades: ["Student Success Mentor (PTN/SMA Unggulan)"],
            image: "https://ui-avatars.com/api/?name=Irma+Wulandari&background=f59e0b&color=ffffff&size=200",
        },
        {
            name: "Mahardika Wiryawan",
            role: "Biology, Math, English",
            education: "S1 Pendidikan Biologi",
            accolades: ["Biology Olympiad Participant"],
            image: "https://ui-avatars.com/api/?name=Mahardika&background=1e3a8a&color=ffffff&size=200",
        },
        {
            name: "Fitrah Nadia Rizqiyyah",
            role: "Chemistry Expert",
            education: "S1 Pendidikan Kimia International",
            accolades: ["Advisor for International Writing (Malaysia/WICE)"],
            image: "https://ui-avatars.com/api/?name=Fitrah+Nadia&background=f59e0b&color=ffffff&size=200",
        },
        {
            name: "Redafa Amorta",
            role: "English Expert",
            education: "D4 Teknik Mekatronika",
            accolades: ["National English Debate Winner 2023"],
            image: "https://ui-avatars.com/api/?name=Redafa&background=1e3a8a&color=ffffff&size=200",
        },
        {
            name: "Hanna Priskilla",
            role: "English Expert",
            education: "D4 Teknologi Rekayasa Perangkat Lunak",
            accolades: ["1st Place Tour Guiding Competition"],
            image: "https://ui-avatars.com/api/?name=Hanna&background=f59e0b&color=ffffff&size=200",
        },
    ];

    return (
        <section id="teachers" className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="text-secondary font-bold tracking-widest uppercase text-xs">The Dream Team</span>
                    <h2 className="text-3xl md:text-4xl font-bold font-heading text-slate-900 mt-2 mb-4">
                        Meet Our Expert Mentors
                    </h2>
                    <p className="text-lg text-slate-600">
                        Passionate educators who are also high-achievers in their respective fields.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {displayTeachers.map((teacher, index) => (
                        <div key={index} className="flex flex-col items-center text-center p-6 rounded-2xl bg-white border border-slate-100 hover:border-primary/20 shadow-sm hover:shadow-xl transition-all duration-300 group">
                            <div className="relative w-32 h-32 mb-6 rounded-full overflow-hidden border-4 border-slate-50 group-hover:border-secondary transition-colors">
                                <Image
                                    src={teacher.image}
                                    alt={teacher.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">{teacher.name}</h3>
                            <div className="text-primary font-medium mb-1">{teacher.role}</div>
                            <div className="text-slate-500 text-sm mb-4 flex items-center justify-center gap-1">
                                <GraduationCap className="w-4 h-4" /> {teacher.education}
                            </div>

                            <div className="mt-auto px-4 py-3 w-full bg-slate-50 rounded-xl">
                                <div className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-700">
                                    <Award className="w-4 h-4 text-secondary" />
                                    <span>Accolades</span>
                                </div>
                                <ul className="mt-2 space-y-1">
                                    {teacher.accolades.map((acc, i) => (
                                        <li key={i} className="text-xs text-slate-600">{acc}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
