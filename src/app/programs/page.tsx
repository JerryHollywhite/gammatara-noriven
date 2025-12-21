import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageHeader from "@/components/layout/PageHeader";
import AcademicPrograms from "@/components/sections/AcademicPrograms";
import ContactSection from "@/components/sections/ContactSection";
import { getSiteImages } from "@/lib/googleSheets";

export const revalidate = 60;

export default async function ProgramsPage() {
    const siteImages = await getSiteImages();

    return (
        <main className="min-h-screen bg-white">
            <Navbar />
            <PageHeader
                title="Our Programs"
                subtitle="Comprehensive learning pathways designed for every stage of your child's development."
                backgroundImage={siteImages["Hero_Programs"]}
            />

            <AcademicPrograms programImages={siteImages} />

            <div className="bg-slate-50 py-12">
                <ContactSection />
            </div>
            <Footer />
        </main>
    );
}
