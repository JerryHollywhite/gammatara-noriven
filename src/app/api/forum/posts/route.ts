import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/forum/posts?classId=xxx - List posts for a class
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const classId = searchParams.get('classId');

        console.log('[Forum API] GET request, classId:', classId, 'user:', (session.user as any)?.id);

        if (!classId) {
            return NextResponse.json({ error: 'classId is required' }, { status: 400 });
        }

        // Fetch posts with replies count
        const posts = await prisma.forumPost.findMany({
            where: { classId },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        role: true
                    }
                },
                replies: {
                    select: {
                        id: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({
            success: true,
            posts: posts.map(post => ({
                ...post,
                replyCount: post.replies.length,
                replies: undefined // Don't send full reply data in list view
            }))
        });

    } catch (error) {
        console.error('Error fetching forum posts:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/forum/posts - Create new post
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { classId, title, content, imageUrl } = body;

        console.log('[Forum API] POST request body:', { classId, title: !!title, content: !!content, imageUrl: !!imageUrl });

        if (!classId || !title || !content) {
            console.error('[Forum API] Missing fields:', { classId: !!classId, title: !!title, content: !!content });
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const userId = (session.user as any)?.id;
        if (!userId) {
            console.error('[Forum API] No user ID in session:', session.user);
            return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
        }

        // Verify user has access to this class (enrolled or teaching)
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                studentProfile: {
                    include: {
                        enrollments: {
                            where: { classId }
                        }
                    }
                },
                teacherProfile: {
                    include: {
                        classes: {
                            where: { id: classId }
                        }
                    }
                }
            }
        });

        const isEnrolled = user?.studentProfile?.enrollments.length || 0 > 0;
        const isTeaching = user?.teacherProfile?.classes.length || 0 > 0;

        if (!isEnrolled && !isTeaching) {
            return NextResponse.json({ error: 'You do not have access to this class' }, { status: 403 });
        }

        // Create post
        const post = await prisma.forumPost.create({
            data: {
                classId,
                authorId: userId,
                authorType: session.user.role || 'STUDENT',
                title,
                content,
                imageUrl: imageUrl || null
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        role: true
                    }
                }
            }
        });

        return NextResponse.json({
            success: true,
            post
        });

    } catch (error) {
        console.error('Error creating forum post:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
