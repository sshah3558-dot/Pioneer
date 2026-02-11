import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth/options';
import { prisma } from '@/lib/db/prisma';

// GET /api/forums/posts/[postId]/comments
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;

    const comments = await prisma.forumComment.findMany({
      where: { postId, parentId: null },
      include: {
        user: { select: { id: true, name: true, username: true, avatarUrl: true } },
        replies: {
          include: {
            user: { select: { id: true, name: true, username: true, avatarUrl: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error('GET /api/forums/posts/[postId]/comments error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}

const createCommentSchema = z.object({
  content: z.string().min(1),
  parentId: z.string().optional(),
});

// POST /api/forums/posts/[postId]/comments
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: { message: 'Not authenticated', code: 'UNAUTHORIZED' } },
        { status: 401 }
      );
    }

    const { postId } = await params;
    const body = await request.json();
    const data = createCommentSchema.parse(body);

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: { message: 'User not found', code: 'NOT_FOUND' } },
        { status: 404 }
      );
    }

    const comment = await prisma.$transaction(async (tx) => {
      const newComment = await tx.forumComment.create({
        data: {
          postId,
          userId: currentUser.id,
          content: data.content,
          parentId: data.parentId || null,
        },
        include: {
          user: { select: { id: true, name: true, username: true, avatarUrl: true } },
        },
      });

      await tx.forumPost.update({
        where: { id: postId },
        data: { commentCount: { increment: 1 } },
      });

      return newComment;
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { message: error.issues[0].message, code: 'VALIDATION_ERROR' } },
        { status: 400 }
      );
    }
    console.error('POST /api/forums/posts/[postId]/comments error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
