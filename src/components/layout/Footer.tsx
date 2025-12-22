import Link from "next/link";
import { Facebook, Instagram, Youtube, MapPin, Phone, Mail, MessageCircle } from "lucide-react";

interface FooterProps {
    address?: string;
    phone?: string;
    email?: string;
    copyright?: string;
}

export default function Footer({ address, phone, email, copyright }: FooterProps) {
    return (
        <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

                    {/* Brand Column */}
                    <div className="space-y-4">
                        <h3 className="text-2xl font-bold font-heading text-white">Gamma Tara</h3>
                        <p className="max-w-xs text-slate-400">
                            Unlock Your Potential. We provide personalized guidance to help every student achieve their best academic results.
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
                        <h4 className="text-lg font-semibold text-white">Programs</h4>
                        <ul className="space-y-2">
                            <li><Link href="#program-kindergarten" className="hover:text-white transition-colors">Kindergarten (Ages 4-6)</Link></li>
                            <li><Link href="#program-primary" className="hover:text-white transition-colors">Primary School (Grades 1-6)</Link></li>
                            <li><Link href="#program-secondary" className="hover:text-white transition-colors">Secondary School (SMP & SMA)</Link></li>
                            <li><Link href="#program-adult" className="hover:text-white transition-colors">Adult & Professional</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-white">Contact Us</h4>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-primary-foreground/70 mt-1 shrink-0" />
                                <span>{address || "Ruko Cahaya Garden Blok AA No. 28-29, Kel. Sei Panas, Batam 29433."}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-primary-foreground/70 shrink-0" />
                                <span>{phone || "+62 851 1718 8131"}</span>
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
