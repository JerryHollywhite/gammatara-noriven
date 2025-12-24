
import { NextResponse } from "next/server";
import { getStudentProfile } from "@/lib/data-service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    if (userRole !== "STUDENT") {
        return NextResponse.json({ error: "Forbidden - Student access only" }, { status: 403 });
    }

    const userId = (session.user as any).id;
    const data = await getStudentProfile(userId);

    if (!data) {
        return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
}
