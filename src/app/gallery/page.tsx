import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageHeader from "@/components/layout/PageHeader";
import ProgramGallery from "@/components/sections/ProgramGallery";
import ContactSection from "@/components/sections/ContactSection";
import { getGalleryImages, getSiteImages, getSiteContent } from "@/lib/googleSheets";

export const revalidate = 60;

export default async function GalleryPage() {
    const [siteImages, siteContent, allImages] = await Promise.all([
        getSiteImages(),
        getSiteContent(),
        getGalleryImages()
    ]);

    return (
        <main className="min-h-screen bg-white">
            <Navbar />
            <PageHeader
                title={siteContent["Gallery_Header_Title"] || "Our Gallery"}
                subtitle={siteContent["Gallery_Header_Subtitle"] || "Capturing moments of learning, joy, and growth."}
                backgroundImage={siteImages["Hero_Gallery"]}
            />

            <ProgramGallery images={allImages} title={siteContent["Gallery_Section_Title"] || "All Moments"} />

            <div className="bg-slate-50 py-12">
                <ContactSection
                    address={siteContent["Contact_Address"]}
                    phone={siteContent["Contact_Phone"]}
                    email={siteContent["Contact_Email"]}
                    siteContent={siteContent}
                />
            </div>
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
