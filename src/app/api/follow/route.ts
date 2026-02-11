import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth/options';
import { prisma } from '@/lib/db/prisma';
import { FollowUserResponse, UnfollowUserResponse } from '@/types/api';

const followSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
});

// POST /api/follow - Follow a user
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
    const { userId: targetUserId } = followSchema.parse(body);

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

    // Cannot follow yourself
    if (currentUser.id === targetUserId) {
      return NextResponse.json(
        { error: { message: 'Cannot follow yourself', code: 'VALIDATION_ERROR' } },
        { status: 400 }
      );
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: { message: 'User to follow not found', code: 'NOT_FOUND' } },
        { status: 404 }
      );
    }

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUser.id,
          followingId: targetUserId,
        },
      },
    });

    if (existingFollow) {
      const response: FollowUserResponse = { following: true };
      return NextResponse.json(response);
    }

    // Create follow relationship and update counts in a transaction
    await prisma.$transaction([
      prisma.follow.create({
        data: {
          followerId: currentUser.id,
          followingId: targetUserId,
        },
      }),
      prisma.user.update({
        where: { id: currentUser.id },
        data: { followingCount: { increment: 1 } },
      }),
      prisma.user.update({
        where: { id: targetUserId },
        data: { followerCount: { increment: 1 } },
      }),
    ]);

    const response: FollowUserResponse = { following: true };
    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { message: error.issues[0].message, code: 'VALIDATION_ERROR' } },
        { status: 400 }
      );
    }
    console.error('POST /api/follow error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}

// DELETE /api/follow - Unfollow a user
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: { message: 'Not authenticated', code: 'UNAUTHORIZED' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userId: targetUserId } = followSchema.parse(body);

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

    // Check if follow relationship exists
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUser.id,
          followingId: targetUserId,
        },
      },
    });

    if (!existingFollow) {
      const response: UnfollowUserResponse = { following: false };
      return NextResponse.json(response);
    }

    // Delete follow relationship and update counts in a transaction
    await prisma.$transaction([
      prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId: currentUser.id,
            followingId: targetUserId,
          },
        },
      }),
      prisma.user.update({
        where: { id: currentUser.id },
        data: { followingCount: { decrement: 1 } },
      }),
      prisma.user.update({
        where: { id: targetUserId },
        data: { followerCount: { decrement: 1 } },
      }),
    ]);

    const response: UnfollowUserResponse = { following: false };
    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { message: error.issues[0].message, code: 'VALIDATION_ERROR' } },
        { status: 400 }
      );
    }
    console.error('DELETE /api/follow error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
