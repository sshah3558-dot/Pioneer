import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth/options';
import { prisma } from '@/lib/db/prisma';
import { GetFeedResponse, FeedItem } from '@/types/api';
import { TripStatus } from '@/types/trip';
import { PlaceCategory, PriceLevel } from '@/types/place';

const querySchema = z.object({
  page: z.coerce.number().default(1),
  pageSize: z.coerce.number().max(50).default(20),
});

const userSelect = {
  id: true,
  name: true,
  username: true,
  avatarUrl: true,
  tripCount: true,
  followerCount: true,
};

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

    // Include current user + followed users for feed content
    const feedUserIds = [currentUser.id, ...followingIds];

    // Query all four activity types in parallel
    const [trips, reviews, follows, posts] = await Promise.all([
      // 1. Public trips from feed users
      prisma.trip.findMany({
        where: {
          userId: { in: feedUserIds },
          isPublic: true,
        },
        select: {
          id: true, title: true, coverImageUrl: true, startDate: true,
          endDate: true, likeCount: true, status: true, createdAt: true,
          user: { select: userSelect },
          city: {
            select: { name: true, country: { select: { name: true } } },
          },
          _count: {
            select: { stops: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),

      // 2. Reviews from feed users
      prisma.review.findMany({
        where: {
          userId: { in: feedUserIds },
        },
        select: {
          id: true, overallRating: true, title: true, content: true,
          likeCount: true, createdAt: true,
          user: { select: userSelect },
          place: {
            select: {
              id: true, name: true, category: true, imageUrl: true,
              neighborhood: true, avgOverallRating: true, totalReviewCount: true,
              priceLevel: true,
              city: { select: { name: true, country: { select: { name: true } } } },
            },
          },
          _count: { select: { photos: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),

      // 3. Follow activity from followed users (when they follow someone)
      prisma.follow.findMany({
        where: {
          followerId: { in: followingIds },
        },
        select: {
          id: true, createdAt: true,
          follower: { select: userSelect },
          following: { select: userSelect },
        },
        orderBy: { createdAt: 'desc' },
      }),

      // 4. Posts from feed users (own + followed)
      prisma.post.findMany({
        where: {
          userId: { in: feedUserIds },
        },
        select: {
          id: true, content: true, imageUrl: true, imageUrl2: true, imageUrl3: true,
          overallRating: true, valueRating: true, authenticityRating: true,
          crowdRating: true, compositeScore: true, likeCount: true, createdAt: true,
          user: { select: userSelect },
          place: {
            select: {
              id: true, name: true, category: true, imageUrl: true,
              city: { select: { name: true, country: { select: { name: true } } } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // Build FeedItem objects for each type
    const tripItems: FeedItem[] = trips.map(trip => ({
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
        isLiked: false, // Will be enriched below
      },
    }));

    const reviewItems: FeedItem[] = reviews.map(review => ({
      id: `review-${review.id}`,
      type: 'review' as const,
      createdAt: review.createdAt.toISOString(),
      review: {
        id: review.id,
        user: review.user,
        place: {
          id: review.place.id,
          name: review.place.name,
          category: review.place.category as PlaceCategory,
          imageUrl: review.place.imageUrl,
          neighborhood: review.place.neighborhood,
          avgOverallRating: review.place.avgOverallRating,
          totalReviewCount: review.place.totalReviewCount,
          priceLevel: review.place.priceLevel as PriceLevel | null,
          tags: [],
          isSaved: false,
          cityName: review.place.city.name,
          countryName: review.place.city.country.name,
        },
        overallRating: review.overallRating,
        title: review.title,
        content: review.content,
        photoCount: review._count.photos,
        likeCount: review.likeCount,
        isLiked: false,
        createdAt: review.createdAt,
      },
    }));

    const followItems: FeedItem[] = follows.map(follow => ({
      id: `follow-${follow.id}`,
      type: 'follow' as const,
      createdAt: follow.createdAt.toISOString(),
      follow: {
        follower: follow.follower,
        following: follow.following,
      },
    }));

    const postItems: FeedItem[] = posts.map(post => ({
      id: `post-${post.id}`,
      type: 'post' as const,
      createdAt: post.createdAt.toISOString(),
      post: {
        id: post.id,
        content: post.content,
        imageUrl: post.imageUrl,
        imageUrl2: post.imageUrl2,
        imageUrl3: post.imageUrl3,
        overallRating: post.overallRating,
        valueRating: post.valueRating,
        authenticityRating: post.authenticityRating,
        crowdRating: post.crowdRating,
        compositeScore: post.compositeScore,
        likeCount: post.likeCount,
        user: post.user,
        createdAt: post.createdAt.toISOString(),
        place: post.place ? {
          id: post.place.id,
          name: post.place.name,
          category: post.place.category,
          imageUrl: post.place.imageUrl,
          cityName: post.place.city?.name,
          countryName: post.place.city?.country?.name,
        } : null,
      },
    }));

    // Merge all items and sort by createdAt descending
    const allItems = [...tripItems, ...reviewItems, ...followItems, ...postItems];
    allItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Paginate the merged results
    const total = allItems.length;
    const start = (query.page - 1) * query.pageSize;
    const paginatedItems = allItems.slice(start, start + query.pageSize);

    // Enrich trip items with like status for the current user
    const tripIdsInPage = paginatedItems
      .filter(item => item.type === 'trip' && item.trip)
      .map(item => item.trip!.id);

    if (tripIdsInPage.length > 0) {
      const likes = await prisma.tripLike.findMany({
        where: {
          userId: currentUser.id,
          tripId: { in: tripIdsInPage },
        },
        select: { tripId: true },
      });
      const likedIds = new Set(likes.map(l => l.tripId));

      for (const item of paginatedItems) {
        if (item.type === 'trip' && item.trip) {
          item.trip.isLiked = likedIds.has(item.trip.id);
        }
      }
    }

    const response: GetFeedResponse = {
      items: paginatedItems,
      total,
      page: query.page,
      pageSize: query.pageSize,
      hasMore: start + query.pageSize < total,
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
