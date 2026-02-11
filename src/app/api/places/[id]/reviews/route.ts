// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth/options';
import { prisma } from '@/lib/db/prisma';
import { GetPlaceReviewsResponse } from '@/types/api';
import { ReviewCard } from '@/types/review';
import { Prisma } from '@prisma/client';

type Params = Promise<{ id: string }>;

const querySchema = z.object({
  page: z.coerce.number().default(1),
  pageSize: z.coerce.number().max(50).default(20),
  sortBy: z.enum(['recent', 'helpful', 'rating']).optional(),
});

function getOrderBy(sortBy: string | undefined): Prisma.ReviewOrderByWithRelationInput {
  switch (sortBy) {
    case 'helpful':
      return { likeCount: 'desc' };
    case 'rating':
      return { overallRating: 'desc' };
    case 'recent':
    default:
      return { createdAt: 'desc' };
  }
}

// GET /api/places/[id]/reviews - Get reviews for a place
export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id: placeId } = await params;
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));

    // Check if place exists
    const place = await prisma.place.findUnique({
      where: { id: placeId },
      select: { id: true },
    });

    if (!place) {
      return NextResponse.json(
        { error: { message: 'Place not found', code: 'NOT_FOUND' } },
        { status: 404 }
      );
    }

    // Get reviews with pagination
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { placeId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              avatarUrl: true,
              tripCount: true,
              followerCount: true,
            },
          },
          photos: true,
        },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        orderBy: getOrderBy(query.sortBy),
      }),
      prisma.review.count({ where: { placeId } }),
    ]);

    // Check liked status for authenticated user
    let likedIds = new Set<string>();
    if (session?.user?.email) {
      const currentUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });

      if (currentUser) {
        const likes = await prisma.reviewLike.findMany({
          where: {
            userId: currentUser.id,
            reviewId: { in: reviews.map(r => r.id) },
          },
          select: { reviewId: true },
        });
        likedIds = new Set(likes.map(l => l.reviewId));
      }
    }

    const items: ReviewCard[] = reviews.map(review => ({
      id: review.id,
      overallRating: review.overallRating,
      title: review.title,
      content: review.content,
      likeCount: review.likeCount,
      createdAt: review.createdAt,
      user: review.user,
      photoCount: review.photos.length,
      isLiked: likedIds.has(review.id),
    }));

    const response: GetPlaceReviewsResponse = {
      items,
      total,
      page: query.page,
      pageSize: query.pageSize,
      hasMore: query.page * query.pageSize < total,
    };

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { message: 'Invalid request parameters', code: 'VALIDATION_ERROR' } },
        { status: 400 }
      );
    }
    console.error('GET /api/places/[id]/reviews error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
