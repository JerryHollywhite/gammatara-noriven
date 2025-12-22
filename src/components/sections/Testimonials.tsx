"use client";

import { useState, useEffect } from "react";
import { Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Testimonial } from "@/lib/googleSheets";

interface TestimonialsProps {
    testimonials?: Testimonial[];
    siteContent?: Record<string, string>;
}

export default function Testimonials({ testimonials = [], siteContent = {} }: TestimonialsProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto-advance carousel
    useEffect(() => {
        if (testimonials.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % testimonials.length);
        }, 8000); // 8 seconds per slide
        return () => clearInterval(interval);
    }, [testimonials.length]);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    };

    if (!testimonials || testimonials.length === 0) return null;

    return (
        <section id="testimonials" className="py-24 bg-primary text-white overflow-hidden relative">
            {/* Background Pattern */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute right-0 top-0 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute left-0 bottom-0 w-96 h-96 bg-secondary rounded-full mix-blend-overlay filter blur-3xl -translate-x-1/2 translate-y-1/2"></div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">
                        {siteContent["Testimonial_Header_Title"] || "Hear From Our Students"}
                    </h2>
                    <p className="text-blue-200 text-lg">
                        {siteContent["Testimonial_Header_Subtitle"] || "Real stories of growth and success."}
                    </p>
                </div>

                <div className="relative">
                    {/* Carousel Content */}
                    <div className="overflow-hidden min-h-[400px] md:min-h-[300px] flex items-center justify-center">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentIndex}
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                transition={{ duration: 0.5 }}
                                className="w-full max-w-4xl mx-auto"
                            >
                                <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-3xl p-8 md:p-12 relative shadow-2xl">
                                    <Quote className="absolute top-8 left-8 w-12 h-12 text-secondary opacity-30" />

                                    <div className="flex flex-col md:flex-row gap-8 items-center">
                                        <div className="shrink-0 relative">
                                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white/20 shadow-lg relative">
                                                <Image
                                                    src={testimonials[currentIndex].photo}
                                                    alt={testimonials[currentIndex].name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="absolute -bottom-2 -right-2 bg-secondary text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                                                {testimonials[currentIndex].role}
                                            </div>
                                        </div>

                                        <div className="text-center md:text-left flex-1">
                                            <p className="text-lg md:text-xl text-white italic leading-relaxed mb-6 font-light">
                                                "{testimonials[currentIndex].quoteEn}"
                                            </p>
                                            <div>
                                                <h4 className="text-xl font-bold text-white">{testimonials[currentIndex].name}</h4>
                                                {/* Optional: Add rating stars here if applicable */}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Navigation Buttons */}
                    <button
                        onClick={prevSlide}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all text-white border border-white/10"
                        aria-label="Previous testimonial"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all text-white border border-white/10"
                        aria-label="Next testimonial"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>

                    {/* Indicators */}
                    <div className="flex justify-center gap-2 mt-8">
                        {testimonials.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`w-2.5 h-2.5 rounded-full transition-all ${currentIndex === index ? "bg-secondary w-6" : "bg-white/30 hover:bg-white/50"
                                    }`}
                                aria-label={`Go to testimonial ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
