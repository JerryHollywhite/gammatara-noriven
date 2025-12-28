
import { PrismaClient } from '@prisma/client'
import { getTeacherDashboardData } from '../lib/data-service'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding Debug Teacher...')

    // 1. Create User
    const user = await prisma.user.upsert({
        where: { email: 'debug-teacher@example.com' },
        update: {},
        create: {
            name: "Debug Teacher",
            email: "debug-teacher@example.com",
            role: "TEACHER",
            image: "https://api.dicebear.com/7.x/avataaars/svg?seed=DebugTeacher"
        }
    })
    console.log('User created:', user.id)

    // 2. Create Profile
    const profile = await prisma.teacherProfile.upsert({
        where: { userId: user.id },
        update: {},
        create: {
            userId: user.id,
            specialty: "Mathematics"
        }
    })
    console.log('Profile created:', profile.id)

    // 3. Test Dashboard Data Fetch
    console.log('Fetching Dashboard Data...')
    try {
        const data = await getTeacherDashboardData(user.id)
        console.log('Dashboard Data Success!')
        console.log(JSON.stringify(data, null, 2))
    } catch (e) {
        console.error('SERVER ERROR fetching dashboard:', e)
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
