"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const programs = [
    {
        id: "kindergarten",
        title: "Kindergarten",
        age: "Ages 4-6",
        description: "Building strong foundations for cognitive and social skills. We make the first steps of learning a joyful journey.",
        image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?q=80&w=800&auto=format&fit=crop",
    },
    {
        id: "primary",
        title: "Primary School",
        age: "Grades 1-6",
        description: "Developing independence and mastering basics. We help students gain confidence in core subjects and daily habits.",
        image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=800&auto=format&fit=crop",
    },
    {
        id: "secondary",
        title: "Secondary School",
        age: "SMP & SMA",
        description: "Bridging the gap to higher education. Advanced tutoring to conquer exams and shape future career aspirations.",
        image: "https://images.unsplash.com/photo-1427504494785-3a9ca28497b1?q=80&w=800&auto=format&fit=crop",
    },
    {
        id: "adult",
        title: "Adult & Professional",
        age: "Career Advancement",
        description: "Practical skills for career advancement. Tailored coaching for professionals looking to upskill and stay competitive.",
        image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=800&auto=format&fit=crop",
    }
];

export default function AcademicPrograms() {
    return (
        <section id="programs" className="py-24 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="text-primary font-semibold tracking-wider uppercase text-sm">Pathways to Excellence</span>
                    <h2 className="text-3xl md:text-4xl font-bold font-heading text-slate-900 mt-2 mb-4">
                        Our Academic Programs
                    </h2>
                    <p className="text-lg text-slate-600">
                        Tailored learning journeys for every stage of development.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {programs.map((program) => (
                        <div key={program.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                            <div className="relative h-48 overflow-hidden">
                                <Image
                                    src={program.image}
                                    alt={program.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-60" />
                                <div className="absolute bottom-4 left-4">
                                    <span className="inline-block px-2 py-1 bg-secondary text-secondary-foreground text-xs font-bold rounded uppercase">
                                        {program.age}
                                    </span>
                                </div>
                            </div>

                            <div className="p-6">
                                <h3 className="text-xl font-bold text-slate-900 mb-2">{program.title}</h3>
                                <p className="text-slate-600 text-sm mb-4 line-clamp-3">
                                    {program.description}
                                </p>
                                <Link href={`#program-${program.id}`} className="inline-flex items-center text-primary font-semibold text-sm hover:text-blue-700 transition-colors">
                                    Learn more <ArrowRight className="ml-1 w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
