"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";
import { clsx } from "clsx";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isProgramsOpen, setIsProgramsOpen] = useState(false);

    return (
        <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20 items-center">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center gap-2">
                        <Link href="/" className="flex items-center gap-2">
                            <span className="text-2xl font-bold font-heading text-primary">
                                Gamma Tara
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link
                            href="/"
                            className="text-foreground hover:text-primary font-medium transition-colors"
                        >
                            Home
                        </Link>
                        <Link
                            href="#about"
                            className="text-foreground hover:text-primary font-medium transition-colors"
                        >
                            About Us
                        </Link>

                        {/* Programs Dropdown */}
                        <div className="relative group">
                            <button
                                className="flex items-center text-foreground hover:text-primary font-medium transition-colors focus:outline-none"
                                onClick={() => setIsProgramsOpen(!isProgramsOpen)}
                                onMouseEnter={() => setIsProgramsOpen(true)}
                                onMouseLeave={() => setIsProgramsOpen(false)}
                            >
                                Programs <ChevronDown className="ml-1 w-4 h-4" />
                            </button>

                            {isProgramsOpen && (
                                <div
                                    className="absolute left-0 mt-0 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden"
                                    onMouseEnter={() => setIsProgramsOpen(true)}
                                    onMouseLeave={() => setIsProgramsOpen(false)}
                                >
                                    <div className="py-1">
                                        <Link href="#program-kindergarten" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary">Kindergarten</Link>
                                        <Link href="#program-primary" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary">Primary School</Link>
                                        <Link href="#program-secondary" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary">Secondary School</Link>
                                        <Link href="#program-adult" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary">Adult Course</Link>
                                    </div>
                                </div>
                            )}
                        </div>

                        <Link
                            href="#teachers"
                            className="text-foreground hover:text-primary font-medium transition-colors"
                        >
                            Teachers
                        </Link>
                        <Link
                            href="#gallery"
                            className="text-foreground hover:text-primary font-medium transition-colors"
                        >
                            Gallery
                        </Link>

                        <Link
                            href="#contact"
                            className="bg-primary text-white px-6 py-2.5 rounded-full font-semibold shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all transform hover:-translate-y-0.5"
                        >
                            Contact Us
                        </Link>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-gray-700 hover:text-primary focus:outline-none"
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 shadow-lg absolute w-full">
                    <div className="px-4 pt-2 pb-6 space-y-1">
                        <Link
                            href="/"
                            className="block px-3 py-3 rounded-md text-base font-medium text-gray-900 hover:bg-gray-50 hover:text-primary"
                            onClick={() => setIsOpen(false)}
                        >
                            Home
                        </Link>
                        <Link
                            href="#about"
                            className="block px-3 py-3 rounded-md text-base font-medium text-gray-900 hover:bg-gray-50 hover:text-primary"
                            onClick={() => setIsOpen(false)}
                        >
                            About Us
                        </Link>
                        <div className="px-3 py-3">
                            <div className="font-medium text-gray-900 mb-2">Programs</div>
                            <div className="pl-4 space-y-2 border-l-2 border-gray-100">
                                <Link href="#program-kindergarten" className="block text-sm text-gray-600 hover:text-primary" onClick={() => setIsOpen(false)}>Kindergarten</Link>
                                <Link href="#program-primary" className="block text-sm text-gray-600 hover:text-primary" onClick={() => setIsOpen(false)}>Primary School</Link>
                                <Link href="#program-secondary" className="block text-sm text-gray-600 hover:text-primary" onClick={() => setIsOpen(false)}>Secondary School</Link>
                                <Link href="#program-adult" className="block text-sm text-gray-600 hover:text-primary" onClick={() => setIsOpen(false)}>Adult Course</Link>
                            </div>
                        </div>
                        <Link
                            href="#teachers"
                            className="block px-3 py-3 rounded-md text-base font-medium text-gray-900 hover:bg-gray-50 hover:text-primary"
                            onClick={() => setIsOpen(false)}
                        >
                            Teachers
                        </Link>
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
