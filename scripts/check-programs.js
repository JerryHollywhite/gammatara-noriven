const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const programs = await prisma.program.findMany();
    console.log('Programs:', JSON.stringify(programs, null, 2));
  } catch(e) {
    console.error(e);
  }
}

main()
  .finally(async () => await prisma.$disconnect());
