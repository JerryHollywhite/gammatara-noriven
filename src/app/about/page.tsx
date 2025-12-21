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
                        <h3>Our Mission</h3>
                        <p>
                            At Gamma Tara Learning Centre, we believe that education is more than just academic grades.
                            It is about fostering a love for learning, building resilience, and developing the character needed to succeed in life.
                        </p>

                        <h3>Our Approach</h3>
                        <p>
                            We provide a personalized learning environment with small class sizes, ensuring every student gets the attention they deserve.
                            Our expert mentors are dedicated to unlocking each child's potential through tailored curriculum and interactive teaching methods.
                        </p>

                        <h3>Why Choose Us?</h3>
                        <ul>
                            <li>Small Class Sizes (Max 4-7 Students)</li>
                            <li>Personalized Curriculum</li>
                            <li>Proven Track Record</li>
                            <li>Experienced & Dedicated Mentors</li>
                        </ul>
                    </div>
                </div>
            </section>

            <ContactSection />
            <Footer />
        </main>
    );
}
