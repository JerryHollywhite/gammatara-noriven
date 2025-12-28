
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');

    if (secret !== 'seed-2024') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const programs = [
            { code: 'TK', name: 'TK (Kindergarten)', description: 'Early childhood education' },
            { code: 'SD', name: 'SD (Elementary)', description: 'Grades 1-6' },
            { code: 'SMP', name: 'SMP (Junior High)', description: 'Grades 7-9' },
            { code: 'SMA', name: 'SMA (Senior High)', description: 'Grades 10-12' },
            { code: 'ADULT', name: 'Adult Learners', description: 'Professional skills & languages' },
        ];

        const results = [];

        for (const p of programs) {
            const program = await prisma.program.upsert({
                where: { code: p.code },
                update: {},
                create: p,
            });
            results.push(program);
        }

        return NextResponse.json({ success: true, seeded: results });

    } catch (error) {
        return NextResponse.json({
            error: "Seeding failed",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
