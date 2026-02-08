import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { prisma } from '@/lib/db/prisma';
import { GetUserResponse } from '@/types/api';

type Params = Promise<{ username: string }>;

// GET /api/users/[username] - Get user by username
export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { username } = await params;
    const session = await getServerSession(authOptions);

    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        interests: true,
        socialConnections: {
          select: {
            id: true,
            userId: true,
            platform: true,
            connectedAt: true,
            expiresAt: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: { message: 'User not found', code: 'NOT_FOUND' } },
        { status: 404 }
      );
    }

    // Check if the authenticated user is following this user
    let isFollowing = false;
    if (session?.user?.email) {
      const currentUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });

      if (currentUser && currentUser.id !== user.id) {
        const follow = await prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: currentUser.id,
              followingId: user.id,
            },
          },
        });
        isFollowing = !!follow;
      }
    }

    const response: GetUserResponse = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        coverImageUrl: user.coverImageUrl,
        onboardingComplete: user.onboardingComplete,
        subscriptionTier: user.subscriptionTier,
        tripCount: user.tripCount,
        reviewCount: user.reviewCount,
        followerCount: user.followerCount,
        followingCount: user.followingCount,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        interests: user.interests.map((i) => ({
          id: i.id,
          userId: i.userId,
          category: i.category,
          weight: i.weight,
          createdAt: i.createdAt,
        })),
        socialConnections: user.socialConnections.map((sc) => ({
          id: sc.id,
          userId: sc.userId,
          platform: sc.platform,
          connectedAt: sc.connectedAt,
          expiresAt: sc.expiresAt,
        })),
        isFollowing,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('GET /api/users/[username] error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
