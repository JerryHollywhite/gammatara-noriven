
import { NextResponse } from "next/server";
import { getAdminAnalytics } from "@/lib/data-service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    if (userRole !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden - Admin access only" }, { status: 403 });
    }

    const data = await getAdminAnalytics();

    if (!data) {
        return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
}
