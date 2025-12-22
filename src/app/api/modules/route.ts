import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getModulesForUser } from "@/lib/drive-db";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const email = session.user.email;
        // Cast role to string, it might be missing in type definition if strict but we added it.
        const role = (session.user as any).role || "Student";

        const modules = await getModulesForUser(email, role);

        return NextResponse.json({ modules });

    } catch (error) {
        console.error("Modules API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
