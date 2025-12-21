import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageHeader from "@/components/layout/PageHeader";
import ContactSection from "@/components/sections/ContactSection";
import { getSiteImages } from "@/lib/googleSheets";

export const revalidate = 60;

export default async function AboutPage() {
    const siteImages = await getSiteImages();

    return (
        <main className="min-h-screen bg-white">
            <Navbar />
            <PageHeader
                title="About Gamma Tara"
                subtitle="Nurturing minds, building character, and shaping the future."
                backgroundImage={siteImages["Hero_About"]}
            />

            {/* Content Section */}
            <section className="py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="prose prose-lg prose-slate mx-auto">
                        <h3 className="text-3xl font-bold text-slate-900 mb-6">Sejarah Kami</h3>
                        <p>
                            Didirikan oleh Noriven pada bulan April 2014, dengan program tuition terbaru bernama 'Riven Course', pusat pembelajaran kami lahir dari passion mendalam terhadap pendidikan untuk menjembatani kesenjangan antara metode pengajaran tradisional dan kebutuhan pembelajaran modern.
                        </p>
                        <p>
                            Dengan latar belakang di dunia pendidikan dan keyakinan kuat pada kekuatan transformasi pengetahuan, Riven menyadari potensi pemberdayaan individu dengan keterampilan yang tidak hanya memperkaya secara akademis tetapi juga dapat diterapkan secara praktis di dunia yang serba cepat saat ini.
                        </p>
                        <p>
                            Komitmen teguh Riven untuk mempromosikan pembelajaran seumur hidup dan pertumbuhan pribadi telah menjadi dasar misi pusat kami.
                        </p>
                    </div>
                </div>
            </section>

            <ContactSection />
            <Footer />
        </main>
    );
}
