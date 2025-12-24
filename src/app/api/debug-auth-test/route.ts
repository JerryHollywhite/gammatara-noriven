
import { NextResponse } from "next/server";
import { getUserByEmail } from "@/lib/drive-db";
import bcrypt from "bcryptjs";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const credentials = await req.json();
        console.log("[DebugAuth] Received:", JSON.stringify(credentials));

        const email = credentials?.email;
        const password = credentials?.password;
        const logs = [];

        logs.push(`Checking email: ${email}`);

        // 1. MOCK CHECK
        if (email === 'jerryhollywhite@gmail.com' && password === 'Demo123') {
            logs.push("MOCK MATCHED!");
            return NextResponse.json({
                status: "SUCCESS - MOCK",
                logs,
                user: {
                    id: 'jerryhollywhite@gmail.com',
                    name: 'Jerry Hollywhite',
                    email: 'jerryhollywhite@gmail.com',
                    role: 'Student'
                }
            });
        }
        logs.push("Mock did not match");

        // 2. DB CHECK
        if (!email || !password) {
            return NextResponse.json({ status: "FAIL - MISSING INPUT", logs }, { status: 400 });
        }

        const cleanEmail = email.trim().toLowerCase();
        logs.push(`Searching DB for: ${cleanEmail}`);

        const user = await getUserByEmail(cleanEmail);

        if (!user) {
            logs.push("User not found in DB");
            return NextResponse.json({ status: "FAIL - USER NOT FOUND", logs }, { status: 404 });
        }
        logs.push(`User found: ${user.email}, Status: ${user.status}`);

        // 3. BCRYPT CHECK
        const isValid = await bcrypt.compare(password, user.passwordHash);
        logs.push(`Bcrypt result: ${isValid}`);

        if (!isValid) {
            return NextResponse.json({ status: "FAIL - INVALID PASSWORD", logs }, { status: 401 });
        }

        if (user.status !== "Approved") {
            logs.push(`Status rejected: ${user.status}`);
            return NextResponse.json({ status: "FAIL - STATUS REJECTED", logs }, { status: 403 });
        }

        return NextResponse.json({
            status: "SUCCESS - REAL DB",
            logs,
            user: {
                id: user.email,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error: any) {
        return NextResponse.json({
            status: "ERROR",
            message: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
