
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const students = await prisma.user.findMany({
        where: { role: 'STUDENT' },
        select: { id: true, name: true, email: true }
    });

    console.log(`Total Students Found: ${students.length}`);
    console.log("---------------------------------------------------");
    students.forEach((s, i) => {
        console.log(`${i + 1}. ${s.name} (${s.email}) - ID: ${s.id}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
