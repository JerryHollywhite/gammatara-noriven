import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createUser as createSheetUser } from "@/lib/drive-db";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;

async function sendTelegramNotification(user: any) {
    if (!BOT_TOKEN || !CHAT_ID) return;

    const message = `
🆕 <b>New Registration Request</b>

👤 <b>Name:</b> ${user.name}
📧 <b>Email:</b> ${user.email}
🎓 <b>Role:</b> ${user.role}
📱 <b>Phone:</b> ${user.phone}

<i>Please approve or reject this request.</i>
    `.trim();

    const keyboard = {
        inline_keyboard: [
            [
                { text: "✅ Approve", callback_data: `approve:${user.email}` },
                { text: "❌ Reject", callback_data: `reject:${user.email}` }
            ]
        ]
    };

    try {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: message,
                parse_mode: 'HTML',
                reply_markup: keyboard
            })
        });
    } catch (e) {
        console.error("Failed to send Telegram notification:", e);
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, password, role, phone } = body;
        const email = body.email?.toLowerCase();

        if (!name || !email || !password || !role) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return NextResponse.json({ error: "Email already registered" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Validate role
        const validRoles = Object.values(UserRole);
        const userRole = validRoles.includes(role) ? role : UserRole.STUDENT;

        // 1. Create in Postgres (Prisma)
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: userRole,
            }
        });

        // 2. Create Profile based on role (Initial empty profile)
        if (userRole === UserRole.STUDENT) {
            await prisma.studentProfile.create({
                data: {
                    userId: newUser.id,
                    gradeLevel: "Not Set"
                }
            });
        } else if (userRole === UserRole.TEACHER) {
            await prisma.teacherProfile.create({
                data: {
                    userId: newUser.id
                }
            });
        } else if (userRole === UserRole.PARENT) {
            await prisma.parentProfile.create({
                data: {
                    userId: newUser.id
                }
            });
        }

        // 3. Sync to Google Sheet (for Telegram Bot approval flow)
        try {
            await createSheetUser({
                email,
                passwordHash: hashedPassword,
                name,
                role: userRole,
                phone: phone || ''
            });
        } catch (sheetError) {
            console.error("Failed to sync user to Google Sheet:", sheetError);
            // Don't fail the request, just log it. Prisma is the source of truth.
        }

        // 4. Trigger Telegram Bot
        await sendTelegramNotification({ name, email, role: userRole, phone });

        return NextResponse.json({ success: true, user: newUser });

        return NextResponse.json({ success: true, user: newUser });



    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
