import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { GetFollowingResponse } from '@/types/api';
import { UserPreview } from '@/types/user';

type Params = Promise<{ username: string }>;

const querySchema = z.object({
  page: z.coerce.number().default(1),
  pageSize: z.coerce.number().max(50).default(20),
});

// GET /api/users/[username]/following - Get users that a user follows
export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { username } = await params;
    const { searchParams } = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));

    // Find the user
    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: { message: 'User not found', code: 'NOT_FOUND' } },
        { status: 404 }
      );
    }

    // Get following with pagination
    const [following, total] = await Promise.all([
      prisma.follow.findMany({
        where: { followerId: user.id },
        include: {
          following: {
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
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.follow.count({ where: { followerId: user.id } }),
    ]);

    const items: UserPreview[] = following.map((f) => ({
      id: f.following.id,
      name: f.following.name,
      username: f.following.username,
      avatarUrl: f.following.avatarUrl,
      tripCount: f.following.tripCount,
      followerCount: f.following.followerCount,
    }));

    const response: GetFollowingResponse = {
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
    console.error('GET /api/users/[username]/following error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
