import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: invoiceId } = await params;

    try {
        // 1. Update Invoice Status
        const updatedInvoice = await prisma.invoice.update({
            where: { id: invoiceId },
            data: { status: 'PAID' }
        });

        // 2. Update Payment Verification (if exists)
        // We might want to find the payment associated with this invoice
        await prisma.payment.updateMany({
            where: { invoiceId },
            data: {
                verifiedBy: session.user.id,
                verifiedAt: new Date()
            }
        });

        return NextResponse.json({ success: true, invoice: updatedInvoice });
    } catch (error) {
        console.error("Verify Payment Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
