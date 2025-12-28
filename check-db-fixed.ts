import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabase() {
    console.log('=== Database Check for Forum Access ===\n');

    // 1. Check the target class
    console.log('🎯 Checking class: clrough8t00th2k0btkvg6kq');
    const targetClass = await prisma.classGroup.findUnique({
        where: { id: 'clrough8t00th2k0btkvg6kq' },
        include: {
            teacher: {
                include: {
                    user: true
                }
            },
            students: {
                include: {
                    student: {
                        include: {
                            user: true
                        }
                    }
                }
            }
        }
    });

    if (!targetClass) {
        console.log('❌ CLASS NOT FOUND IN DATABASE!');
        console.log('This class ID does not exist.\n');
    } else {
        console.log('✅ Class found:', targetClass.name);
        console.log('Teacher:', targetClass.teacher.user.name, `(${targetClass.teacher.user.email})`);
        console.log('Teacher User ID:', targetClass.teacher.user.id);
        console.log(`\nEnrolled Students: ${targetClass.students.length}`);
        targetClass.students.forEach(enrollment => {
            console.log(`  - ${enrollment.student.user.name} (${enrollment.student.user.email})`);
            console.log(`    User ID: ${enrollment.student.user.id}`);
        });
    }

    // 2. List ALL classes
    console.log('\n\n📚 ALL CLASSES IN DATABASE:');
    const allClasses = await prisma.classGroup.findMany({
        include: {
            teacher: {
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true
                        }
                    }
                }
            },
            students: {
                select: {
                    id: true
                }
            }
        }
    });

    allClasses.forEach(cls => {
        console.log(`\n📖 ${cls.name} (ID: ${cls.id})`);
        console.log(`   Teacher: ${cls.teacher.user.name} (${cls.teacher.user.email})`);
        console.log(`   Students enrolled: ${cls.students.length}`);
    });

    // 3. Check current logged in users (who might be testing)
    console.log('\n\n👥 ALL USERS:');
    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            name: true,
            role: true
        },
        orderBy: {
            role: 'asc'
        }
    });

    users.forEach(user => {
        console.log(`${user.role}: ${user.name} (${user.email}) - ID: ${user.id}`);
    });

    console.log('\n\n💡 RECOMMENDATION:');
    if (!targetClass) {
        console.log('The class ID "clrough8t00th2k0btkvg6kq" does not exist.');
        console.log('Please use one of the class IDs listed above for testing.');
        console.log('\nFor example:');
        if (allClasses.length > 0) {
            const firstClass = allClasses[0];
            console.log(`  Teacher forum URL: /teacher/forum/${firstClass.id}`);
            console.log(`  Student forum URL: /student/forum/${firstClass.id}`);
        }
    } else {
        console.log('Class exists. The 403 error might be because:');
        console.log('1. Logged in user is not the teacher of this class');
        console.log('2. Logged in user is not enrolled as student in this class');
        console.log('\nPlease verify which user is currently logged in and check their access.');
    }
}

checkDatabase()
    .then(() => {
        console.log('\n✅ Check complete');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Error:', error);
        process.exit(1);
    });
