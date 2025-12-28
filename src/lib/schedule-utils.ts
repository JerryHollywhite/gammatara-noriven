// Utility functions for class scheduling
// File: src/lib/schedule-utils.ts

import { prisma } from "./prisma";

export interface ScheduleCandidate {
    datetime: Date;
    scheduleId: string;
    type: string;
}

/**
 * Get the next upcoming session for a class
 * Considers recurring schedules, one-time sessions, and exceptions
 */
export async function getNextSession(classId: string): Promise<Date | null> {
    const now = new Date();

    try {
        // 1. Get all recurring schedules
        const recurring = await prisma.classSchedule.findMany({
            where: {
                classId,
                type: 'RECURRING',
                isCancelled: false
            }
        });

        // 2. Get upcoming one-time and exceptions (next 30 days)
        const thirtyDaysFromNow = new Date(now);
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        const upcoming = await prisma.classSchedule.findMany({
            where: {
                classId,
                type: { in: ['ONE_TIME', 'EXCEPTION'] },
                date: {
                    gte: now,
                    lte: thirtyDaysFromNow
                }
            }
        });

        // 3. Generate candidates from recurring schedules
        const candidates: ScheduleCandidate[] = [];

        for (let i = 0; i < 30; i++) {
            const checkDate = new Date(now);
            checkDate.setDate(checkDate.getDate() + i);

            // getDay() returns 0-6 (Sun-Sat), we use 1-7 (Mon-Sun)
            const dayOfWeek = checkDate.getDay() === 0 ? 7 : checkDate.getDay();

            // Find matching recurring schedules
            const matchingSchedules = recurring.filter(s => s.dayOfWeek === dayOfWeek);

            for (const schedule of matchingSchedules) {
                const sessionDateTime = combineDateAndTime(checkDate, schedule.startTime);

                // Skip if session already passed
                if (sessionDateTime <= now) continue;

                // Check if cancelled by exception
                const exception = upcoming.find(e =>
                    e.type === 'EXCEPTION' &&
                    e.overridesId === schedule.id &&
                    e.date &&
                    isSameDay(e.date, checkDate) &&
                    e.isCancelled
                );

                if (!exception) {
                    candidates.push({
                        datetime: sessionDateTime,
                        scheduleId: schedule.id,
                        type: 'RECURRING'
                    });
                }
            }
        }

        // 4. Add one-time sessions
        upcoming
            .filter(s => s.type === 'ONE_TIME' && s.date)
            .forEach(s => {
                const sessionDateTime = combineDateAndTime(s.date!, s.startTime);
                if (sessionDateTime > now) {
                    candidates.push({
                        datetime: sessionDateTime,
                        scheduleId: s.id,
                        type: 'ONE_TIME'
                    });
                }
            });

        // 5. Sort and return earliest
        if (candidates.length === 0) return null;

        candidates.sort((a, b) => a.datetime.getTime() - b.datetime.getTime());
        return candidates[0].datetime;

    } catch (error) {
        console.error("Error calculating next session:", error);
        return null;
    }
}

/**
 * Combine date and time string (HH:mm) into a single Date object
 */
export function combineDateAndTime(date: Date, timeString: string): Date {
    const [hours, minutes] = timeString.split(':').map(Number);
    const result = new Date(date);
    result.setHours(hours, minutes, 0, 0);
    return result;
}

/**
 * Check if two dates are the same calendar day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate();
}

/**
 * Format next session for display
 * Returns: { day: "Mon", time: "10:00 AM", date: "(Dec 30)" }
 */
export function formatNextSession(datetime: Date | null): {
    day: string;
    time: string;
    date: string;
} | null {
    if (!datetime) return null;

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const day = days[datetime.getDay()];
    const month = months[datetime.getMonth()];
    const dateNum = datetime.getDate();

    // Format time to 12-hour with AM/PM
    let hours = datetime.getHours();
    const minutes = datetime.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;

    const time = `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    const date = `(${month} ${dateNum})`;

    return { day, time, date };
}

/**
 * Get upcoming sessions for display (next 14 days)
 */
export async function getUpcomingSessions(classId: string, days: number = 14): Promise<Array<{
    datetime: Date;
    scheduleId: string;
    type: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
}>> {
    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + days);

    const recurring = await prisma.classSchedule.findMany({
        where: {
            classId,
            type: 'RECURRING',
            isCancelled: false
        }
    });

    const upcoming = await prisma.classSchedule.findMany({
        where: {
            classId,
            type: { in: ['ONE_TIME', 'EXCEPTION'] },
            date: { gte: now, lte: endDate }
        }
    });

    const sessions: Array<any> = [];

    // Generate from recurring
    for (let i = 0; i < days; i++) {
        const checkDate = new Date(now);
        checkDate.setDate(checkDate.getDate() + i);
        const dayOfWeek = checkDate.getDay() === 0 ? 7 : checkDate.getDay();

        const matchingSchedules = recurring.filter(s => s.dayOfWeek === dayOfWeek);

        for (const schedule of matchingSchedules) {
            const sessionDateTime = combineDateAndTime(checkDate, schedule.startTime);

            if (sessionDateTime <= now) continue;

            const exception = upcoming.find(e =>
                e.type === 'EXCEPTION' &&
                e.overridesId === schedule.id &&
                e.date &&
                isSameDay(e.date, checkDate)
            );

            if (!exception || !exception.isCancelled) {
                sessions.push({
                    datetime: sessionDateTime,
                    scheduleId: schedule.id,
                    type: 'RECURRING',
                    dayOfWeek: schedule.dayOfWeek,
                    startTime: schedule.startTime,
                    endTime: schedule.endTime
                });
            }
        }
    }

    // Add one-time
    upcoming
        .filter(s => s.type === 'ONE_TIME' && s.date)
        .forEach(s => {
            const sessionDateTime = combineDateAndTime(s.date!, s.startTime);
            if (sessionDateTime > now) {
                sessions.push({
                    datetime: sessionDateTime,
                    scheduleId: s.id,
                    type: 'ONE_TIME',
                    dayOfWeek: s.date!.getDay() === 0 ? 7 : s.date!.getDay(),
                    startTime: s.startTime,
                    endTime: s.endTime
                });
            }
        });

    sessions.sort((a, b) => a.datetime.getTime() - b.datetime.getTime());
    return sessions;
}
