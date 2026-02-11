import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { prisma } from '@/lib/db/prisma';
import { SavePlaceResponse, UnsavePlaceResponse } from '@/types/api';

type Params = Promise<{ id: string }>;

// POST /api/places/[id]/save - Save a place
export async function POST(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id: placeId } = await params;
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

    // Check if place exists
    const place = await prisma.place.findUnique({
      where: { id: placeId },
      select: { id: true },
    });

    if (!place) {
      return NextResponse.json(
        { error: { message: 'Place not found', code: 'NOT_FOUND' } },
        { status: 404 }
      );
    }

    // Create save (or ignore if already exists)
    await prisma.userSave.upsert({
      where: {
        userId_placeId: {
          userId: currentUser.id,
          placeId,
        },
      },
      update: {},
      create: {
        userId: currentUser.id,
        placeId,
      },
    });

    const response: SavePlaceResponse = { saved: true };
    return NextResponse.json(response);
  } catch (error) {
    console.error('POST /api/places/[id]/save error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}

// DELETE /api/places/[id]/save - Unsave a place
export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id: placeId } = await params;
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

    // Delete save (ignore if doesn't exist)
    await prisma.userSave.deleteMany({
      where: {
        userId: currentUser.id,
        placeId,
      },
    });

    const response: UnsavePlaceResponse = { saved: false };
    return NextResponse.json(response);
  } catch (error) {
    console.error('DELETE /api/places/[id]/save error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
