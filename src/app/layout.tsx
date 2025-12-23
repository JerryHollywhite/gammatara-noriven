import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://gammatara.com"),
  title: {
    default: "Gamma Tara Learning Centre | Unlock Your Potential",
    template: "%s | Gamma Tara Learning Centre"
  },
  description: "Premier tuition centre in Batam offering personalized guidance, small class sizes, and high-achieving mentors for Kindergarten to Adult learners.",
  keywords: ["Tuition Centre Batam", "Gamma Tara", "Bimbel Batam", "Math Tuition", "English Course", "Mandarin Class", "Science Tuition"],
  authors: [{ name: "Gamma Tara Team" }],
  openGraph: {
    title: "Gamma Tara Learning Centre | Unlock Your Potential",
    description: "Premier tuition centre in Batam offering personalized guidance, small class sizes, and high-achieving mentors.",
    url: "/",
    siteName: "Gamma Tara Learning Centre",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/images/hero-home.jpg", // Fallback image (needs to be real)
        width: 1200,
        height: 630,
        alt: "Gamma Tara Learning Centre"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Gamma Tara Learning Centre",
    description: "Premier tuition centre in Batam. Unlock your potential with us.",
    // images: ["/images/hero-home.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${outfit.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
