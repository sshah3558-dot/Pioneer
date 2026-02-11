import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { prisma } from '@/lib/db/prisma';
import { CompleteOnboardingResponse } from '@/types/api';

// POST /api/users/me/onboarding - Complete onboarding
export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: { message: 'Not authenticated', code: 'UNAUTHORIZED' } },
        { status: 401 }
      );
    }

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: { onboardingComplete: true },
    });

    const response: CompleteOnboardingResponse = {
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
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('POST /api/users/me/onboarding error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
