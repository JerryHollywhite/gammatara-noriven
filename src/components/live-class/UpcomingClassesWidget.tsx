"use client";

import { useState, useEffect } from "react";
import { Video, Clock, ExternalLink } from "lucide-react";

interface LiveClass {
    id: string;
    title: string;
    description?: string;
    teacherName: string;
    zoomLink: string;
    scheduledAt: string;
    duration: number;
    status: string;
}

export default function UpcomingClassesWidget() {
    const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/student/live-class')
            .then(res => res.json())
            .then(json => {
                if (json.success) setLiveClasses(json.data.slice(0, 5));
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const isJoinable = (scheduledAt: string) => {
        const now = new Date();
        const classTime = new Date(scheduledAt);
        const diff = (classTime.getTime() - now.getTime()) / 1000 / 60; // minutes
        return diff <= 15 && diff >= -30; // 15 min before to 30 min after
    };

    if (loading) return <div className="animate-pulse bg-slate-100 h-32 rounded-2xl"></div>;

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
                <Video className="w-5 h-5 text-indigo-600" />
                Upcoming Live Classes
            </h3>
            {liveClasses.length > 0 ? (
                <div className="space-y-3">
                    {liveClasses.map(lc => (
                        <div key={lc.id} className="p-4 rounded-xl bg-slate-50 hover:bg-indigo-50/50 transition-all border border-transparent hover:border-indigo-100">
                            <h4 className="font-bold text-slate-700 text-sm mb-1">{lc.title}</h4>
                            <p className="text-xs text-slate-500 mb-2">by {lc.teacherName}</p>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-400 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {new Date(lc.scheduledAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </span>
                                {isJoinable(lc.scheduledAt) ? (
                                    <a
                                        href={lc.zoomLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-green-500 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-green-600 transition-colors flex items-center gap-1"
                                    >
                                        Join Now <ExternalLink className="w-3 h-3" />
                                    </a>
                                ) : (
                                    <span className="text-xs text-slate-400">
                                        {Math.round((new Date(lc.scheduledAt).getTime() - new Date().getTime()) / 1000 / 60)} min
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-8 text-center text-slate-400">
                    <Video className="w-12 h-12 mx-auto mb-2 text-slate-200" />
                    <p className="text-sm">No upcoming classes</p>
                </div>
            )}
        </div>
    );
}
