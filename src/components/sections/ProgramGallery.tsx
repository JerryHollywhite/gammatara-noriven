"use client";

import Image from "next/image";
import { GalleryItem } from "@/lib/googleSheets";
import { motion } from "framer-motion";

interface ProgramGalleryProps {
    images: GalleryItem[];
    title?: string;
}

export default function ProgramGallery({ images, title = "Life at Gamma Tara" }: ProgramGalleryProps) {
    if (!images || images.length === 0) {
        return null;
    }

    return (
        <section className="py-16 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h3 className="text-3xl font-bold font-heading text-slate-900 mb-12 text-center">
                        {title}
                    </h3>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {images.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: index * 0.05 }}
                            whileHover={{ y: -5 }}
                            className="relative aspect-[4/5] group overflow-hidden rounded-2xl bg-slate-100 shadow-md cursor-pointer"
                        >
                            <Image
                                src={item.imageUrl}
                                alt={item.caption || `Gallery image ${index + 1}`}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            />

                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                            {/* Caption Content */}
                            {item.caption && (
                                <div className="absolute inset-x-0 bottom-0 p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                    <p className="text-white font-medium text-sm border-l-2 border-secondary pl-3">
                                        {item.caption}
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
