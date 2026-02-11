// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth/options';
import { prisma } from '@/lib/db/prisma';
import { AddTripStopResponse } from '@/types/api';

type Params = Promise<{ id: string }>;

const addStopSchema = z.object({
  placeId: z.string().min(1, 'Place ID is required'),
  dayNumber: z.number().optional(),
  orderInDay: z.number().optional(),
  notes: z.string().max(1000).optional(),
  arrivalTime: z.string().datetime().optional(),
  departureTime: z.string().datetime().optional(),
});

// POST /api/trips/[id]/stops - Add a stop to a trip
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

    const body = await request.json();
    const data = addStopSchema.parse(body);

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

    // Check if trip exists and belongs to user
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      select: { id: true, userId: true },
    });

    if (!trip) {
      return NextResponse.json(
        { error: { message: 'Trip not found', code: 'NOT_FOUND' } },
        { status: 404 }
      );
    }

    if (trip.userId !== currentUser.id) {
      return NextResponse.json(
        { error: { message: 'Not authorized to modify this trip', code: 'FORBIDDEN' } },
        { status: 403 }
      );
    }

    // Check if place exists
    const place = await prisma.place.findUnique({
      where: { id: data.placeId },
      select: { id: true },
    });

    if (!place) {
      return NextResponse.json(
        { error: { message: 'Place not found', code: 'NOT_FOUND' } },
        { status: 404 }
      );
    }

    // Get the next order if not specified
    let orderInDay = data.orderInDay ?? 0;
    if (data.orderInDay === undefined) {
      const lastStop = await prisma.tripStop.findFirst({
        where: {
          tripId,
          dayNumber: data.dayNumber ?? null,
        },
        orderBy: { orderInDay: 'desc' },
        select: { orderInDay: true },
      });
      orderInDay = (lastStop?.orderInDay ?? -1) + 1;
    }

    // Create stop
    const stop = await prisma.tripStop.create({
      data: {
        tripId,
        placeId: data.placeId,
        dayNumber: data.dayNumber ?? null,
        orderInDay,
        notes: data.notes ?? null,
        arrivalTime: data.arrivalTime ? new Date(data.arrivalTime) : null,
        departureTime: data.departureTime ? new Date(data.departureTime) : null,
      },
    });

    const response: AddTripStopResponse = {
      stop: {
        id: stop.id,
        placeId: stop.placeId,
        dayNumber: stop.dayNumber,
        orderInDay: stop.orderInDay,
      },
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { message: error.issues[0].message, code: 'VALIDATION_ERROR' } },
        { status: 400 }
      );
    }
    console.error('POST /api/trips/[id]/stops error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
