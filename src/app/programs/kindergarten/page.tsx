
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ContactSection from "@/components/sections/ContactSection";
import ProgramGallery from "@/components/sections/ProgramGallery";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { getGalleryImages, getSiteImages, getSiteContent } from "@/lib/googleSheets";
import PageHeader from "@/components/layout/PageHeader";

export const revalidate = 60;

export default async function KindergartenPage() {
    const [galleryImages, siteImages, siteContent] = await Promise.all([
        getGalleryImages("Kindergarten"),
        getSiteImages(),
        getSiteContent()
    ]);

    return (
        <main className="min-h-screen bg-white">
            <Navbar />

            <PageHeader
                title={siteContent["Kindergarten_Page_Title"] || "Kindergarten Program"}
                subtitle={siteContent["Kindergarten_Page_Subtitle"] || "Building strong foundations for cognitive and social skills."}
                backgroundImage={siteImages["Hero_Kindergarten"]}
            />

            {/* Content Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-xl bg-slate-200">
                            {siteImages["Content_Kindergarten"] ? (
                                <Image
                                    src={siteImages["Content_Kindergarten"]}
                                    alt="Kindergarten Activities"
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-slate-400 bg-slate-100">
                                    Image: Happy Kids Learning (Add 'Content_Kindergarten' to Sheet)
                                </div>
                            )}
                        </div>

                        <div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-6">{siteContent["Kindergarten_Content_Title"] || "Why Start Early with Gamma Tara?"}</h3>
                            <div className="space-y-4">
                                {[
                                    siteContent["Kindergarten_Feature_1"] || "Interactive Learning: Fun games that teach math and logic.",
                                    siteContent["Kindergarten_Feature_2"] || "Social Skills: Collaboration and communication activities.",
                                    siteContent["Kindergarten_Feature_3"] || "Personalized Attention: Small groups (max 4-7 students).",
                                    siteContent["Kindergarten_Feature_4"] || "Safe Environment: A nurturing space for your child to grow."
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
                                    {siteContent["Kindergarten_Page_CTA"] || "Check Class Availability"}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Dynamic Gallery */}
            <ProgramGallery images={galleryImages} title={siteContent["Kindergarten_Gallery_Title"] || "Kindergarten Moments"} />

            <ContactSection
                address={siteContent["Contact_Address"]}
                phone={siteContent["Contact_Phone"]}
                email={siteContent["Contact_Email"]}
                siteContent={siteContent}
            />
            <Footer
                address={siteContent["Contact_Address"]}
                phone={siteContent["Contact_Phone"]}
                email={siteContent["Contact_Email"]}
                copyright={siteContent["Footer_Copyright"]}
                siteContent={siteContent}
            />
        </main>
    );
}
