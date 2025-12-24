import { NextResponse } from "next/server";
import { updateUserStatus, getUserByEmail } from "@/lib/drive-db";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

async function answerCallback(callbackQueryId: string, text: string) {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            callback_query_id: callbackQueryId,
            text: text
        })
    });
}

async function editMessage(chatId: number, messageId: number, text: string) {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/editMessageText`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: chatId,
            message_id: messageId,
            text: text,
            parse_mode: 'HTML'
        })
    });
}

export async function POST(req: Request) {
    const body = await req.json();

    // Handle Callback Query (Button Click)
    if (body.callback_query) {
        const { id, data, message, from } = body.callback_query;
        const chatId = message.chat.id;
        const messageId = message.message_id;

        const [action, email] = data.split(':');

        // Anti-collision: Ensure logic handles redundant clicks? 
        // We will just process it.

        if (action === 'approve') {
            const success = await updateUserStatus(email, 'Approved');
            if (success) {
                await editMessage(chatId, messageId, `✅ <b>Approved</b>\nUser ${email} is now active.\n(Action by ${from.first_name})`);
                await answerCallback(id, "User Approved!");
            } else {
                console.error(`Failed to approve user ${email}`);
                await answerCallback(id, `Failed: Could not update status for ${email}. Check server logs.`);
            }
        } else if (action === 'reject') {
            const success = await updateUserStatus(email, 'Rejected');
            if (success) {
                await editMessage(chatId, messageId, `❌ <b>Rejected</b>\nUser ${email} was denied access.\n(Action by ${from.first_name})`);
                await answerCallback(id, "User Rejected.");
            } else {
                console.error(`Failed to reject user ${email}`);
                await answerCallback(id, `Failed: Could not update status for ${email}. Check server logs.`);
            }
        }

        return NextResponse.json({ status: 'ok' });
    }

    return NextResponse.json({ status: 'ignored' });
}
