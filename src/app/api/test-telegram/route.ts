
import { NextResponse } from 'next/server';
import { sendTelegramMessage } from '@/lib/telegram';

export const dynamic = 'force-dynamic'; // Ensure this doesn't get cached at build time

export async function GET(request: Request) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    const envCheck = {
        hasToken: !!token,
        tokenLength: token?.length || 0,
        hasChatId: !!chatId,
        chatIdValue: chatId // Safe to show if it's just the ID
    };

    if (!token || !chatId) {
        return NextResponse.json({
            status: "error",
            message: "Missing Environment Variables",
            envCheck
        }, { status: 500 });
    }

    try {
        const success = await sendTelegramMessage("🧪 **Test Message** from Vercel Deployment.\nIf you see this, the bot is working!");

        if (success) {
            return NextResponse.json({
                status: "success",
                message: "Message sent to Telegram!",
                envCheck
            });
        } else {
            return NextResponse.json({
                status: "error",
                message: "Function returned false (Check Vercel Logs)",
                envCheck
            }, { status: 500 });
        }

    } catch (error) {
        return NextResponse.json({
            status: "error",
            message: "Exception occurred",
            error: String(error),
            envCheck
        }, { status: 500 });
    }
}
