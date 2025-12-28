import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🔍 Checking teacher profile details...\n')

    const user = await prisma.user.findUnique({
        where: { email: 'teacher1@gmail.com' },
        include: {
            teacherProfile: {
                include: {
                    classes: {
                        include: {
                            students: true,
                            program: true
                        }
                    },
                    assignments: {
                        include: {
                            submissions: true
                        }
                    }
                }
            }
        }
    })

    if (!user || !user.teacherProfile) {
        console.log('❌ No teacher profile found')
        return
    }

    const profile = user.teacherProfile

    console.log('Teacher Profile ID:', profile.id)
    console.log('Specialty:', profile.specialty)
    console.log('Classes count:', profile.classes.length)
    console.log('Assignments count:', profile.assignments.length)

    if (profile.classes.length > 0) {
        console.log('\nClasses:')
        profile.classes.forEach((cls, i) => {
            console.log(`  ${i + 1}. ${cls.name}`)
            console.log(`     - ID: ${cls.id}`)
            console.log(`     - Program: ${cls.program?.name || 'None'}`)
            console.log(`     - Students: ${cls.students.length}`)
        })
    }

    if (profile.assignments.length > 0) {
        console.log('\nAssignments:')
        profile.assignments.forEach((asg, i) => {
            console.log(`  ${i + 1}. ${asg.title}`)
            console.log(`     - Submissions: ${asg.submissions.length}`)
        })
    }
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error('Error:', e)
        await prisma.$disconnect()
        process.exit(1)
    })
