"use client";

import { useState, useEffect } from "react";
import Papa from "papaparse";
import { X } from "lucide-react";

interface PopupContent {
    Type: string;         // "YOUTUBE" | "IMAGE"
    Content_URL: string;  // YouTube URL or Image URL
    Target_URL?: string;  // Click destination (for images)
    Active: string;       // "TRUE" | "FALSE"
}

// Google Sheet CSV URL
const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQqqvzypykY7PGqqOGqhXIGyU-HwzbTaxtKZC4hyrW_LWGwL42YNC7aNx-Ullc_YTuHtEKVxvZkdY-O/pub?gid=1693299670&single=true&output=csv";

export default function HomePopup() {
    const [isOpen, setIsOpen] = useState(false);
    const [content, setContent] = useState<PopupContent | null>(null);

    useEffect(() => {
        // Fetch CSV directly (No localStorage check)
        fetch(SHEET_CSV_URL)
            .then(res => res.text())
            .then(csvText => {
                // Parse CSV
                Papa.parse<PopupContent>(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        const allRows = results.data;

                        // Filter Active
                        const activeRows = allRows.filter(row =>
                            row.Active?.trim().toUpperCase() === "TRUE" && row.Content_URL
                        );

                        if (activeRows.length > 0) {
                            // Select Random
                            const randomIndex = Math.floor(Math.random() * activeRows.length);
                            setContent(activeRows[randomIndex]);
                            // Delay slightly for effect or immediate
                            setTimeout(() => setIsOpen(true), 1500);
                        }
                    }
                });
            })
            .catch(err => console.error("Error fetching popup data:", err));
    }, []);

    const handleClose = () => {
        setIsOpen(false);
    };

    if (!isOpen || !content) return null;

    // Helper to extract YouTube Video ID
    const getYouTubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const isYouTube = content.Type?.trim().toUpperCase() === "YOUTUBE";
    const youtubeId = isYouTube ? getYouTubeId(content.Content_URL) : null;

    // Social Links
    const socialLinks = [
        {
            name: "WhatsApp",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                    <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1H15a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0-1 0 2 2 0 0 1-2-2z" stroke="none" />
                </svg>
            ),
            url: "https://wa.me/6285117188131",
            color: "bg-green-500 hover:bg-green-600"
        },
        {
            name: "Instagram",
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>,
            url: "https://www.instagram.com/bimbel_gammatara",
            color: "bg-pink-600 hover:bg-pink-700"
        },
        {
            name: "TikTok",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                </svg>
            ),
            url: "https://www.tiktok.com/@bimbel_gammatara",
            color: "bg-black hover:bg-gray-800 border border-gray-700"
        },
        {
            name: "Facebook",
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>,
            url: "https://www.facebook.com/people/Gama-Tara/pfbid02wsCMM8LtS6GtXYFSzpKLQgvsip7goQ6SXMWnG8Z52NEHyB7ymzWagvDncZybsysAl/?rdid=7FWwVkmjo8Jhq4uo&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1KC7s5mh53%2F",
            color: "bg-blue-600 hover:bg-blue-700"
        },
        {
            name: "YouTube",
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" /><path d="m10 15 5-3-5-3z" /></svg>,
            url: "https://www.youtube.com/@bimbel_gammatara",
            color: "bg-red-600 hover:bg-red-700"
        }
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            {/* Wrapper for layout */}
            <div className="relative flex flex-col md:flex-row items-center gap-4 max-w-full">

                {/* Main Content (Video/Image) */}
                <div className="relative w-full md:w-[350px] lg:w-[400px] aspect-[9/16] bg-black rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 ring-1 ring-white/10">

                    {/* Close Button (Mobile Only / Inside container) */}
                    <button
                        onClick={handleClose}
                        className="md:hidden absolute top-4 right-4 z-20 bg-black/50 text-white p-2 rounded-full hover:bg-black/80 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                        {isYouTube && youtubeId ? (
                            <iframe
                                className="w-full h-full"
                                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&enablejsapi=1&controls=1&loop=1&playlist=${youtubeId}&rel=0&modestbranding=1&playsinline=1`}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        ) : (
                            <a
                                href={content.Target_URL || "#"}
                                target={content.Target_URL ? "_blank" : "_self"}
                                rel={content.Target_URL ? "noopener noreferrer" : ""}
                                className={`w-full h-full relative block ${!content.Target_URL ? 'pointer-events-none' : ''}`}
                            >
                                <img
                                    src={content.Content_URL}
                                    alt="Announcement"
                                    className="w-full h-full object-cover"
                                />
                            </a>
                        )}
                    </div>
                </div>

                {/* Sidebar Actions (Right Side on Desktop) */}
                <div className="flex flex-row md:flex-col gap-3 animate-in slide-in-from-left-4 duration-500 delay-150">

                    {/* Close Button (Desktop Outside) */}
                    <button
                        onClick={handleClose}
                        className="hidden md:flex items-center justify-center w-12 h-12 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all backdrop-blur-md mb-2"
                        title="Close"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    {/* Social Buttons */}
                    {socialLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center justify-center w-12 h-12 rounded-full text-white transition-all transform hover:scale-110 shadow-lg ${link.color}`}
                            title={link.name}
                        >
                            {link.icon}
                        </a>
                    ))}
                </div>

            </div>
        </div>
    );
}
