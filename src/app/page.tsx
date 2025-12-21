import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import USPSection from "@/components/sections/USPSection";
import AcademicPrograms from "@/components/sections/AcademicPrograms";
import HallOfFame from "@/components/sections/HallOfFame";
import Testimonials from "@/components/sections/Testimonials";
import ContactSection from "@/components/sections/ContactSection";
import SchedulesSection from "@/components/sections/SchedulesSection";
import { getTeachers, getSchedules, getSiteImages } from "@/lib/googleSheets";

// Revalidate data every 60 seconds (ISR)
export const revalidate = 60;

export default async function Home() {
  const teachers = await getTeachers();
  const schedules = await getSchedules();
  const siteImages = await getSiteImages();

  return (
    <main className="min-h-screen bg-white font-sans text-slate-900">
      <Navbar />
      <Hero backgroundImage={siteImages["Hero_Home"]} />
      <USPSection />
      <SchedulesSection schedules={schedules} />
      <AcademicPrograms programImages={siteImages} />
      <HallOfFame teachers={teachers} />
      <Testimonials />
      <ContactSection />
      <Footer />
    </main>
  );
}
