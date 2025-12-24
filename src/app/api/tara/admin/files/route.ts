
import { NextResponse } from "next/server";
import { listDriveFiles } from "@/lib/tara-content";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);

    // Simple Admin Check (Assuming role 'admin' or approved user)
    // For now, allow logged in users as this is an internal tool for the owner
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get("folderId") || undefined;
    const query = searchParams.get("query") || undefined;

    try {
        const files = await listDriveFiles(folderId, query);
        return NextResponse.json({ success: true, files });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
