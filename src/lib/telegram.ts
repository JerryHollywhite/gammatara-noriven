
/**
 * Sends a message to the configured Telegram chat.
 * @param message The text message to send.
 * @returns boolean indicating success or failure.
 */
export async function sendTelegramMessage(message: string): Promise<boolean> {
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
        console.error("❌ Telegram credentials are not configured.");
        console.log("Debug: TELEGRAM_BOT_TOKEN:", TELEGRAM_BOT_TOKEN ? "Set" : "Missing");
        console.log("Debug: TELEGRAM_CHAT_ID:", TELEGRAM_CHAT_ID ? "Set" : "Missing");
        return false;
    }

    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    try {
        console.log(`📤 Sending Telegram message to ${TELEGRAM_CHAT_ID}...`);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'HTML',
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("❌ Telegram API Error:", errorData);
            return false;
        }

        console.log("✅ Telegram message sent successfully.");
        return true;
    } catch (error) {
        console.error("❌ Failed to send Telegram message:", error);
        return false;
    }
}
