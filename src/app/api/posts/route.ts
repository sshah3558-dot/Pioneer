import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth/options';
import { prisma } from '@/lib/db/prisma';
import { computeCompositeScore, recomputeUserRanks } from '@/lib/services/moments';

const querySchema = z.object({
  userId: z.string().optional(),
  page: z.coerce.number().default(1),
  pageSize: z.coerce.number().max(50).default(20),
});

const createPostSchema = z.object({
  content: z.string().min(1, 'Post content is required').max(2000),
  imageUrl: z.string().url().optional(),
  imageUrl2: z.string().url().optional(),
  imageUrl3: z.string().url().optional(),
  overallRating: z.number().min(1).max(5).optional(),
  valueRating: z.number().min(1).max(5).optional(),
  authenticityRating: z.number().min(1).max(5).optional(),
  crowdRating: z.number().min(1).max(5).optional(),
  placeId: z.string().optional(),
});

// GET /api/posts - Get posts for a user
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

    let userId: string;
    if (query.userId === 'me' || !query.userId) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });
      if (!user) {
        return NextResponse.json(
          { error: { message: 'User not found', code: 'NOT_FOUND' } },
          { status: 404 }
        );
      }
      userId = user.id;
    } else {
      userId = query.userId;
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        include: {
          place: {
            select: {
              id: true, name: true, category: true, imageUrl: true,
              city: { select: { name: true, country: { select: { name: true } } } },
            },
          },
        },
      }),
      prisma.post.count({ where: { userId } }),
    ]);

    return NextResponse.json({
      items: posts.map(post => ({
        id: post.id,
        content: post.content,
        imageUrl: post.imageUrl,
        imageUrl2: post.imageUrl2,
        imageUrl3: post.imageUrl3,
        likeCount: post.likeCount,
        viewCount: post.viewCount,
        overallRating: post.overallRating,
        valueRating: post.valueRating,
        authenticityRating: post.authenticityRating,
        crowdRating: post.crowdRating,
        compositeScore: post.compositeScore,
        rank: post.rank,
        createdAt: post.createdAt.toISOString(),
        place: post.place ? {
          id: post.place.id,
          name: post.place.name,
          category: post.place.category,
          imageUrl: post.place.imageUrl,
          cityName: post.place.city?.name,
          countryName: post.place.city?.country?.name,
        } : null,
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
    console.error('GET /api/posts error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}

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
    const data = createPostSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: { message: 'User not found', code: 'NOT_FOUND' } },
        { status: 404 }
      );
    }

    const compositeScore = data.overallRating
      ? computeCompositeScore(data.overallRating, data.valueRating, data.authenticityRating, data.crowdRating)
      : null;

    const post = await prisma.post.create({
      data: {
        userId: user.id,
        content: data.content,
        imageUrl: data.imageUrl || null,
        imageUrl2: data.imageUrl2 || null,
        imageUrl3: data.imageUrl3 || null,
        overallRating: data.overallRating || null,
        valueRating: data.valueRating || null,
        authenticityRating: data.authenticityRating || null,
        crowdRating: data.crowdRating || null,
        compositeScore,
        placeId: data.placeId || null,
      },
    });

    // Recompute rankings if this is a rated moment
    if (compositeScore !== null) {
      await recomputeUserRanks(user.id);
    }

    return NextResponse.json({
      post: {
        id: post.id,
        content: post.content,
        imageUrl: post.imageUrl,
        imageUrl2: post.imageUrl2,
        imageUrl3: post.imageUrl3,
        likeCount: post.likeCount,
        viewCount: post.viewCount,
        overallRating: post.overallRating,
        valueRating: post.valueRating,
        authenticityRating: post.authenticityRating,
        crowdRating: post.crowdRating,
        compositeScore: post.compositeScore,
        rank: post.rank,
        createdAt: post.createdAt.toISOString(),
      },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { message: error.issues[0].message, code: 'VALIDATION_ERROR' } },
        { status: 400 }
      );
    }
    console.error('POST /api/posts error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
