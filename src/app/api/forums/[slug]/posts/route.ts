import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth/options';
import { prisma } from '@/lib/db/prisma';

// GET /api/forums/[slug]/posts - List posts in a forum
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    const forum = await prisma.forum.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!forum) {
      return NextResponse.json(
        { error: { message: 'Forum not found', code: 'NOT_FOUND' } },
        { status: 404 }
      );
    }

    const where = { forumId: forum.id };

    const [posts, total] = await Promise.all([
      prisma.forumPost.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, username: true, avatarUrl: true },
          },
          forum: { select: { name: true, slug: true } },
        },
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.forumPost.count({ where }),
    ]);

    return NextResponse.json({
      items: posts.map((p) => ({
        id: p.id,
        title: p.title,
        content: p.content,
        user: p.user,
        commentCount: p.commentCount,
        viewCount: p.viewCount,
        isPinned: p.isPinned,
        createdAt: p.createdAt,
        forumName: p.forum.name,
        forumSlug: p.forum.slug,
      })),
      total,
      page,
      pageSize,
      hasMore: page * pageSize < total,
    });
  } catch (error) {
    console.error('GET /api/forums/[slug]/posts error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}

const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
});

// POST /api/forums/[slug]/posts - Create a post
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: { message: 'Not authenticated', code: 'UNAUTHORIZED' } },
        { status: 401 }
      );
    }

    const { slug } = await params;
    const body = await request.json();
    const data = createPostSchema.parse(body);

    const [forum, currentUser] = await Promise.all([
      prisma.forum.findUnique({ where: { slug }, select: { id: true } }),
      prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } }),
    ]);

    if (!forum) {
      return NextResponse.json(
        { error: { message: 'Forum not found', code: 'NOT_FOUND' } },
        { status: 404 }
      );
    }

    if (!currentUser) {
      return NextResponse.json(
        { error: { message: 'User not found', code: 'NOT_FOUND' } },
        { status: 404 }
      );
    }

    const post = await prisma.$transaction(async (tx) => {
      const newPost = await tx.forumPost.create({
        data: {
          forumId: forum.id,
          userId: currentUser.id,
          title: data.title,
          content: data.content,
        },
        include: {
          user: { select: { id: true, name: true, username: true, avatarUrl: true } },
        },
      });

      await tx.forum.update({
        where: { id: forum.id },
        data: { postCount: { increment: 1 } },
      });

      return newPost;
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { message: error.issues[0].message, code: 'VALIDATION_ERROR' } },
        { status: 400 }
      );
    }
    console.error('POST /api/forums/[slug]/posts error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
