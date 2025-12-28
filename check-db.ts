import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabase() {
    console.log('=== Checking Database for Forum Access Issues ===\n');

    // 1. Check all teachers and their classes
    const teachers = await prisma.teacherProfile.findMany({
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true
                }
            },
            classes: {
                select: {
                    id: true,
                    name: true,
                }
            }
        }
    });

    console.log('📚 TEACHERS AND THEIR CLASSES:');
    teachers.forEach(teacher => {
        console.log(`\nTeacher: ${teacher.user.name} (${teacher.user.email})`);
        console.log(`  User ID: ${teacher.user.id}`);
        console.log(`  Classes:`);
        teacher.classes.forEach(cls => {
            console.log(`    - ${cls.name} - ID: ${cls.id}`);
        });
        if (teacher.classes.length === 0) {
            console.log(`    No classes assigned`);
        }
    });

    // 2. Check the specific class we're testing
    const targetClass = await prisma.classGroup.findUnique({
        where: { id: 'clrough8t00th2k0btkvg6kq' },
        include: {
            teacher: {
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            name: true
                        }
                    }
                }
            },
            enrollments: {
                include: {
                    student: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    email: true,
                                    name: true
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    console.log('\n\n🎯 TARGET CLASS (clrough8t00th2k0btkvg6kq):');
    if (targetClass) {
        console.log(`Name: ${targetClass.name}`);
        console.log(`Teacher: ${targetClass.teacher?.user.name} (${targetClass.teacher?.user.email})`);
        console.log(`Teacher ID: ${targetClass.teacher?.user.id}`);
        console.log(`\nEnrolled Students (${targetClass.enrollments.length}):`);
        targetClass.enrollments.forEach(enrollment => {
            console.log(`  - ${enrollment.student.user.name} (${enrollment.student.user.email})`);
            console.log(`    Student User ID: ${enrollment.student.user.id}`);
        });
    } else {
        console.log('❌ CLASS NOT FOUND!');
    }

    // 3. Get all users for reference
    const allUsers = await prisma.user.findMany({
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

    console.log('\n\n👥 ALL USERS IN DATABASE:');
    allUsers.forEach(user => {
        console.log(`${user.role}: ${user.name} (${user.email}) - ID: ${user.id}`);
    });
}

checkDatabase()
    .then(() => {
        console.log('\n✅ Database check complete');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Error:', error);
        process.exit(1);
    });
