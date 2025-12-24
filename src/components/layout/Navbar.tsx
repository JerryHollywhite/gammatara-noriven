"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, LogIn, LogOut, BookOpen } from "lucide-react";
import { clsx } from "clsx";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { useSession, signIn, signOut } from "next-auth/react";

// Standard Public Navigation Items
const publicNavItems = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/about" },
    { name: "Programs", href: "/programs" },
    { name: "Teachers", href: "/#teachers" },
    { name: "Gallery", href: "/gallery" },
];

interface NavbarProps {
    logoUrl?: string;
}

export default function Navbar({ logoUrl }: NavbarProps) {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Combine public items with protected items
    const navItems = [...publicNavItems];
    if (session) {
        navItems.push({ name: "TaraLMS", href: "/modules" });
    }

    return (
        <nav
            className={clsx(
                "fixed w-full z-50 transition-all duration-300 border-b",
                scrolled
                    ? "bg-white/95 backdrop-blur-md border-slate-200 shadow-sm py-2"
                    : "bg-white/80 backdrop-blur-sm border-transparent py-4"
            )}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="relative w-10 h-10 overflow-hidden bg-primary/10 rounded-lg p-1 transition-transform group-hover:scale-105">
                            <Image
                                src={logoUrl || "https://drive.google.com/uc?export=view&id=1QwTFI0BxqAy2i74TzJb9RkR_dqUvQyIl"}
                                alt="Gamma Tara Logo"
                                width={40}
                                height={40}
                                className="object-contain"
                            />
                        </div>
                        <span className={clsx(
                            "font-heading font-bold text-xl tracking-tight transition-colors",
                            scrolled ? "text-slate-900" : "text-slate-800"
                        )}>
                            Gamma Tara
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-6">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={clsx(
                                    "font-medium transition-colors hover:text-primary",
                                    scrolled ? "text-slate-700" : "text-slate-800",
                                    item.name === "TaraLMS" && "text-primary font-bold"
                                )}
                            >
                                {item.name}
                            </Link>
                        ))}

                        {/* DEV: Roles Dropdown */}
                        <div className="relative group">
                            <button className={clsx(
                                "flex items-center gap-1 font-medium transition-colors hover:text-primary",
                                scrolled ? "text-slate-700" : "text-slate-800"
                            )}>
                                <span className="text-xs font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-500 group-hover:bg-primary group-hover:text-white transition-all">DEV</span>
                            </button>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top z-[100]">
                                <Link href="/student/dashboard" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary rounded-lg font-medium">Student Dashboard</Link>
                                <Link href="/teacher/dashboard" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary rounded-lg font-medium">Teacher Dashboard</Link>
                                <Link href="/parent/dashboard" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary rounded-lg font-medium">Parent Portal</Link>
                                <div className="h-px bg-slate-100 my-1"></div>
                                <Link href="/student/quiz/mock" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary rounded-lg font-medium">Demo Quiz</Link>
                                <Link href="/admin/content" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary rounded-lg font-medium">Admin Content</Link>
                            </div>
                        </div>

                        <div className="h-6 w-px bg-slate-300 mx-2" />

                        <LanguageSwitcher />

                        {!session ? (
                            <button
                                onClick={() => signIn()}
                                className="flex items-center gap-2 text-slate-700 font-medium hover:text-primary transition-colors"
                            >
                                <LogIn className="w-4 h-4" /> Login
                            </button>
                        ) : (
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-medium text-slate-600 truncate max-w-[100px]">
                                    {session.user?.name?.split(' ')[0]}
                                </span>
                                <button
                                    onClick={() => signOut()}
                                    className="flex items-center gap-2 text-slate-700 font-medium hover:text-red-600 transition-colors"
                                    title="Logout"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        <Link
                            href="#contact"
                            className="bg-primary text-white px-5 py-2 rounded-full font-semibold shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all transform hover:-translate-y-0.5 text-sm"
                        >
                            Contact Us
                        </Link>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-gray-700 hover:text-primary focus:outline-none p-2"
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 shadow-lg absolute w-full left-0 top-full max-h-[90vh] overflow-y-auto">
                    <div className="px-4 pt-2 pb-6 space-y-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={clsx(
                                    "block px-3 py-3 rounded-md text-base font-medium hover:bg-gray-50 hover:text-primary",
                                    item.name === "TaraLMS" ? "text-primary bg-primary/5" : "text-gray-900"
                                )}
                                onClick={() => setIsOpen(false)}
                            >
                                {item.name}
                            </Link>
                        ))}

                        <div className="border-t border-gray-100 my-2 pt-2">
                            <div className="px-3 py-2 flex justify-between items-center">
                                <span className="text-sm text-gray-500">Language</span>
                                <LanguageSwitcher />
                            </div>
                        </div>

                        {!session ? (
                            <button
                                onClick={() => { signIn(); setIsOpen(false); }}
                                className="w-full text-left px-3 py-3 rounded-md text-base font-medium text-gray-900 hover:bg-gray-50 hover:text-primary flex items-center gap-2"
                            >
                                <LogIn className="w-4 h-4" /> Login
                            </button>
                        ) : (
                            <button
                                onClick={() => { signOut(); setIsOpen(false); }}
                                className="w-full text-left px-3 py-3 rounded-md text-base font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                                <LogOut className="w-4 h-4" /> Logout ({session.user?.name?.split(' ')[0]})
                            </button>
                        )}

                        <Link
                            href="#contact"
                            className="mt-4 block w-full text-center bg-primary text-white px-4 py-3 rounded-full font-semibold shadow-md active:bg-primary/90"
                            onClick={() => setIsOpen(false)}
                        >
                            Contact Us
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
