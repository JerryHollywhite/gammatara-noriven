"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { clsx } from "clsx";

export default function LanguageSwitcher() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const currentLang = searchParams.get("lang") || "id";

    const handleSwitch = (lang: string) => {
        const params = new URLSearchParams(searchParams);
        params.set("lang", lang);
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="flex items-center gap-2 bg-slate-100/50 rounded-full p-1 border border-slate-200">
            {["id", "en", "cn"].map((lang) => (
                <button
                    key={lang}
                    onClick={() => handleSwitch(lang)}
                    className={clsx(
                        "px-3 py-1 rounded-full text-sm font-semibold transition-all uppercase",
                        currentLang === lang
                            ? "bg-primary text-white shadow-sm"
                            : "text-slate-600 hover:text-primary hover:bg-white/50"
                    )}
                >
                    {lang}
                </button>
            ))}
        </div>
    );
}
