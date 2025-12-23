
import { NextResponse } from 'next/server';
import { sendTelegramMessage } from '@/lib/telegram';
import { sendContactEmail } from '@/lib/email';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { from_name, grade, parent_name, phone, program, message } = body;

        // Validation
        if (!from_name || !phone) {
            return NextResponse.json(
                { error: 'Name and Phone are required.' },
                { status: 400 }
            );
        }

        const data = {
            name: from_name,
            grade,
            parentName: parent_name,
            phone,
            program,
            message
        };

        // 1. Send Telegram Notification (Critical Priority)
        const telegramMessage = `
<b>🔔 New Inquiry Received</b>

👤 <b>Name:</b> ${from_name}
🎓 <b>Grade:</b> ${grade || '-'}
👨‍👩‍👧 <b>Parent:</b> ${parent_name || '-'}
📱 <b>Phone:</b> ${phone}
📚 <b>Program:</b> ${program || '-'}

💬 <b>Message:</b>
${message || 'No additional message.'}
        `.trim();

        const telegramSuccess = await sendTelegramMessage(telegramMessage);

        // 2. Send Email Notification (Secondary Priority)
        // We don't block the response on email failure, but we log it.
        const emailSuccess = await sendContactEmail(data);

        if (!telegramSuccess && !emailSuccess) {
            console.error("Both Telegram and Email notifications failed.");
            return NextResponse.json(
                { error: 'Failed to send notification.' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, telegram: telegramSuccess, email: emailSuccess });

    } catch (error) {
        console.error('Error in contact API:', error);
        return NextResponse.json(
            { error: 'Internal server error.' },
            { status: 500 }
        );
    }
}
