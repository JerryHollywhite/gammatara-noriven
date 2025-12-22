import Link from "next/link";
import { Facebook, Instagram, Youtube, MapPin, Phone, Mail, MessageCircle } from "lucide-react";

interface FooterProps {
    address?: string;
    phone?: string;
    email?: string;
    copyright?: string;
    siteContent?: Record<string, string>;
}

export default function Footer({ address, phone, email, copyright, siteContent = {} }: FooterProps) {
    return (
        <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

                    {/* Brand Column */}
                    <div className="space-y-4">
                        <h3 className="text-2xl font-bold font-heading text-white">Gamma Tara</h3>
                        <p className="max-w-xs text-slate-400">
                            {siteContent["Footer_Description"] || "Unlock Your Potential. We provide personalized guidance to help every student achieve their best academic results."}
                        </p>
                        <div className="flex space-x-4 pt-2">
                            <Link href="#" className="hover:text-primary-foreground transition-colors"><Facebook className="w-5 h-5" /></Link>
                            <Link href="#" className="hover:text-primary-foreground transition-colors"><Youtube className="w-5 h-5" /></Link>
                            <Link href="#" className="hover:text-primary-foreground transition-colors"><Instagram className="w-5 h-5" /></Link>
                            {/* TikTok */}
                            <Link href="#" className="hover:text-primary-foreground transition-colors">
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                    <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z" />
                                </svg>
                            </Link>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-white">{siteContent["Footer_Label_Programs"] || "Programs"}</h4>
                        <ul className="space-y-2">
                            <li><Link href="#program-kindergarten" className="hover:text-white transition-colors">{siteContent["Footer_Link_Kindergarten"] || "Kindergarten (Ages 4-6)"}</Link></li>
                            <li><Link href="#program-primary" className="hover:text-white transition-colors">{siteContent["Footer_Link_Primary"] || "Primary School (Grades 1-6)"}</Link></li>
                            <li><Link href="#program-secondary" className="hover:text-white transition-colors">{siteContent["Footer_Link_Secondary"] || "Secondary School (SMP & SMA)"}</Link></li>
                            <li><Link href="#program-adult" className="hover:text-white transition-colors">{siteContent["Footer_Link_Adult"] || "Adult & Professional"}</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-white">{siteContent["Footer_Label_Contact"] || "Contact Us"}</h4>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-primary-foreground/70 mt-1 shrink-0" />
                                <span>{address || "Ruko Cahaya Garden Blok AA No. 28-29, Kel. Sei Panas, Batam 29433."}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                {/* WhatsApp Icon */}
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-primary-foreground/70 shrink-0 hover:text-[#25D366] transition-colors">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                </svg>
                                <a
                                    href={`https://wa.me/${(phone || "6285117189988").replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-[#25D366] transition-colors"
                                >
                                    {phone || "+62 851 1718 9988"}
                                </a>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-primary-foreground/70 shrink-0" />
                                <span>{email || "gammatara88@gmail.com"}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
                    {copyright || `© ${new Date().getFullYear()} Gamma Tara Learning Centre. All Rights Reserved.`}
                </div>
            </div>
        </footer>
    );
}
