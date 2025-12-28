import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Creating demo users...')

    // Hash password
    const hashedPassword = await bcrypt.hash('Demo123', 10)

    // 1. Create Student User
    const student = await prisma.user.upsert({
        where: { email: 'student1@gmail.com' },
        update: {},
        create: {
            email: 'student1@gmail.com',
            name: 'Student1',
            password: hashedPassword,
            role: 'STUDENT',
            studentProfile: {
                create: {
                    gradeLevel: 'Grade 10',
                    xp: 0,
                    level: 1,
                    streakDays: 0
                }
            }
        }
    })
    console.log('✅ Created student:', student.email)

    // 2. Create Teacher User
    const teacher = await prisma.user.upsert({
        where: { email: 'teacher1@gmail.com' },
        update: {},
        create: {
            email: 'teacher1@gmail.com',
            name: 'Teacher Jerry',
            password: hashedPassword,
            role: 'TEACHER',
            teacherProfile: {
                create: {
                    subject: 'Mathematics',
                    bio: 'Experienced math teacher'
                }
            }
        }
    })
    console.log('✅ Created teacher:', teacher.email)

    console.log('🎉 Demo users created successfully!')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error('❌ Error:', e)
        await prisma.$disconnect()
        process.exit(1)
    })
