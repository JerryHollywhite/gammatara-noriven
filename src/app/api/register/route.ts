import { NextResponse } from "next/server";
import { createUser, getUserByEmail } from "@/lib/drive-db";
import bcrypt from "bcryptjs";

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

        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            return NextResponse.json({ error: "Email already registered" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await createUser({
            name,
            email,
            passwordHash: hashedPassword,
            role,
            phone: phone || "-"
        });

        // Trigger Telegram Bot
        await sendTelegramNotification({ name, email, role, phone });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
