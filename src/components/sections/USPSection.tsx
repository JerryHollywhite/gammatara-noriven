"use client";

import { Users, Trophy, Smile } from "lucide-react";
import ScrollAnimation from "../ui/ScrollAnimation";

const features = [
    {
        icon: Users,
        title: "Exclusive Class Ratios",
        description: "Unlike crowded tuition centers, we offer Intensive (Max 4) and Regular (Max 7) classes to ensure every student gets noticed and understood.",
        color: "bg-blue-100 text-primary",
    },
    {
        icon: Trophy,
        title: "High-Achieving Mentors",
        description: "Learn from the best. Our teachers include Math Olympiad winners, International Debate champions, and experienced subject advisors.",
        color: "bg-amber-100 text-amber-700",
    },
    {
        icon: Smile,
        title: "Fun & Balance Methodology",
        description: "We mix serious learning with a friendly atmosphere. Students stay motivated without feeling bored or stressed, achieving a perfect balance.",
        color: "bg-green-100 text-green-700",
    },
];

interface USPSectionProps {
    title?: string;
    subtitle?: string;
    siteContent?: Record<string, string>;
}

export default function USPSection({ title, subtitle, siteContent = {} }: USPSectionProps) {
    const dynamicFeatures = features.map((f, i) => ({
        ...f,
        title: siteContent[`Why_Card_${i + 1}_Title`] || f.title,
        description: siteContent[`Why_Card_${i + 1}_Desc`] || f.description,
    }));

    return (
        <section id="why-choose-us" className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <ScrollAnimation>
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold font-heading text-slate-900 mb-4">
                            {title || "Why Gamma Tara is the Right Choice"}
                        </h2>
                        <p className="text-lg text-slate-600">
                            {subtitle || "We focus on what matters most: your child's growth, confidence, and results."}
                        </p>
                    </div>
                </ScrollAnimation>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
                    {dynamicFeatures.map((feature, index) => (
                        <ScrollAnimation key={index} delay={index * 0.2}>
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 hover:shadow-xl transition-all duration-300 border border-slate-100/50 hover:-translate-y-2 relative overflow-hidden group">
                                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-${feature.color.split("-")[1]}-50 to-transparent rounded-bl-full opacity-50 group-hover:scale-110 transition-transform`} />

                                <div className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mb-6 relative z-10 shadow-sm`}>
                                    <feature.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3 relative z-10">{feature.title}</h3>
                                <p className="text-slate-600 leading-relaxed relative z-10">
                                    {feature.description}
                                </p>
                            </div>
                        </ScrollAnimation>
                    ))}
                </div>
            </div>
        </section>
    );
}
