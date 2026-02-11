import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { prisma } from '@/lib/db/prisma';
import { LikeReviewResponse } from '@/types/api';

type Params = Promise<{ id: string }>;

// POST /api/reviews/[id]/like - Toggle like on a review
export async function POST(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id: reviewId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: { message: 'Not authenticated', code: 'UNAUTHORIZED' } },
        { status: 401 }
      );
    }

    // Get current user
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

    // Check if review exists
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { id: true, likeCount: true },
    });

    if (!review) {
      return NextResponse.json(
        { error: { message: 'Review not found', code: 'NOT_FOUND' } },
        { status: 404 }
      );
    }

    // Check if already liked
    const existingLike = await prisma.reviewLike.findUnique({
      where: {
        userId_reviewId: {
          userId: currentUser.id,
          reviewId,
        },
      },
    });

    let liked: boolean;
    let likeCount: number;

    if (existingLike) {
      // Unlike
      await prisma.$transaction([
        prisma.reviewLike.delete({
          where: {
            userId_reviewId: {
              userId: currentUser.id,
              reviewId,
            },
          },
        }),
        prisma.review.update({
          where: { id: reviewId },
          data: { likeCount: { decrement: 1 } },
        }),
      ]);
      liked = false;
      likeCount = review.likeCount - 1;
    } else {
      // Like
      await prisma.$transaction([
        prisma.reviewLike.create({
          data: {
            userId: currentUser.id,
            reviewId,
          },
        }),
        prisma.review.update({
          where: { id: reviewId },
          data: { likeCount: { increment: 1 } },
        }),
      ]);
      liked = true;
      likeCount = review.likeCount + 1;
    }

    const response: LikeReviewResponse = { liked, likeCount };
    return NextResponse.json(response);
  } catch (error) {
    console.error('POST /api/reviews/[id]/like error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
