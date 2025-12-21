
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ContactSection from "@/components/sections/ContactSection";
import ProgramGallery from "@/components/sections/ProgramGallery";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { getGalleryImages, getSiteImages } from "@/lib/googleSheets";
import PageHeader from "@/components/layout/PageHeader";

export const revalidate = 60;

export default async function AdultProfessionalPage() {
    const galleryImages = await getGalleryImages("Adult");
    const siteImages = await getSiteImages();

    return (
        <main className="min-h-screen bg-white">
            <Navbar />

            <PageHeader
                title="Adult & Professional"
                subtitle="Practical skills for career advancement."
                backgroundImage={siteImages["Hero_Adult"]}
            />

            {/* Content Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-xl bg-slate-200">
                            {siteImages["Content_Adult"] ? (
                                <Image
                                    src={siteImages["Content_Adult"]}
                                    alt="Adult Professional Class"
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-slate-400 bg-slate-100">
                                    Image: Professionals in Workshop (Add 'Content_Adult' to Sheet)
                                </div>
                            )}
                        </div>

                        <div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-6">Lifelong Learning</h3>
                            <p className="text-slate-600 mb-6">
                                In today's fast-paced world, continuous learning is key. We offer focused courses designed for busy working adults.
                            </p>
                            <div className="space-y-4">
                                {[
                                    "English for Business: Communicate effectively in global markets.",
                                    "TOEFL / IELTS Prep: Certification for study or work abroad.",
                                    "Specialized Workshops: Data analysis, public speaking, and more.",
                                    "Flexible Schedule: Evening and weekend classes available."
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
            <ProgramGallery images={galleryImages} title="Professional Development" />

            <ContactSection />
            <Footer />
        </main>
    );
}
