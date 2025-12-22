import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import USPSection from "@/components/sections/USPSection";
import AcademicPrograms from "@/components/sections/AcademicPrograms";
import HallOfFame from "@/components/sections/HallOfFame";
import Testimonials from "@/components/sections/Testimonials";
import ContactSection from "@/components/sections/ContactSection";
import SchedulesSection from "@/components/sections/SchedulesSection";
import { getTeachers, getSchedules, getSiteImages, getGalleryImages, getSiteContent, getTestimonials } from "@/lib/googleSheets";
import PromoCarousel from "@/components/sections/PromoCarousel";

// Revalidate data every 60 seconds (ISR)
export const revalidate = 60;

export default async function Home(props: { searchParams: Promise<{ lang?: string }> }) {
  const searchParams = await props.searchParams;
  const lang = (searchParams?.lang as 'id' | 'en' | 'cn') || 'id';

  const [teachers, galleryImages, testimonials, siteImages, siteContent, schedules, promoImages] = await Promise.all([
    getTeachers(),
    getGalleryImages(),
    getTestimonials(),
    getSiteImages(),
    getSiteContent(lang),
    getSchedules(),
    getGalleryImages("Promo")
  ]);

  return (
    <main className="min-h-screen bg-white font-sans text-slate-900">
      <Navbar logoUrl={siteImages["Logo"]} />
      <Hero
        backgroundImage={siteImages["Hero_Home"]}
        title={siteContent["Home_Hero_Title"]}
        subtitle={siteContent["Home_Hero_Subtitle"]}
        ctaText={siteContent["Home_Hero_CTA"]}
        siteContent={siteContent}
      />
      <PromoCarousel
        promos={promoImages}
        title={siteContent["Promo_Title"]}
        description={siteContent["Promo_Desc"]}
      />
      <USPSection
        title={siteContent["Why_Title"]}
        subtitle={siteContent["Why_Subtitle"]}
        siteContent={siteContent}
      />
      <SchedulesSection schedules={schedules} siteContent={siteContent} />
      <AcademicPrograms programImages={siteImages} siteContent={siteContent} />
      <HallOfFame teachers={teachers} siteContent={siteContent} />
      <Testimonials testimonials={testimonials} siteContent={siteContent} />
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
