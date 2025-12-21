import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageHeader from "@/components/layout/PageHeader";
import ProgramGallery from "@/components/sections/ProgramGallery";
import ContactSection from "@/components/sections/ContactSection";
import { getGalleryImages, getSiteImages } from "@/lib/googleSheets";

export const revalidate = 60;

export default async function GalleryPage() {
    const siteImages = await getSiteImages();
    // Fetch all gallery images (excluding reserved ones like Hero_*)
    const allImages = await getGalleryImages();

    return (
        <main className="min-h-screen bg-white">
            <Navbar />
            <PageHeader
                title="Our Gallery"
                subtitle="Capturing moments of learning, joy, and growth."
                backgroundImage={siteImages["Hero_Gallery"]}
            />

            <ProgramGallery images={allImages} title="All Moments" />

            <div className="bg-slate-50 py-12">
                <ContactSection />
            </div>
            <Footer />
        </main>
    );
}
