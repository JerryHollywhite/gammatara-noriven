"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Video, Clock, Calendar, Plus, X } from "lucide-react";

interface LiveClass {
    id: string;
    title: string;
    description?: string;
    className: string;
    zoomLink: string;
    meetingId?: string;
    passcode?: string;
    scheduledAt: string;
    duration: number;
    status: string;
}

export default function LiveClassManager() {
    const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Form state
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [zoomLink, setZoomLink] = useState("");
    const [meetingId, setMeetingId] = useState("");
    const [passcode, setPasscode] = useState("");
    const [scheduledDate, setScheduledDate] = useState("");
    const [scheduledTime, setScheduledTime] = useState("");
    const [duration, setDuration] = useState("60");

    useEffect(() => {
        fetchLiveClasses();
    }, []);

    const fetchLiveClasses = () => {
        fetch('/api/teacher/live-class')
            .then(res => res.json())
            .then(json => {
                if (json.success) setLiveClasses(json.data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();

        const res = await fetch('/api/teacher/live-class', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title,
                description,
                zoomLink,
                meetingId,
                passcode,
                scheduledAt,
                duration: parseInt(duration)
            })
        });

        if (res.ok) {
            setShowModal(false);
            resetForm();
            fetchLiveClasses();
        }
    };

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setZoomLink("");
        setMeetingId("");
        setPasscode("");
        setScheduledDate("");
        setScheduledTime("");
        setDuration("60");
    };

    if (loading) return <div className="p-8 text-slate-400">Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Video className="w-6 h-6 text-indigo-600" />
                    Live Classes
                </h2>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all"
                >
                    <Plus className="w-4 h-4" /> Schedule Class
                </button>
            </div>

            {/* Live Classes List */}
            <div className="grid gap-4">
                {liveClasses.length > 0 ? (
                    liveClasses.map(lc => (
                        <div key={lc.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">{lc.title}</h3>
                                    <p className="text-sm text-slate-500">{lc.className}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${lc.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-600' :
                                        lc.status === 'ONGOING' ? 'bg-green-100 text-green-600' :
                                            'bg-slate-100 text-slate-600'
                                    }`}>
                                    {lc.status}
                                </span>
                            </div>
                            {lc.description && <p className="text-sm text-slate-600 mb-3">{lc.description}</p>}
                            <div className="flex items-center gap-4 text-sm text-slate-500 mb-3">
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(lc.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {lc.duration} mins
                                </span>
                            </div>
                            <a
                                href={lc.zoomLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-100 transition-colors"
                            >
                                Join Zoom
                            </a>
                        </div>
                    ))
                ) : (
                    <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-300 text-center">
                        <Video className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                        <p className="text-slate-500">No live classes scheduled yet.</p>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-3xl w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-slate-800">Schedule Live Class</h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Description (Optional)</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20 h-24"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Zoom Link</label>
                                <input
                                    type="url"
                                    value={zoomLink}
                                    onChange={(e) => setZoomLink(e.target.value)}
                                    placeholder="https://zoom.us/j/..."
                                    className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Meeting ID (Optional)</label>
                                    <input
                                        type="text"
                                        value={meetingId}
                                        onChange={(e) => setMeetingId(e.target.value)}
                                        className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Passcode (Optional)</label>
                                    <input
                                        type="text"
                                        value={passcode}
                                        onChange={(e) => setPasscode(e.target.value)}
                                        className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Date</label>
                                    <input
                                        type="date"
                                        value={scheduledDate}
                                        onChange={(e) => setScheduledDate(e.target.value)}
                                        className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Time</label>
                                    <input
                                        type="time"
                                        value={scheduledTime}
                                        onChange={(e) => setScheduledTime(e.target.value)}
                                        className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Duration (minutes)</label>
                                <input
                                    type="number"
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                    min="15"
                                    step="15"
                                    className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors"
                            >
                                Schedule Live Class
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
