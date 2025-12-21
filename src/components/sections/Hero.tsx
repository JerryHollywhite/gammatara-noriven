"use client";

import Link from "next/link";
import Image from "next/image"; // Added Image import
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "../ui/Button";
import { motion } from "framer-motion";

interface HeroProps {
    backgroundImage?: string;
}

export default function Hero({ backgroundImage }: HeroProps) {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <Image
                    src={backgroundImage || "https://images.unsplash.com/photo-1577896337318-2869d3240e4e?q=80&w=2070&auto=format&fit=crop"}
                    alt="Gamma Tara Learning Centre"
                    fill
                    className="object-cover"
                    priority
                    sizes="100vw"
                />
                <div className="absolute inset-0 bg-slate-900/60 mix-blend-multiply" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/10" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6">
                        <span className="flex h-2 w-2 rounded-full bg-secondary animate-pulse"></span>
                        <span className="text-sm font-medium tracking-wide uppercase">New Intake Open for 2025</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-heading mb-6 leading-tight tracking-tight drop-shadow-sm">
                        Unlock Your Child’s <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">Best Academic Potential</span>
                    </h1>

                    <p className="text-lg md:text-2xl text-slate-200 mb-8 max-w-3xl mx-auto leading-relaxed font-light">
                        With personalized guidance, high-achieving mentors, and small class sizes (Max 4-7 Students), we ensure your child gets the focus they truly deserve.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link href="#contact">
                            <Button size="lg" className="rounded-full text-lg w-full sm:w-auto h-14">
                                Check Class Availability <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </Link>
                        <Link href="#programs">
                            <Button variant="outline" size="lg" className="rounded-full text-lg w-full sm:w-auto h-14 bg-white/5 border-white/20 text-white hover:bg-white hover:text-slate-900 backdrop-blur-sm">
                                Explore Programs
                            </Button>
                        </Link>
                    </div>

                    <div className="mt-12 flex flex-wrap justify-center gap-6 md:gap-12 text-sm md:text-base font-medium text-slate-300">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-secondary" />
                            <span>Small Class Sizes (4-7 Max)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-secondary" />
                            <span>Personalized Curriculum</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-secondary" />
                            <span>Proven Track Record</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
