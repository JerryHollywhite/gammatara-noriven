
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Start seeding...')

    // 1. Programs
    const programs = [
        { code: 'TK', name: 'TK (Kindergarten)', description: 'Early childhood education' },
        { code: 'SD', name: 'SD (Elementary)', description: 'Grades 1-6' },
        { code: 'SMP', name: 'SMP (Junior High)', description: 'Grades 7-9' },
        { code: 'SMA', name: 'SMA (Senior High)', description: 'Grades 10-12' },
        { code: 'ADULT', name: 'Adult Learners', description: 'Professional skills & languages' },
    ]

    for (const p of programs) {
        const program = await prisma.program.upsert({
            where: { code: p.code },
            update: {},
            create: p,
        })
        console.log(`Upserted Program: ${program.name}`)
    }

    // 2. Subjects (Sample/Initial)
    // Fetch IDs
    const tk = await prisma.program.findUnique({ where: { code: 'TK' } })
    const sd = await prisma.program.findUnique({ where: { code: 'SD' } })
    const smp = await prisma.program.findUnique({ where: { code: 'SMP' } })
    const sma = await prisma.program.findUnique({ where: { code: 'SMA' } })

    const subjects = []

    if (tk) {
        subjects.push(
            { code: 'CALISTUNG', name: 'Calistung (Reading/Math)', programId: tk.id },
            { code: 'ADAB_KARAKTER', name: 'Adab & Karakter', programId: tk.id }
        )
    }

    if (sd) {
        subjects.push(
            { code: 'MATH_SD_1', name: 'Mathematics Grade 1', programId: sd.id },
            { code: 'ENGLISH_SD_1', name: 'English Grade 1', programId: sd.id }
        )
    }

    for (const s of subjects) {
        // Check if exists first to avoid unique constraint error if we change names
        const subject = await prisma.subject.upsert({
            where: { code: s.code },
            update: {},
            create: {
                code: s.code,
                name: s.name,
                programId: s.programId
            }
        })
        console.log(`Upserted Subject: ${subject.name}`)
    }

    console.log('Seeding finished.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
