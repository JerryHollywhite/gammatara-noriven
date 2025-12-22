import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageHeader from "@/components/layout/PageHeader";
import ContactSection from "@/components/sections/ContactSection";
import { getSiteImages, getSiteContent } from "@/lib/googleSheets";

export const revalidate = 60;

export default async function AboutPage(props: { searchParams: Promise<{ lang?: string }> }) {
    const searchParams = await props.searchParams;
    const lang = (searchParams?.lang as 'id' | 'en' | 'cn') || 'id';

    const siteImages = await getSiteImages();
    const siteContent = await getSiteContent(lang);

    return (
        <main className="min-h-screen bg-white font-sans">
            <Navbar logoUrl={siteImages["Logo"]} />
            <PageHeader
                title={siteContent["About_Header_Title"] || "About Gamma Tara"}
                subtitle={siteContent["About_Header_Subtitle"] || "Nurturing minds, building character, and shaping the future."}
                backgroundImage={siteImages["Hero_About"]}
            />

            {/* Content Section */}
            {/* History Section */}
            <section className="py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="prose prose-lg prose-slate mx-auto text-slate-900">
                        <h3 className="text-3xl font-bold text-slate-900 mb-8">{siteContent["About_History_Title"] || "Sejarah Kami"}</h3>
                        <div className="space-y-6 text-slate-700 leading-relaxed">
                            <p>
                                {siteContent["About_History_Text_1"] || siteContent["About_History_Text"] ||
                                    "Didirikan oleh Noriven pada bulan April 2014, dengan program tuition terbaru bernama 'Riven Course', pusat pembelajaran kami lahir dari passion mendalam terhadap pendidikan untuk menjembatani kesenjangan antara metode pengajaran tradisional dan kebutuhan pembelajaran modern."}
                            </p>
                            <p>
                                {siteContent["About_History_Text_2"] ||
                                    "Dengan latar belakang di dunia pendidikan dan keyakinan kuat pada kekuatan transformasi pengetahuan, Riven menyadari potensi pemberdayaan individu dengan keterampilan yang tidak hanya memperkaya secara akademis tetapi juga dapat diterapkan secara praktis di dunia yang serba cepat saat ini."}
                            </p>
                            <blockquote className="border-l-4 border-primary pl-4 italic text-slate-900 font-medium my-8 bg-slate-50 p-6 rounded-r-lg">
                                {siteContent["About_History_Quote"] ||
                                    "Komitmen teguh Riven untuk mempromosikan pembelajaran seumur hidup dan pertumbuhan pribadi telah menjadi dasar misi pusat kami."}
                            </blockquote>
                        </div>
                    </div>
                </div>
            </section>

            {/* Vision & Mission Section */}
            <section className="py-20 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-12">
                        {/* Vision */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="text-2xl font-bold text-primary mb-4">{siteContent["About_Vision_Title"] || "Visi Kami"}</h3>
                            <p className="text-slate-700 text-lg leading-relaxed">
                                {siteContent["About_Vision_Text"] ||
                                    "Menjadi lembaga pendidikan terkemuka dan terpercaya yang menginspirasi dan membina pembelajar yang cerdas, terampil, dan berpikiran positif yang unggul dan berkontribusi pada pertumbuhan komunitas dan bangsa kita."}
                            </p>
                        </div>

                        {/* Mission */}
                        <div>
                            <h3 className="text-2xl font-bold text-primary mb-6">{siteContent["About_Mission_Title"] || "Misi Kami"}</h3>
                            <div className="space-y-6">
                                {[1, 2, 3].map((num) => (
                                    <div key={num} className="flex gap-4">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center font-bold">
                                            {num}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 mb-1">
                                                {siteContent[`About_Mission_${num}_Title`] || `Misi ${num}`}
                                            </h4>
                                            <p className="text-sm text-slate-600">
                                                {siteContent[`About_Mission_${num}_Desc`] || "Deskripsi misi..."}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

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
