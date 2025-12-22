import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageHeader from "@/components/layout/PageHeader";
import ProgramGallery from "@/components/sections/ProgramGallery";
import ContactSection from "@/components/sections/ContactSection";
import { getGalleryImages, getSiteImages, getSiteContent } from "@/lib/googleSheets";

export const revalidate = 60;

export default async function GalleryPage(props: { searchParams: Promise<{ lang?: string }> }) {
    const searchParams = await props.searchParams;
    const lang = (searchParams?.lang as 'id' | 'en' | 'cn') || 'id';

    const [galleryImages, siteImages, siteContent] = await Promise.all([
        getGalleryImages(undefined, lang), // Get ALL images for the main gallery
        getSiteImages(),
        getSiteContent(lang)
    ]);

    // Group images by category for filtering
    const categories = ["All", "Kindergarten", "Primary", "Secondary", "Adult"];

    return (
        <main className="min-h-screen bg-white">
            <Navbar logoUrl={siteImages["Logo"]} />
            <PageHeader
                title={siteContent["Gallery_Header_Title"] || "Our Gallery"}
                subtitle={siteContent["Gallery_Header_Subtitle"] || "Capturing moments of learning, joy, and growth."}
                backgroundImage={siteImages["Hero_Gallery"]}
            />

            <ProgramGallery images={galleryImages} title={siteContent["Gallery_Section_Title"] || "All Moments"} />

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
