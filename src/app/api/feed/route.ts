import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth/options';
import { prisma } from '@/lib/db/prisma';
import { GetFeedResponse, FeedItem } from '@/types/api';
import { TripStatus } from '@/types/trip';

const querySchema = z.object({
  page: z.coerce.number().default(1),
  pageSize: z.coerce.number().max(50).default(20),
});

// GET /api/feed - Get activity feed from followed users
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: { message: 'Not authenticated', code: 'UNAUTHORIZED' } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));

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

    // Get list of users being followed
    const following = await prisma.follow.findMany({
      where: { followerId: currentUser.id },
      select: { followingId: true },
    });

    const followingIds = following.map(f => f.followingId);

    // If not following anyone, return empty feed
    if (followingIds.length === 0) {
      const response: GetFeedResponse = {
        items: [],
        total: 0,
        page: query.page,
        pageSize: query.pageSize,
        hasMore: false,
      };
      return NextResponse.json(response);
    }

    // Get public trips from followed users
    const where = {
      userId: { in: followingIds },
      isPublic: true,
    };

    const [trips, total] = await Promise.all([
      prisma.trip.findMany({
        where,
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
          city: {
            include: {
              country: true,
            },
          },
          _count: {
            select: { stops: true },
          },
        },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.trip.count({ where }),
    ]);

    // Check liked status
    const likes = await prisma.tripLike.findMany({
      where: {
        userId: currentUser.id,
        tripId: { in: trips.map(t => t.id) },
      },
      select: { tripId: true },
    });
    const likedIds = new Set(likes.map(l => l.tripId));

    const items: FeedItem[] = trips.map(trip => ({
      id: `trip-${trip.id}`,
      type: 'trip' as const,
      createdAt: trip.createdAt.toISOString(),
      trip: {
        id: trip.id,
        title: trip.title,
        coverImageUrl: trip.coverImageUrl,
        startDate: trip.startDate,
        endDate: trip.endDate,
        likeCount: trip.likeCount,
        status: trip.status as TripStatus,
        user: trip.user,
        city: {
          name: trip.city.name,
          country: { name: trip.city.country.name },
        },
        stopCount: trip._count.stops,
        isLiked: likedIds.has(trip.id),
      },
    }));

    const response: GetFeedResponse = {
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
    console.error('GET /api/feed error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
