```
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ContactSection from "@/components/sections/ContactSection";
import ProgramGallery from "@/components/sections/ProgramGallery";
import Link from "next/link";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { getGalleryImages, getSiteImages } from "@/lib/googleSheets";
import PageHeader from "@/components/layout/PageHeader";

export const revalidate = 60;

export default async function PrimarySchoolPage() {
    const galleryImages = await getGalleryImages("Primary");
    const siteImages = await getSiteImages();
    const heroImage = siteImages["Hero_Primary"];

    return (
        <main className="min-h-screen bg-white">
            <Navbar />
            
            <PageHeader 
                title="Primary School Program"
                subtitle="Developing independence and mastering basics."
                backgroundImage={siteImages["Hero_Primary"]}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
                <div className="mb-8">
                    <Link href="/#programs" className="text-primary hover:text-primary/80 font-medium inline-flex items-center gap-2 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Programs
                    </Link>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-slate-900 mb-6">
                    Primary School <span className="text-primary block text-2xl md:text-3xl mt-2 font-sans font-medium">Grades 1-6</span>
                </h1>
                <p className="text-xl text-slate-600 max-w-2xl leading-relaxed">
                    Developing independence and mastering basics. We help students gain confidence in core subjects and daily habits.
                </p>
            </div>

            {/* Content Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-xl bg-slate-200">
                            {/* Placeholder for actual image */}
                            <div className="absolute inset-0 flex items-center justify-center text-slate-400 bg-slate-100">
                                Image: Primary School Students
                            </div>
                        </div>

                        <div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-6">Mastering the Basics</h3>
                            <p className="text-slate-600 mb-6">
                                Primary school is a crucial time for building academic confidence. We focus on ensuring every student truly understands the core concepts before moving forward.
                            </p>
                            <div className="space-y-4">
                                {[
                                    "Core Subjects: Mathematics, Science, English, & Bahasa.",
                                    "Homework Help: Daily guidance to ensure assignments are understood.",
                                    "Exam Preparation: Specific drills for mid-terms and finals.",
                                    "Character Building: Encouraging discipline and curiosity."
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-3 items-start">
                                        <CheckCircle className="w-6 h-6 text-secondary flex-shrink-0 mt-0.5" />
                                        <p className="text-slate-700">{item}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-10">
                                <Link
                                    href="#contact"
                                    className="inline-block bg-primary text-white text-lg font-semibold px-8 py-3 rounded-full hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform transition-all"
                                >
                                    Check Class Availability
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Dynamic Gallery */}
            <ProgramGallery images={galleryImages} title="Student Activities" />

            <ContactSection />
            <Footer />
        </main>
    );
}
