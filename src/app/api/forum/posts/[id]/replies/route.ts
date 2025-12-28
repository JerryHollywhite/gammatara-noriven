import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/forum/posts/[id]/replies - Get all replies for a post
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: postId } = await params;
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const replies = await prisma.forumReply.findMany({
            where: { postId },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        role: true
                    }
                }
            },
            orderBy: { createdAt: 'asc' }
        });

        return NextResponse.json({
            success: true,
            replies
        });

    } catch (error) {
        console.error('Error fetching replies:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/forum/posts/[id]/replies - Add reply to post
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: postId } = await params;
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { content, imageUrl } = body;

        console.log('[Forum Reply] POST request, postId:', postId, 'content:', !!content);

        if (!content) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 });
        }

        const userId = (session.user as any)?.id;
        if (!userId) {
            console.error('[Forum Reply] No user ID in session');
            return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
        }

        // Verify post exists
        const post = await prisma.forumPost.findUnique({
            where: { id: postId },
            select: { classId: true }
        });

        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        // Verify user has access to this class
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                studentProfile: {
                    include: {
                        enrollments: {
                            where: { classId: post.classId }
                        }
                    }
                },
                teacherProfile: {
                    include: {
                        classes: {
                            where: { id: post.classId }
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

        // Create reply
        const reply = await prisma.forumReply.create({
            data: {
                postId,
                authorId: userId,
                authorType: session.user.role || 'STUDENT',
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
            reply
        });

    } catch (error) {
        console.error('Error creating reply:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
