"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import ScrollAnimation from "../ui/ScrollAnimation";

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

interface AcademicProgramsProps {
    programImages?: Record<string, string>;
    siteContent?: Record<string, string>;
}

export default function AcademicPrograms({ programImages = {}, siteContent = {} }: AcademicProgramsProps) {
    const updatedPrograms = programs.map(p => {
        const capitalizedId = p.id.charAt(0).toUpperCase() + p.id.slice(1);
        return {
            ...p,
            title: siteContent[`Program_${capitalizedId}_Title`] || p.title,
            description: siteContent[`Program_${capitalizedId}_Desc`] || p.description,
            age: siteContent[`Program_${capitalizedId}_Label`] || p.age,
            image: programImages[`Card_${capitalizedId}`] || programImages[`Card_${p.title}`] || p.image
        };
    });

    return (
        <section id="programs" className="py-24 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <ScrollAnimation>
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-primary font-semibold tracking-wider uppercase text-sm">
                            {siteContent["Program_Header_Label"] || "Pathways to Excellence"}
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold font-heading text-slate-900 mt-2 mb-4">
                            {siteContent["Program_Header_Title"] || "Our Academic Programs"}
                        </h2>
                        <p className="text-lg text-slate-600">
                            {siteContent["Program_Header_Subtitle"] || "Tailored learning journeys for every stage of development."}
                        </p>
                    </div>
                </ScrollAnimation>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {updatedPrograms.map((program, index) => (
                        <ScrollAnimation key={program.id} delay={index * 0.1}>
                            <Link
                                href={`/programs/${program.id}`}
                                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 block h-full border border-slate-100/80"
                            >
                                <div className="relative h-48 overflow-hidden">
                                    <Image
                                        src={program.image}
                                        alt={program.title}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-80" />
                                    <div className="absolute bottom-4 left-4">
                                        <span className="inline-block px-3 py-1 bg-secondary/90 backdrop-blur-sm text-secondary-foreground text-xs font-bold rounded-full uppercase shadow-md">
                                            {program.age}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors">{program.title}</h3>
                                    <p className="text-slate-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                                        {program.description}
                                    </p>
                                    <span className="inline-flex items-center text-primary font-bold text-sm group-hover:translate-x-1 transition-transform">
                                        {siteContent["Program_Card_CTA"] || "Learn more"} <ArrowRight className="ml-1 w-4 h-4" />
                                    </span>
                                </div>
                            </Link>
                        </ScrollAnimation>
                    ))}
                </div>
            </div>
        </section>
    );
}
