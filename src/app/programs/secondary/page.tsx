
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ContactSection from "@/components/sections/ContactSection";
import ProgramGallery from "@/components/sections/ProgramGallery";
import Link from "next/link";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { getGalleryImages, getSiteImages } from "@/lib/googleSheets";
import PageHeader from "@/components/layout/PageHeader";

export const revalidate = 60;

export default async function SecondarySchoolPage() {
    const galleryImages = await getGalleryImages("Secondary");
    const siteImages = await getSiteImages();
    const heroImage = siteImages["Hero_Secondary"]; // This variable is no longer directly used for the hero section, but might be used by PageHeader.

    return (
        <main className="min-h-screen bg-white">
            <Navbar />

            <PageHeader
                title="Secondary School Program"
                subtitle="Bridging the gap to higher education."
                backgroundImage={siteImages["Hero_Secondary"]}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
                <div className="mb-0">
                    <Link href="/programs" className="text-white/90 hover:text-white font-medium inline-flex items-center gap-2 transition-colors bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm">
                        <ArrowLeft className="w-4 h-4" /> Back to Programs
                    </Link>
                </div>
            </div>

            {/* Content Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-xl bg-slate-200">
                            {/* Placeholder for actual image */}
                            <div className="absolute inset-0 flex items-center justify-center text-slate-400 bg-slate-100">
                                Image: High School Students Studying
                            </div>
                        </div>

                        <div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-6">University Prep & Success</h3>
                            <p className="text-slate-600 mb-6">
                                Our extensive curriculum covers both National Standard (Kurikulum Merdeka) and International standards, preparing students for top-tier universities.
                            </p>
                            <div className="space-y-4">
                                {[
                                    "Subject Mastery: Physics, Chemistry, Biology, Math, & more.",
                                    "Exam Focus: UTBK, SNBT, and School Exams.",
                                    "Scientific Thinking: Advanced problem solving and logic.",
                                    "Mentorship: Guidance on college majors and career paths."
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
            <ProgramGallery images={galleryImages} title="Classroom Highlights" />

            <ContactSection />
            <Footer />
        </main>
    );
}
