import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { prisma } from '@/lib/db/prisma';
import { LikeTripResponse } from '@/types/api';

type Params = Promise<{ id: string }>;

// POST /api/trips/[id]/like - Toggle like on a trip
export async function POST(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id: tripId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: { message: 'Not authenticated', code: 'UNAUTHORIZED' } },
        { status: 401 }
      );
    }

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

    // Check if trip exists
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      select: { id: true, likeCount: true, isPublic: true },
    });

    if (!trip || !trip.isPublic) {
      return NextResponse.json(
        { error: { message: 'Trip not found', code: 'NOT_FOUND' } },
        { status: 404 }
      );
    }

    // Check if already liked
    const existingLike = await prisma.tripLike.findUnique({
      where: {
        userId_tripId: {
          userId: currentUser.id,
          tripId,
        },
      },
    });

    let liked: boolean;
    let likeCount: number;

    if (existingLike) {
      // Unlike
      await prisma.$transaction([
        prisma.tripLike.delete({
          where: {
            userId_tripId: {
              userId: currentUser.id,
              tripId,
            },
          },
        }),
        prisma.trip.update({
          where: { id: tripId },
          data: { likeCount: { decrement: 1 } },
        }),
      ]);
      liked = false;
      likeCount = trip.likeCount - 1;
    } else {
      // Like
      await prisma.$transaction([
        prisma.tripLike.create({
          data: {
            userId: currentUser.id,
            tripId,
          },
        }),
        prisma.trip.update({
          where: { id: tripId },
          data: { likeCount: { increment: 1 } },
        }),
      ]);
      liked = true;
      likeCount = trip.likeCount + 1;
    }

    const response: LikeTripResponse = { liked, likeCount };
    return NextResponse.json(response);
  } catch (error) {
    console.error('POST /api/trips/[id]/like error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
