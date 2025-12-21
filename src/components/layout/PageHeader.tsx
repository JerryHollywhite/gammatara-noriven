"use client";

import Image from "next/image";
import { motion } from "framer-motion";

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    backgroundImage?: string;
}

export default function PageHeader({ title, subtitle, backgroundImage }: PageHeaderProps) {
    // Default image if none provided
    const bgImage = backgroundImage || "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2022&auto=format&fit=crop";

    return (
        <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <Image
                    src={bgImage}
                    alt={title}
                    fill
                    className="object-cover"
                    priority
                    sizes="100vw"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-slate-900/50 mix-blend-multiply" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading mb-6 tracking-tight drop-shadow-md">
                        {title}
                    </h1>
                </motion.div>
                {subtitle && (
                    <p className="text-lg md:text-xl text-slate-200 max-w-3xl mx-auto font-light leading-relaxed">
                        {subtitle}
                    </p>
                )}
            </div>
        </section>
    );
}
