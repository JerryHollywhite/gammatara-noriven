import { NextResponse } from "next/server";
import { resetPassword, getUserByToken } from "@/lib/drive-db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { token, password } = await req.json();

        if (!token || !password) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        // Verify Token
        const user = await getUserByToken(token);
        if (!user) {
            return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
        }

        // Hash new password
        const passwordHash = await bcrypt.hash(password, 10);

        // Update DB
        const success = await resetPassword(token, passwordHash);

        if (!success) {
            return NextResponse.json({ error: "Failed to update password" }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: "Password updated" });
    } catch (error) {
        console.error("Reset Password Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
