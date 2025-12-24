
import { NextResponse } from "next/server";
import { getUserByEmail } from "@/lib/drive-db";
import bcrypt from "bcryptjs";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        console.log("Debug: Checking Connection...");

        // 1. Env Check
        const sheetId = process.env.GOOGLE_SHEET_ID_ROLE_ACCESS || "";
        const envCheck = {
            SHEET_ID_PARTIAL: sheetId.substring(0, 5) + "...",
            EMAIL: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ? "Present" : "Missing",
            NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "Present (Length: " + process.env.NEXTAUTH_SECRET.length + ")" : "Missing",
            NEXTAUTH_URL: process.env.NEXTAUTH_URL || "Not Set",
            VERCEL_URL: process.env.VERCEL_URL || "Not Set",
            // Check for hidden characters or whitespace in the secret
            SECRET_CHECK: process.env.NEXTAUTH_SECRET ? `Length: ${process.env.NEXTAUTH_SECRET.length}, Start: ${process.env.NEXTAUTH_SECRET.substring(0, 2)}, End: ${process.env.NEXTAUTH_SECRET.slice(-2)}` : "Missing",
        };

        // 2. Fetch user
        const user = await getUserByEmail('jerryhollywhite@gmail.com');

        // 3. Test Compare
        let passwordCheck = "N/A";
        if (user) {
            const isValid = await bcrypt.compare("Demo123", user.passwordHash);
            passwordCheck = isValid ? "MATCHES" : "FAILED";
        }

        return NextResponse.json({
            status: "OK",
            env: envCheck,
            userFound: !!user,
            userEmail: user?.email,
            userStatus: user?.status,
            passwordCheck: passwordCheck,
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        return NextResponse.json({
            status: "ERROR",
            message: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
