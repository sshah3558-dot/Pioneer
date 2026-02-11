// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth/options';
import { prisma } from '@/lib/db/prisma';
import { MeResponse, UpdateUserRequest } from '@/types/api';

// GET /api/users/me - Get current user profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: { message: 'Not authenticated', code: 'UNAUTHORIZED' } },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
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

    const response: MeResponse = {
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
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('GET /api/users/me error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}

const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores').optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional().nullable(),
  coverImageUrl: z.string().url().optional().nullable(),
});

// PATCH /api/users/me - Update current user profile
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: { message: 'Not authenticated', code: 'UNAUTHORIZED' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const data = updateUserSchema.parse(body) as UpdateUserRequest;

    // Check if username is being changed and if it's already taken
    if (data.username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username: data.username,
          NOT: { email: session.user.email },
        },
      });
      if (existingUser) {
        return NextResponse.json(
          { error: { message: 'Username already taken', code: 'USERNAME_EXISTS' } },
          { status: 400 }
        );
      }
    }

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.username !== undefined && { username: data.username }),
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
        ...(data.coverImageUrl !== undefined && { coverImageUrl: data.coverImageUrl }),
      },
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

    const response: MeResponse = {
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
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { message: error.issues[0].message, code: 'VALIDATION_ERROR' } },
        { status: 400 }
      );
    }
    console.error('PATCH /api/users/me error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
