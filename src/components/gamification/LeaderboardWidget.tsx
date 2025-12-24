import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Crown } from "lucide-react";

interface LeaderboardEntry {
    rank: number;
    id: string;
    name: string;
    avatar: string;
    xp: number;
    level: number;
    badges: number;
}

export default function LeaderboardWidget() {
    const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/gamification/leaderboard?limit=5')
            .then(res => res.json())
            .then(json => {
                if (json.success) setLeaders(json.data);
                setLoading(false);
            })
            .catch(err => setLoading(false));
    }, []);

    if (loading) return <div className="p-6 text-center text-slate-400 text-xs">Loading ranks...</div>;

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center justify-between">
                <span className="flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-500" /> Leaderboard</span>
                <span className="text-xs font-bold text-slate-400">Top 5</span>
            </h3>

            <div className="space-y-4">
                {leaders.map((student, index) => (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        key={student.id}
                        className={`flex items-center justify-between p-3 rounded-xl transition-all ${index === 0 ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 shadow-sm' : 'hover:bg-slate-50 border border-transparent hover:border-slate-100'}`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 flex items-center justify-center font-bold rounded-full ${index === 0 ? 'bg-yellow-100 text-yellow-600' :
                                index === 1 ? 'bg-slate-100 text-slate-500' :
                                    index === 2 ? 'bg-orange-50 text-orange-600' :
                                        'text-slate-400'
                                }`}>
                                {index === 0 ? <Crown className="w-4 h-4" /> : `#${student.rank}`}
                            </div>
                            <img
                                src={student.avatar}
                                alt={student.name}
                                className="w-9 h-9 rounded-full border border-slate-200 object-cover bg-slate-100"
                            />
                            <div>
                                <p className={`text-sm font-bold truncate max-w-[100px] ${index === 0 ? 'text-slate-800' : 'text-slate-700'}`}>
                                    {student.name}
                                </p>
                                <p className="text-[10px] text-slate-400 font-medium">Lvl {student.level} • {student.badges} Badges</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className={`text-xs font-bold ${index === 0 ? 'text-yellow-600' : 'text-indigo-600'}`}>
                                {student.xp} XP
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>

            <button className="w-full mt-6 text-center text-sm font-bold text-slate-500 hover:text-indigo-600 py-2 border-t border-slate-50 hover:bg-slate-50 transition-colors">
                View Global Rankings
            </button>
        </div>
    );
}
