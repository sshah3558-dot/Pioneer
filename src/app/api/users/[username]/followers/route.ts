import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { GetFollowersResponse } from '@/types/api';
import { UserPreview } from '@/types/user';

type Params = Promise<{ username: string }>;

const querySchema = z.object({
  page: z.coerce.number().default(1),
  pageSize: z.coerce.number().max(50).default(20),
});

// GET /api/users/[username]/followers - Get followers of a user
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

    // Get followers with pagination
    const [followers, total] = await Promise.all([
      prisma.follow.findMany({
        where: { followingId: user.id },
        include: {
          follower: {
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
      prisma.follow.count({ where: { followingId: user.id } }),
    ]);

    const items: UserPreview[] = followers.map((f) => ({
      id: f.follower.id,
      name: f.follower.name,
      username: f.follower.username,
      avatarUrl: f.follower.avatarUrl,
      tripCount: f.follower.tripCount,
      followerCount: f.follower.followerCount,
    }));

    const response: GetFollowersResponse = {
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
    console.error('GET /api/users/[username]/followers error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
