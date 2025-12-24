
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { deleteUser as deleteSheetUser } from "@/lib/drive-db";

export async function DELETE(
    req: Request,
    // Context needs to be awaited in Next.js 15+ but this is 14/15 compatible structure
    // Actually in Next.js 15 params is async.
    // Let's use the standard Next.js route handler signature
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    if (userRole !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden - Owner access only" }, { status: 403 });
    }

    // In Next 15, params is a Promise. We should await it.
    // But since the project is on 16.1.0 (Canary/Latest), it definitely uses async params.
    const { id } = await params;

    if (!id) {
        return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    try {
        // 1. Find user to get Email (needed for Sheet deletion)
        const user = await prisma.user.findUnique({
            where: { id }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Prevent deleting self
        if (user.email === session.user.email) {
            return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
        }

        // 2. Delete from Google Sheet
        // We do this first or parallel. If it fails, we might still want to delete from DB?
        // Let's try to delete from Sheet, log error if fails, but proceed to delete from DB as that's critical.
        if (user.email) {
            try {
                await deleteSheetUser(user.email);
            } catch (sheetError) {
                console.error("Failed to delete user from Sheet:", sheetError);
            }
        }

        // 3. Delete from Prisma
        await prisma.user.delete({
            where: { id }
        });

        return NextResponse.json({ success: true, message: "User deleted successfully" });

    } catch (error) {
        console.error("Delete user error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
