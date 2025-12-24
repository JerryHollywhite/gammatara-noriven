"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleTaraLMSClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (!session) {
            router.push("/login");
        } else {
            const role = session.user?.role;
            if (role === "STUDENT") router.push("/student/dashboard");
            else if (role === "TEACHER") router.push("/teacher/dashboard");
            else if (role === "PARENT") router.push("/parent/dashboard");
            else router.push("/login");
        }
    };

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
                        {publicNavItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={clsx(
                                    "font-medium transition-colors hover:text-primary",
                                    scrolled ? "text-slate-700" : "text-slate-800"
                                )}
                            >
                                {item.name}
                            </Link>
                        ))}

                        {/* TaraLMS Link (Replaces DEV & Modules) */}
                        <a
                            href="/login"
                            onClick={handleTaraLMSClick}
                            className={clsx(
                                "font-bold transition-colors cursor-pointer flex items-center gap-1",
                                scrolled ? "text-primary" : "text-primary"
                            )}
                        >
                            TaraLMS
                        </a>

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
                        {publicNavItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="block px-3 py-3 rounded-md text-base font-medium text-gray-900 hover:bg-gray-50 hover:text-primary"
                                onClick={() => setIsOpen(false)}
                            >
                                {item.name}
                            </Link>
                        ))}

                        <a
                            href="/login"
                            onClick={(e) => {
                                setIsOpen(false);
                                handleTaraLMSClick(e);
                            }}
                            className="block px-3 py-3 rounded-md text-base font-bold text-primary bg-primary/5 hover:bg-primary/10"
                        >
                            TaraLMS
                        </a>

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
