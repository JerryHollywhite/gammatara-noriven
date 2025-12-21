"use client";

import { Users, Trophy, Smile } from "lucide-react";
import { motion } from "framer-motion";

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

export default function USPSection() {
    return (
        <section id="why-choose-us" className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold font-heading text-slate-900 mb-4">
                        Why Gamma Tara is the Right Choice
                    </h2>
                    <p className="text-lg text-slate-600">
                        We focus on what matters most: your child's growth, confidence, and results.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2 }}
                            className="bg-slate-50 rounded-2xl p-8 hover:shadow-lg transition-shadow border border-slate-100"
                        >
                            <div className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mb-6`}>
                                <feature.icon className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                            <p className="text-slate-600 leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
