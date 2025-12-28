
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const email = 'debug-teacher@example.com'
    const password = 'password123'

    console.log(`Setting password for ${email}...`)

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.update({
        where: { email },
        data: { password: hashedPassword }
    })

    console.log(`Password set for user: ${user.name} (${user.id})`)
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
