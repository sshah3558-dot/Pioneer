import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth/options';
import { prisma } from '@/lib/db/prisma';
import { GetTripsResponse, CreateTripResponse } from '@/types/api';
import { TripCard, TripStatus } from '@/types/trip';
import { Prisma } from '@prisma/client';

const VALID_STATUSES: TripStatus[] = ['PLANNING', 'IN_PROGRESS', 'COMPLETED'];

const querySchema = z.object({
  userId: z.string().optional(),
  cityId: z.string().optional(),
  countryId: z.string().optional(),
  followingOnly: z.coerce.boolean().optional(),
  status: z.enum(VALID_STATUSES as [TripStatus, ...TripStatus[]]).optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(50).default(20),
  sortBy: z.enum(['recent', 'popular']).optional(),
});

const createTripSchema = z.object({
  cityId: z.string().min(1, 'City ID is required'),
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(5000).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  isPublic: z.boolean().optional(),
  coverImageUrl: z.string().url().optional(),
});

function getOrderBy(sortBy: string | undefined): Prisma.TripOrderByWithRelationInput {
  switch (sortBy) {
    case 'popular':
      return { likeCount: 'desc' };
    case 'recent':
    default:
      return { createdAt: 'desc' };
  }
}

// GET /api/trips - List trips
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));

    // Get current user ID if authenticated
    let currentUserId: string | null = null;
    if (session?.user?.email) {
      const currentUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });
      currentUserId = currentUser?.id ?? null;
    }

    // Build where clause
    const where: Prisma.TripWhereInput = {};

    if (query.userId) {
      where.userId = query.userId;
      // If the requesting user is viewing their own trips, show all (including private)
      // Otherwise, only show public trips
      if (query.userId !== currentUserId) {
        where.isPublic = true;
      }
    } else {
      // No specific user requested — only show public trips
      where.isPublic = true;
    }

    if (query.cityId) {
      where.cityId = query.cityId;
    }

    if (query.countryId) {
      where.city = { countryId: query.countryId };
    }

    if (query.status) {
      where.status = query.status;
    }

    // Filter by following only
    if (query.followingOnly && session?.user?.email) {
      const currentUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });

      if (currentUser) {
        const followingIds = await prisma.follow.findMany({
          where: { followerId: currentUser.id },
          select: { followingId: true },
        });
        where.userId = { in: followingIds.map(f => f.followingId) };
      }
    }

    // Get trips with pagination
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
        orderBy: getOrderBy(query.sortBy),
      }),
      prisma.trip.count({ where }),
    ]);

    // Check liked status for authenticated user
    let likedIds = new Set<string>();
    if (session?.user?.email) {
      const currentUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });

      if (currentUser) {
        const likes = await prisma.tripLike.findMany({
          where: {
            userId: currentUser.id,
            tripId: { in: trips.map(t => t.id) },
          },
          select: { tripId: true },
        });
        likedIds = new Set(likes.map(l => l.tripId));
      }
    }

    const items: TripCard[] = trips.map(trip => ({
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
    }));

    const response: GetTripsResponse = {
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
    console.error('GET /api/trips error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}

// POST /api/trips - Create a trip
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
    const data = createTripSchema.parse(body);

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

    // Check if city exists
    const city = await prisma.city.findUnique({
      where: { id: data.cityId },
      select: { id: true },
    });

    if (!city) {
      return NextResponse.json(
        { error: { message: 'City not found', code: 'NOT_FOUND' } },
        { status: 404 }
      );
    }

    // Create trip and update user trip count in a transaction
    const trip = await prisma.$transaction(async (tx) => {
      const newTrip = await tx.trip.create({
        data: {
          userId: currentUser.id,
          cityId: data.cityId,
          title: data.title,
          description: data.description || null,
          startDate: data.startDate ? new Date(data.startDate) : null,
          endDate: data.endDate ? new Date(data.endDate) : null,
          isPublic: data.isPublic ?? true,
          coverImageUrl: data.coverImageUrl || null,
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
          city: {
            include: {
              country: true,
            },
          },
          stops: {
            include: {
              place: {
                include: {
                  tags: true,
                },
              },
            },
          },
        },
      });

      // Update user trip count
      await tx.user.update({
        where: { id: currentUser.id },
        data: { tripCount: { increment: 1 } },
      });

      return newTrip;
    });

    const response: CreateTripResponse = {
      trip: {
        id: trip.id,
        userId: trip.userId,
        cityId: trip.cityId,
        title: trip.title,
        description: trip.description,
        startDate: trip.startDate,
        endDate: trip.endDate,
        isPublic: trip.isPublic,
        coverImageUrl: trip.coverImageUrl,
        likeCount: trip.likeCount,
        viewCount: trip.viewCount,
        status: trip.status as TripStatus,
        createdAt: trip.createdAt,
        updatedAt: trip.updatedAt,
        publishedAt: trip.publishedAt,
        user: trip.user,
        city: {
          id: trip.city.id,
          name: trip.city.name,
          country: { name: trip.city.country.name },
        },
        stops: [],
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
    console.error('POST /api/trips error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
