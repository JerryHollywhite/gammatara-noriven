"use client";

import { Calendar, Clock, MapPin } from "lucide-react";

export interface ScheduleItem {
    course: string;
    day: string;
    time: string;
    location: string;
    status: "Available" | "Filling Fast" | "Full";
}

interface SchedulesSectionProps {
    schedules?: ScheduleItem[];
}

export default function SchedulesSection({ schedules = [] }: SchedulesSectionProps) {
    // If no schedules are active/provided, consider hiding the section or showing a generic message
    // For now, we will just return null if empty to keep the design clean, OR show default if we want to demonstrate layout.

    const displaySchedules = schedules.length > 0 ? schedules : [
        {
            course: "Mathematics Intensive (Primary 6)",
            day: "Monday & Thursday",
            time: "15:00 - 16:30",
            location: "Room A (Gamma Tara)",
            status: "Filling Fast"
        },
        {
            course: "English Conversation (Adults)",
            day: "Wednesday",
            time: "19:00 - 20:30",
            location: "Room B",
            status: "Available"
        },
        {
            course: "Science Club (Primary 3-4)",
            day: "Friday",
            time: "14:00 - 15:30",
            location: "Lab Room",
            status: "Full"
        }
    ] as ScheduleItem[];

    return (
        <section id="schedules" className="py-24 bg-white border-t border-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <span className="text-secondary font-bold tracking-widest uppercase text-xs">Join A Class</span>
                    <h2 className="text-3xl md:text-4xl font-bold font-heading text-slate-900 mt-2">
                        Upcoming Class Schedules
                    </h2>
                    <p className="text-slate-600 mt-4">
                        Find a slot that fits your routine. Data updated in real-time.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {displaySchedules.map((item, index) => (
                        <div key={index} className="bg-slate-50 rounded-xl p-6 border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="font-bold text-lg text-slate-900">{item.course}</h3>
                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${item.status === 'Full' ? 'bg-red-100 text-red-600' :
                                        item.status === 'Filling Fast' ? 'bg-amber-100 text-amber-600' :
                                            'bg-green-100 text-green-600'
                                    }`}>
                                    {item.status}
                                </span>
                            </div>

                            <div className="space-y-3 text-sm text-slate-600">
                                <div className="flex items-center gap-3">
                                    <Calendar className="w-4 h-4 text-primary" />
                                    <span>{item.day}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Clock className="w-4 h-4 text-primary" />
                                    <span>{item.time}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <MapPin className="w-4 h-4 text-primary" />
                                    <span>{item.location}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
