import { NextResponse } from "next/server";
import { getUserByEmail, setResetToken } from "@/lib/drive-db";
import { sendResetEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(req: Request) {
    try {
        const json = await req.json();
        const email = json.email?.toLowerCase();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        const user = await getUserByEmail(email);
        if (!user) {
            // Return success even if user not found to prevent enumeration
            // But for debugging now, let's just return success.
            return NextResponse.json({ success: true, message: "If email exists, link sent." });
        }

        if (user.status !== "Approved") {
            // Optional: Decide if we want to tell them or just silent fail
            return NextResponse.json({ error: "Account not active" }, { status: 400 });
        }

        // Generate Token
        const token = crypto.randomBytes(32).toString("hex");

        // Save Token to Sheet
        const saved = await setResetToken(email, token);
        if (!saved) {
            console.error("Failed to save reset token to DB");
            return NextResponse.json({ error: "Database error" }, { status: 500 });
        }

        // Send Email
        const emailSent = await sendResetEmail(email, token);

        if (!emailSent) {
            console.error("Failed to send email via SMTP");
            // We still return success to avoiding leaking info, but we log securely
            // Or we could return error if we want user to retry immediately
        }

        return NextResponse.json({ success: true, message: "Reset link sent" });
    } catch (error) {
        console.error("Forgot Password Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
