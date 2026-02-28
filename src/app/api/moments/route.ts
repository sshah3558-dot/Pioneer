import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth/options';
import { prisma } from '@/lib/db/prisma';
import { getRecommendedMomentIds } from '@/lib/ai/recommendations';
import { refreshRecommendationsForUser } from '@/lib/ai/compute-recommendations';
import { Prisma } from '@prisma/client';

const momentSelect = {
  id: true, content: true, imageUrl: true, imageUrl2: true, imageUrl3: true,
  overallRating: true, valueRating: true, authenticityRating: true,
  crowdRating: true, compositeScore: true, rank: true, likeCount: true,
  viewCount: true, createdAt: true,
  user: { select: { id: true, name: true, username: true, avatarUrl: true } },
  place: {
    select: {
      id: true, name: true, category: true, imageUrl: true,
      city: { select: { name: true, country: { select: { name: true } } } },
    },
  },
} as const;

type MomentWithRelations = Prisma.PostGetPayload<{
  select: typeof momentSelect;
}>;

const querySchema = z.object({
  filter: z.enum(['recommended', 'mostViewed', 'topRated']).default('recommended'),
  country: z.string().optional(),
  search: z.string().optional(),
  saved: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(50).default(20),
});

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

    // If requesting saved moments
    if (query.saved === 'true') {
      const saves = await prisma.momentSave.findMany({
        where: { userId: currentUser.id },
        select: {
          post: { select: momentSelect },
        },
        orderBy: { savedAt: 'desc' },
      });

      return NextResponse.json({
        items: saves.map(s => ({
          ...formatMoment(s.post),
          isSaved: true,
        })),
        total: saves.length,
        page: 1,
        pageSize: saves.length,
        hasMore: false,
      });
    }

    // Build where clause using AND to combine all filters
    const andConditions: Record<string, unknown>[] = [
      { compositeScore: { not: null } },
    ];

    if (query.search) {
      andConditions.push({
        OR: [
          { content: { contains: query.search, mode: 'insensitive' } },
          { place: { name: { contains: query.search, mode: 'insensitive' } } },
        ],
      });
    }

    if (query.country) {
      andConditions.push({
        place: {
          city: { country: { name: { equals: query.country, mode: 'insensitive' } } },
        },
      });
    }

    const where: Record<string, unknown> = {
      AND: andConditions,
    };

    let orderBy: Record<string, string> = { createdAt: 'desc' };
    let specificIds: string[] | null = null;

    if (query.filter === 'topRated') {
      orderBy = { compositeScore: 'desc' };
    } else if (query.filter === 'mostViewed') {
      orderBy = { viewCount: 'desc' };
    } else if (query.filter === 'recommended') {
      try {
        // Try pre-computed recommendation scores first
        const precomputed = await prisma.recommendationScore.findMany({
          where: { userId: currentUser.id },
          orderBy: { score: 'desc' },
          select: { momentId: true },
          skip: (query.page - 1) * query.pageSize,
          take: query.pageSize,
        });

        if (precomputed.length > 0) {
          specificIds = precomputed.map(r => r.momentId);
        } else {
          // Fallback to legacy inline algorithm for cold start
          const rec = await getRecommendedMomentIds(
            currentUser.id,
            query.pageSize,
            (query.page - 1) * query.pageSize,
          );
          specificIds = rec.ids;
        }
      } catch {
        orderBy = { compositeScore: 'desc' };
      }
    }

    let moments;
    let total;

    if (specificIds) {
      // Merge recommended IDs with search/country filters
      const recommendedWhere: Record<string, unknown> = {
        AND: [
          { id: { in: specificIds } },
          ...andConditions,
        ],
      };
      moments = await prisma.post.findMany({
        where: recommendedWhere,
        select: momentSelect,
      });
      // Preserve recommendation order
      const orderMap = new Map(specificIds.map((id, i) => [id, i]));
      moments.sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0));
      total = moments.length;
    } else {
      [moments, total] = await Promise.all([
        prisma.post.findMany({
          where,
          select: momentSelect,
          orderBy,
          skip: (query.page - 1) * query.pageSize,
          take: query.pageSize,
        }),
        prisma.post.count({ where }),
      ]);
    }

    // Check saved status
    const savedMomentIds = new Set(
      (await prisma.momentSave.findMany({
        where: { userId: currentUser.id, postId: { in: moments.map(m => m.id) } },
        select: { postId: true },
      })).map(s => s.postId)
    );

    // Fire-and-forget: refresh pre-computed recommendations in the background
    if (query.filter === 'recommended' && currentUser) {
      refreshRecommendationsForUser(currentUser.id).catch((err) => {
        console.error('Background recommendation refresh failed:', err);
      });
    }

    return NextResponse.json({
      items: moments.map(m => ({
        ...formatMoment(m),
        isSaved: savedMomentIds.has(m.id),
      })),
      total,
      page: query.page,
      pageSize: query.pageSize,
      hasMore: query.page * query.pageSize < total,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { message: 'Invalid request parameters', code: 'VALIDATION_ERROR' } },
        { status: 400 }
      );
    }
    console.error('GET /api/moments error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}

function formatMoment(post: MomentWithRelations) {
  return {
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
    rank: post.rank,
    likeCount: post.likeCount,
    viewCount: post.viewCount,
    createdAt: post.createdAt,
    user: post.user,
    place: post.place ? {
      id: post.place.id,
      name: post.place.name,
      category: post.place.category,
      imageUrl: post.place.imageUrl,
      cityName: post.place.city?.name,
      countryName: post.place.city?.country?.name,
    } : null,
  };
}
