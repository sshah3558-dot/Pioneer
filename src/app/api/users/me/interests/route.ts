// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth/options';
import { prisma } from '@/lib/db/prisma';
import { GetInterestsResponse, UpdateInterestsRequest } from '@/types/api';
import { InterestCategory } from '@/types/user';

const VALID_CATEGORIES: InterestCategory[] = [
  'FOOD_DRINK',
  'ART_CULTURE',
  'OUTDOORS_NATURE',
  'NIGHTLIFE',
  'SHOPPING',
  'HISTORY',
  'ADVENTURE',
  'RELAXATION',
  'PHOTOGRAPHY',
  'LOCAL_EXPERIENCES',
  'ARCHITECTURE',
  'MUSIC',
  'SPORTS',
  'WELLNESS',
];

// GET /api/users/me/interests - Get current user's interests
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
      include: { interests: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: { message: 'User not found', code: 'NOT_FOUND' } },
        { status: 404 }
      );
    }

    const response: GetInterestsResponse = {
      interests: user.interests.map((i) => ({
        id: i.id,
        userId: i.userId,
        category: i.category as InterestCategory,
        weight: i.weight,
        createdAt: i.createdAt,
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('GET /api/users/me/interests error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}

const interestSchema = z.object({
  category: z.enum(VALID_CATEGORIES as [InterestCategory, ...InterestCategory[]]),
  weight: z.number().min(1).max(10),
});

const updateInterestsSchema = z.object({
  interests: z.array(interestSchema),
});

// POST /api/users/me/interests - Save user interests
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
    const data = updateInterestsSchema.parse(body) as UpdateInterestsRequest;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: { message: 'User not found', code: 'NOT_FOUND' } },
        { status: 404 }
      );
    }

    // Delete existing interests and create new ones in a transaction
    await prisma.$transaction([
      prisma.userInterest.deleteMany({
        where: { userId: user.id },
      }),
      prisma.userInterest.createMany({
        data: data.interests.map((interest) => ({
          userId: user.id,
          category: interest.category,
          weight: interest.weight,
        })),
      }),
    ]);

    // Fetch updated interests
    const interests = await prisma.userInterest.findMany({
      where: { userId: user.id },
    });

    const response: GetInterestsResponse = {
      interests: interests.map((i) => ({
        id: i.id,
        userId: i.userId,
        category: i.category as InterestCategory,
        weight: i.weight,
        createdAt: i.createdAt,
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { message: error.issues[0].message, code: 'VALIDATION_ERROR' } },
        { status: 400 }
      );
    }
    console.error('POST /api/users/me/interests error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
