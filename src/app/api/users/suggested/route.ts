import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { prisma } from '@/lib/db/prisma';

// GET /api/users/suggested - Get suggested users to follow
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: { message: 'Not authenticated', code: 'UNAUTHORIZED' } },
        { status: 401 }
      );
    }

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

    // Get IDs of users already being followed
    const following = await prisma.follow.findMany({
      where: { followerId: currentUser.id },
      select: { followingId: true },
    });
    const followingIds = following.map((f) => f.followingId);

    // Find users NOT followed by current user, ordered by follower count
    const suggestedUsers = await prisma.user.findMany({
      where: {
        id: { notIn: [...followingIds, currentUser.id] },
        onboardingComplete: true,
      },
      select: {
        id: true,
        name: true,
        username: true,
        avatarUrl: true,
        tripCount: true,
        reviewCount: true,
        followerCount: true,
      },
      orderBy: { followerCount: 'desc' },
      take: 5,
    });

    return NextResponse.json({ users: suggestedUsers });
  } catch (error) {
    console.error('GET /api/users/suggested error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
