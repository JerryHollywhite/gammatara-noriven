
import { NextResponse } from "next/server";
import { getAdminAnalytics } from "@/lib/data-service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    // Fetch latest profile info
    const userId = (session.user as any).id;
    let user = null;
    try {
        user = await prisma.user.findUnique({
            where: { id: userId },
            select: { phone: true, email: true, name: true, image: true } as any
        });
    } catch (e) {
        console.log("Failed to fetch user profile:", e);
    }

    if (!data) {
        return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
    }

    return NextResponse.json({
        success: true,
        data: {
            ...data,
            profile: {
                name: user?.name,
                email: user?.email,
                phone: user?.phone,
                image: user?.image
            }
        }
    });
}
