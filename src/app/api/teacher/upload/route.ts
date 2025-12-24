import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { uploadTeacherFile } from "@/lib/drive-upload";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const teacherName = session.user.name || "Unknown Teacher";
        const result = await uploadTeacherFile(file, file.name, file.type, teacherName);

        if (!result) {
            return NextResponse.json({ error: "Upload failed" }, { status: 500 });
        }

        return NextResponse.json({ success: true, file: result });

    } catch (error: any) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
