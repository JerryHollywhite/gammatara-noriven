import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award, X } from "lucide-react";

interface BadgeNotificationProps {
    badge: {
        name: string;
        icon: string;
        description: string;
    } | null;
    onClose: () => void;
}

export default function BadgeNotification({ badge, onClose }: BadgeNotificationProps) {
    useEffect(() => {
        if (badge) {
            const timer = setTimeout(() => {
                onClose();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [badge, onClose]);

    return (
        <AnimatePresence>
            {badge && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.8 }}
                    className="fixed bottom-6 right-6 z-[100] bg-white rounded-2xl shadow-2xl border border-yellow-200 p-1 pr-4 flex items-center gap-4 max-w-sm"
                >
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-300 to-amber-500 rounded-xl flex items-center justify-center text-3xl shadow-lg shrink-0 relative overflow-hidden">
                        <motion.div
                            initial={{ rotate: -20 }}
                            animate={{ rotate: 0 }}
                            className="relative z-10"
                        >
                            {badge.icon}
                        </motion.div>
                        <div className="absolute inset-0 bg-white/20 animate-pulse" />
                    </div>

                    <div>
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] uppercase font-bold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full border border-yellow-100">Badge Unlocked!</span>
                        </div>
                        <h4 className="font-bold text-slate-800 leading-tight">{badge.name}</h4>
                        <p className="text-xs text-slate-500 mt-1">{badge.description}</p>
                    </div>

                    <button
                        onClick={onClose}
                        className="ml-auto p-1 text-slate-300 hover:text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    {/* Confetti particles effect could go here */}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
