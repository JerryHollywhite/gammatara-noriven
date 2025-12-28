
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding Assignment for Debug Teacher...')

    // 1. Get Teacher
    const user = await prisma.user.findUnique({
        where: { email: 'debug-teacher@example.com' },
        include: { teacherProfile: true }
    })

    if (!user?.teacherProfile) throw new Error("Teacher not found");
    const teacherId = user.teacherProfile.id;

    // 2. Create Class (if not exists)
    let classGroup = await prisma.classGroup.findFirst({
        where: { teacherId }
    })

    if (!classGroup) {
        // Need program first
        const program = await prisma.program.findFirst();
        if (!program) throw new Error("No program found");

        classGroup = await prisma.classGroup.create({
            data: {
                name: "Debug Class 101",
                teacherId,
                programId: program.id
            }
        })
        console.log("Created Class:", classGroup.name);
    }

    // 3. Create Assignments
    // A. Full Assignment
    await prisma.assignment.create({
        data: {
            title: "Full Assignment",
            description: "Detailed description",
            dueDate: new Date(Date.now() + 86400000), // Tomorrow
            maxScore: 100,
            attachmentUrl: "https://example.com",
            teacherId,
            classId: classGroup.id
        }
    })

    // B. Minimal Assignment (Null fields)
    await prisma.assignment.create({
        data: {
            title: "Minimal Assignment",
            description: null,
            dueDate: null,
            maxScore: 100,
            attachmentUrl: null,
            teacherId,
            classId: classGroup.id
        }
    })

    // C. Past Due Assignment
    await prisma.assignment.create({
        data: {
            title: "Past Due Assignment",
            description: "This was due yesterday",
            dueDate: new Date(Date.now() - 86400000), // Yesterday
            maxScore: 50,
            teacherId,
            classId: classGroup.id
        }
    })

    console.log("Assignments seeded.");
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
