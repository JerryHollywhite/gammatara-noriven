import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageHeader from "@/components/layout/PageHeader";
import AcademicPrograms from "@/components/sections/AcademicPrograms";
import ContactSection from "@/components/sections/ContactSection";
import { getSiteImages, getSiteContent } from "@/lib/googleSheets";

export const revalidate = 60;

export default async function ProgramsPage(props: { searchParams: Promise<{ lang?: string }> }) {
    const searchParams = await props.searchParams;
    const lang = (searchParams?.lang as 'id' | 'en' | 'cn') || 'id';
    const [siteImages, siteContent] = await Promise.all([
        getSiteImages(),
        getSiteContent()
    ]);

    return (
        <main className="min-h-screen bg-white">
            <Navbar />
            <PageHeader
                title={siteContent["Programs_Page_Title"] || "Our Programs"}
                subtitle={siteContent["Programs_Page_Subtitle"] || "Comprehensive learning pathways designed for every stage of your child's development."}
                backgroundImage={siteImages["Hero_Programs"]}
            />

            <AcademicPrograms programImages={siteImages} siteContent={siteContent} />

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
