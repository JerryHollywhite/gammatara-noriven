import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageHeader from "@/components/layout/PageHeader";
import ContactSection from "@/components/sections/ContactSection";
import { getSiteImages, getSiteContent } from "@/lib/googleSheets";

export const revalidate = 60;

export default async function AboutPage() {
    const siteImages = await getSiteImages();
    const siteContent = await getSiteContent();

    return (
        <main className="min-h-screen bg-white font-sans">
            <Navbar />
            <PageHeader
                title="About Gamma Tara"
                subtitle="Nurturing minds, building character, and shaping the future."
                backgroundImage={siteImages["Hero_About"]}
            />

            {/* Content Section */}
            <section className="py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="prose prose-lg prose-slate mx-auto text-slate-900">
                        <h3 className="text-3xl font-bold text-slate-900 mb-6">{siteContent["About_History_Title"] || "Sejarah Kami"}</h3>
                        <div className="whitespace-pre-wrap text-slate-900 font-medium">
                            {siteContent["About_History_Text"] || `Didirikan oleh Noriven pada bulan April 2014, dengan program tuition terbaru bernama 'Riven Course', pusat pembelajaran kami lahir dari passion mendalam terhadap pendidikan untuk menjembatani kesenjangan antara metode pengajaran tradisional dan kebutuhan pembelajaran modern.

Dengan latar belakang di dunia pendidikan dan keyakinan kuat pada kekuatan transformasi pengetahuan, Riven menyadari potensi pemberdayaan individu dengan keterampilan yang tidak hanya memperkaya secara akademis tetapi juga dapat diterapkan secara praktis di dunia yang serba cepat saat ini.

Komitmen teguh Riven untuk mempromosikan pembelajaran seumur hidup dan pertumbuhan pribadi telah menjadi dasar misi pusat kami.`}
                        </div>
                    </div>
                </div>
            </section>

            <ContactSection
                address={siteContent["Contact_Address"]}
                phone={siteContent["Contact_Phone"]}
                email={siteContent["Contact_Email"]}
            />
            <Footer
                address={siteContent["Contact_Address"]}
                phone={siteContent["Contact_Phone"]}
                email={siteContent["Contact_Email"]}
                copyright={siteContent["Footer_Copyright"]}
            />
        </main>
    );
}
