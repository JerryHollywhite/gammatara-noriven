"use client";

import { useState, useEffect } from "react";
import { Clock, Plus, Trash, Calendar, X } from "lucide-react";

interface Schedule {
    id: string;
    type: string;
    dayOfWeek?: number;
    startTime: string;
    endTime: string;
    date?: string;
    isCancelled: boolean;
}

interface ScheduleTabProps {
    classId: string;
    onScheduleChange?: () => void; // Optional callback for parent refresh
}

const DAYS = [
    { value: 1, label: "Monday" },
    { value: 2, label: "Tuesday" },
    { value: 3, label: "Wednesday" },
    { value: 4, label: "Thursday" },
    { value: 5, label: "Friday" },
    { value: 6, label: "Saturday" },
    { value: 7, label: "Sunday" }
];

export default function ScheduleTab({ classId, onScheduleChange }: ScheduleTabProps) {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState(false);

    // Form state for recurring
    const [selectedDay, setSelectedDay] = useState<number>(1);
    const [startTime, setStartTime] = useState("10:00");
    const [endTime, setEndTime] = useState("11:30");

    // One-time form state
    const [showOneTimeForm, setShowOneTimeForm] = useState(false);
    const [oneTimeDate, setOneTimeDate] = useState("");
    const [oneTimeStart, setOneTimeStart] = useState("10:00");
    const [oneTimeEnd, setOneTimeEnd] = useState("11:30");

    useEffect(() => {
        fetchSchedules();
    }, [classId]);

    const fetchSchedules = async () => {
        try {
            const res = await fetch(`/api/teacher/classes/${classId}/schedule`);
            const json = await res.json();
            if (json.success) {
                setSchedules(json.schedules);
            }
        } catch (e) {
            console.error("Error fetching schedules:", e);
        }
    };

    const handleAddRecurring = async () => {
        if (!startTime || !endTime) {
            alert("Please select start and end times");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/teacher/classes/${classId}/schedule`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'RECURRING',
                    dayOfWeek: selectedDay,
                    startTime,
                    endTime
                })
            });

            const json = await res.json();
            if (json.success) {
                fetchSchedules();
                onScheduleChange?.(); // Trigger parent refresh
                alert("Recurring schedule added!");
            } else {
                alert(json.error || "Failed to add schedule");
            }
        } catch (e) {
            alert("Error adding schedule");
        } finally {
            setLoading(false);
        }
    };

    const handleAddOneTime = async () => {
        if (!oneTimeDate || !oneTimeStart || !oneTimeEnd) {
            alert("Please fill all fields");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/teacher/classes/${classId}/schedule`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'ONE_TIME',
                    startTime: oneTimeStart,
                    endTime: oneTimeEnd,
                    date: oneTimeDate
                })
            });

            const json = await res.json();
            if (json.success) {
                fetchSchedules();
                setShowOneTimeForm(false);
                setOneTimeDate("");
                onScheduleChange?.(); // Trigger parent refresh
                alert("One-time session added!");
            } else {
                alert(json.error || "Failed to add session");
            }
        } catch (e) {
            alert("Error adding session");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (scheduleId: string) => {
        if (!confirm("Delete this schedule?")) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/teacher/classes/${classId}/schedule/${scheduleId}`, {
                method: 'DELETE'
            });

            const json = await res.json();
            if (json.success) {
                fetchSchedules();
                onScheduleChange?.(); // Trigger parent refresh
            } else {
                alert("Failed to delete");
            }
        } catch (e) {
            alert("Error deleting schedule");
        } finally {
            setLoading(false);
        }
    };

    const recurringSchedules = schedules.filter(s => s.type === 'RECURRING' && !s.isCancelled);
    const oneTimeSchedules = schedules.filter(s => s.type === 'ONE_TIME' && !s.isCancelled);

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Recurring Weekly Schedule */}
            <div>
                <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-600" />
                    Recurring Weekly Schedule
                </h4>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    {/* Add New Recurring */}
                    <div className="grid grid-cols-3 gap-3">
                        <select
                            value={selectedDay}
                            onChange={(e) => setSelectedDay(Number(e.target.value))}
                            className="px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm"
                        >
                            {DAYS.map(d => (
                                <option key={d.value} value={d.value}>{d.label}</option>
                            ))}
                        </select>
                        <input
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
                        />
                        <input
                            type="time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
                        />
                    </div>
                    <button
                        onClick={handleAddRecurring}
                        disabled={loading}
                        className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Add Recurring Schedule
                    </button>
                </div>

                {/* List Recurring */}
                <div className="mt-3 space-y-2">
                    {recurringSchedules.map(schedule => (
                        <div
                            key={schedule.id}
                            className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg group hover:border-indigo-200 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Clock className="w-4 h-4 text-indigo-600" />
                                <span className="font-medium text-slate-700">
                                    {DAYS.find(d => d.value === schedule.dayOfWeek)?.label}
                                </span>
                                <span className="text-sm text-slate-500">
                                    {schedule.startTime} - {schedule.endTime}
                                </span>
                            </div>
                            <button
                                onClick={() => handleDelete(schedule.id)}
                                className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-all"
                            >
                                <Trash className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    {recurringSchedules.length === 0 && (
                        <p className="text-sm text-slate-400 italic text-center py-4">
                            No recurring schedules yet
                        </p>
                    )}
                </div>
            </div>

            {/* One-Time Sessions */}
            <div>
                <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-emerald-600" />
                    One-Time Sessions
                </h4>

                {!showOneTimeForm ? (
                    <button
                        onClick={() => setShowOneTimeForm(true)}
                        className="w-full py-2 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-medium hover:bg-emerald-100 flex items-center justify-center gap-2 border border-emerald-200"
                    >
                        <Plus className="w-4 h-4" /> Add One-Time Session
                    </button>
                ) : (
                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-emerald-700">New One-Time Session</span>
                            <button
                                onClick={() => setShowOneTimeForm(false)}
                                className="p-1 hover:bg-emerald-100 rounded"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <input
                                type="date"
                                value={oneTimeDate}
                                onChange={(e) => setOneTimeDate(e.target.value)}
                                className="px-3 py-2 border border-emerald-200 rounded-lg text-sm"
                            />
                            <input
                                type="time"
                                value={oneTimeStart}
                                onChange={(e) => setOneTimeStart(e.target.value)}
                                className="px-3 py-2 border border-emerald-200 rounded-lg text-sm"
                            />
                            <input
                                type="time"
                                value={oneTimeEnd}
                                onChange={(e) => setOneTimeEnd(e.target.value)}
                                className="px-3 py-2 border border-emerald-200 rounded-lg text-sm"
                            />
                        </div>
                        <button
                            onClick={handleAddOneTime}
                            disabled={loading}
                            className="w-full py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
                        >
                            Add Session
                        </button>
                    </div>
                )}

                {/* List One-Time */}
                <div className="mt-3 space-y-2">
                    {oneTimeSchedules.map(schedule => (
                        <div
                            key={schedule.id}
                            className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg group hover:border-emerald-200 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Calendar className="w-4 h-4 text-emerald-600" />
                                <span className="font-medium text-slate-700">
                                    {schedule.date ? new Date(schedule.date).toLocaleDateString() : ''}
                                </span>
                                <span className="text-sm text-slate-500">
                                    {schedule.startTime} - {schedule.endTime}
                                </span>
                            </div>
                            <button
                                onClick={() => handleDelete(schedule.id)}
                                className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-all"
                            >
                                <Trash className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    {oneTimeSchedules.length === 0 && !showOneTimeForm && (
                        <p className="text-sm text-slate-400 italic text-center py-4">
                            No one-time sessions scheduled
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
