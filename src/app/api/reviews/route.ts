import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth/options';
import { prisma } from '@/lib/db/prisma';
import { updatePlaceRatings } from '@/lib/services/reviews';
import { CreateReviewResponse } from '@/types/api';

const createReviewSchema = z.object({
  placeId: z.string().min(1, 'Place ID is required'),
  tripId: z.string().optional(),
  overallRating: z.number().min(1).max(5),
  valueRating: z.number().min(1).max(5).optional(),
  authenticityRating: z.number().min(1).max(5).optional(),
  crowdRating: z.number().min(1).max(5).optional(),
  title: z.string().max(200).optional(),
  content: z.string().min(1, 'Review content is required'),
  visitedAt: z.string().datetime().optional(),
});

// POST /api/reviews - Create a review
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: { message: 'Not authenticated', code: 'UNAUTHORIZED' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const data = createReviewSchema.parse(body);

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

    // Check if place exists
    const place = await prisma.place.findUnique({
      where: { id: data.placeId },
      select: { id: true },
    });

    if (!place) {
      return NextResponse.json(
        { error: { message: 'Place not found', code: 'NOT_FOUND' } },
        { status: 404 }
      );
    }

    // Check if user already reviewed this place
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_placeId: {
          userId: currentUser.id,
          placeId: data.placeId,
        },
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: { message: 'You have already reviewed this place', code: 'VALIDATION_ERROR' } },
        { status: 400 }
      );
    }

    // Create review and update user review count in a transaction
    const review = await prisma.$transaction(async (tx) => {
      const newReview = await tx.review.create({
        data: {
          userId: currentUser.id,
          placeId: data.placeId,
          tripId: data.tripId || null,
          overallRating: data.overallRating,
          valueRating: data.valueRating || null,
          authenticityRating: data.authenticityRating || null,
          crowdRating: data.crowdRating || null,
          title: data.title || null,
          content: data.content,
          visitedAt: data.visitedAt ? new Date(data.visitedAt) : null,
        },
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
        },
      });

      // Update user review count
      await tx.user.update({
        where: { id: currentUser.id },
        data: { reviewCount: { increment: 1 } },
      });

      return newReview;
    });

    // Update place aggregate ratings
    await updatePlaceRatings(data.placeId);

    const response: CreateReviewResponse = {
      review: {
        id: review.id,
        userId: review.userId,
        placeId: review.placeId,
        tripId: review.tripId,
        overallRating: review.overallRating,
        valueRating: review.valueRating,
        authenticityRating: review.authenticityRating,
        crowdRating: review.crowdRating,
        title: review.title,
        content: review.content,
        visitedAt: review.visitedAt,
        likeCount: review.likeCount,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        user: review.user,
      },
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { message: error.issues[0].message, code: 'VALIDATION_ERROR' } },
        { status: 400 }
      );
    }
    console.error('POST /api/reviews error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
