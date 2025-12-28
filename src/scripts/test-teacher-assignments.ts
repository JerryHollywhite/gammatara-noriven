
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Testing Teacher Assignments...')

    // 1. Fetch User
    const user = await prisma.user.findUnique({
        where: { email: 'debug-teacher@example.com' },
        include: { teacherProfile: true }
    })

    if (!user || !user.teacherProfile) {
        console.error('Debug Teacher not found');
        return;
    }

    console.log('Teacher ID:', user.teacherProfile.id)

    // 2. Mock API Logic
    try {
        const assignments = await prisma.assignment.findMany({
            where: { teacherId: user.teacherProfile.id },
            include: {
                class: {
                    select: {
                        id: true,
                        name: true,
                        students: {
                            select: { id: true }
                        }
                    }
                },
                submissions: {
                    select: {
                        id: true,
                        grade: true,
                        submittedAt: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        console.log(`Found ${assignments.length} assignments`);

        // Format
        const formattedAssignments = assignments.map(assignment => ({
            id: assignment.id,
            title: assignment.title,
            class: {
                id: assignment.class.id,
                name: assignment.class.name,
                studentCount: assignment.class.students.length
            },
            stats: {
                totalStudents: assignment.class.students.length,
                submitted: assignment.submissions.length,
                graded: assignment.submissions.filter(s => s.grade !== null).length
            }
        }));

        console.log(JSON.stringify(formattedAssignments, null, 2));

    } catch (e) {
        console.error('API Error:', e)
    }
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
