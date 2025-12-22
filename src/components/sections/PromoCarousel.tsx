"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { GalleryItem } from "@/lib/googleSheets";

interface PromoCarouselProps {
    promos: GalleryItem[];
    title?: string;
    description?: string;
}

export default function PromoCarousel({ promos, title, description }: PromoCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto-rotate every 5 seconds
    useEffect(() => {
        if (promos.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % promos.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [promos.length]);

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % promos.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + promos.length) % promos.length);
    };

    if (!promos || promos.length === 0) {
        return null; // Only hide if no images. Title/Desc alone might not warrant a section.
    }

    return (
        <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
            {(title || description) && (
                <div className="text-center mb-8">
                    {title && <h2 className="text-2xl md:text-3xl font-bold font-heading text-slate-900 mb-2">{title}</h2>}
                    {description && <p className="text-slate-600 max-w-2xl mx-auto">{description}</p>}
                </div>
            )}

            <div className="relative aspect-[21/9] md:aspect-[21/7] w-full overflow-hidden rounded-2xl shadow-xl bg-slate-900">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0"
                    >
                        <Image
                            src={promos[currentIndex].imageUrl}
                            alt={promos[currentIndex].caption || "Promo"}
                            fill
                            className="object-cover"
                            priority
                        />
                        {/* Caption Overlay */}
                        {promos[currentIndex].caption && (
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6 md:p-8">
                                <motion.p
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-white text-xs md:text-sm font-medium max-w-xl bg-black/60 px-3 py-2 rounded-md backdrop-blur-sm"
                                >
                                    {promos[currentIndex].caption}
                                </motion.p>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Navigation Buttons (only if > 1 slide) */}
                {promos.length > 1 && (
                    <>
                        <button
                            onClick={handlePrev}
                            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors backdrop-blur-sm"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button
                            onClick={handleNext}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors backdrop-blur-sm"
                        >
                            <ChevronRight size={24} />
                        </button>

                        {/* Dots */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                            {promos.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentIndex(idx)}
                                    className={`w-2.5 h-2.5 rounded-full transition-all ${idx === currentIndex ? "bg-white w-6" : "bg-white/50 hover:bg-white/80"
                                        }`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}
