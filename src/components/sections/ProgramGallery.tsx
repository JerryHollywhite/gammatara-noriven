"use client";

import Image from "next/image";
import { GalleryItem } from "@/lib/googleSheets";

interface ProgramGalleryProps {
    images: GalleryItem[];
    title?: string;
}

export default function ProgramGallery({ images, title = "Life at Gamma Tara" }: ProgramGalleryProps) {
    if (!images || images.length === 0) {
        return null;
    }

    return (
        <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h3 className="text-2xl font-bold font-heading text-slate-900 mb-8 text-center">
                    {title}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((item, index) => (
                        <div key={index} className="relative aspect-square group overflow-hidden rounded-xl bg-slate-100 shadow-sm transition-all hover:shadow-md">
                            <Image
                                src={item.imageUrl}
                                alt={item.caption || `Gallery image ${index + 1}`}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            />
                            {item.caption && (
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                    <p className="text-white text-sm font-medium">{item.caption}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
