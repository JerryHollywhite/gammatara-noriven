import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadPaymentProof } from "@/lib/drive-upload";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "PARENT") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const invoiceId = formData.get('invoiceId') as string;

    if (!file || !invoiceId) {
        return NextResponse.json({ error: "Missing file or invoice ID" }, { status: 400 });
    }

    try {
        // Verify Invoice ownership
        const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: { student: { include: { user: true, parent: true } } }
        });

        if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

        // Ensure student belongs to this parent
        // Note: Relation is student -> parent.
        const parentUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { parentProfile: true }
        });

        if (invoice.student.parentId !== parentUser?.parentProfile?.id) {
            return NextResponse.json({ error: "Unauthorized for this invoice" }, { status: 403 });
        }

        // Upload to Drive
        const upload = await uploadPaymentProof(
            file,
            file.name,
            file.type,
            invoice.student.user.name || "Unknown Student"
        );

        if (!upload) {
            return NextResponse.json({ error: "Upload failed" }, { status: 500 });
        }

        // Create Payment Record and Update Invoice
        await prisma.payment.create({
            data: {
                invoiceId,
                amountPaid: invoice.amount, // Assume full payment
                method: 'MANUAL_TRANSFER',
                proofUrl: upload.webViewLink
            }
        });

        await prisma.invoice.update({
            where: { id: invoiceId },
            data: { status: 'PENDING' }
        });

        return NextResponse.json({ success: true, message: "Proof uploaded, pending verification" });

    } catch (error: any) {
        console.error("Upload Proof Error:", error);
        return NextResponse.json({ error: error.message || "Server Error" }, { status: 500 });
    }
}
