import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🔍 Checking teacher1@gmail.com in database...\n')

    const user = await prisma.user.findUnique({
        where: { email: 'teacher1@gmail.com' },
        include: {
            teacherProfile: true
        }
    })

    if (!user) {
        console.log('❌ User NOT FOUND in database!')
        console.log('Need to create user first.')
        return
    }

    console.log('✅ User found!')
    console.log('User ID:', user.id)
    console.log('Name:', user.name)
    console.log('Email:', user.email)
    console.log('Role:', user.role)
    console.log('Has teacherProfile:', !!user.teacherProfile)

    if (user.teacherProfile) {
        console.log('\nTeacher Profile:')
        console.log('- ID:', user.teacherProfile.id)
        console.log('- Specialty:', user.teacherProfile.specialty)
    } else {
        console.log('\n⚠️  No teacherProfile found - this is OK, dashboard should show empty state')
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
