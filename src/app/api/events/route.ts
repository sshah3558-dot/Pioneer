import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';
import { EventType, TargetType, Prisma } from '@prisma/client';

const eventSchema = z.object({
  eventType: z.enum(['VIEW', 'SAVE', 'UNSAVE', 'LIKE', 'UNLIKE', 'CLICK', 'SEARCH', 'FILTER_CHANGE', 'SHARE']),
  targetId: z.string().optional(),
  targetType: z.enum(['MOMENT', 'PLACE', 'TRIP', 'USER']).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

const batchSchema = z.object({
  events: z.array(eventSchema).min(1).max(20),
});

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
      { status: 401 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json(
      { error: { message: 'User not found', code: 'NOT_FOUND' } },
      { status: 404 }
    );
  }

  const body = await request.json();
  const parsed = batchSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: 'Invalid events', code: 'VALIDATION_ERROR' } },
      { status: 400 }
    );
  }

  // Fire-and-forget: don't block response
  prisma.userEvent.createMany({
    data: parsed.data.events.map((event) => ({
      userId: user.id,
      eventType: event.eventType as EventType,
      targetId: event.targetId,
      targetType: event.targetType as TargetType,
      metadata: event.metadata ? event.metadata as Prisma.InputJsonValue : undefined,
    })),
  }).catch((err) => console.error('Event tracking error:', err));

  return NextResponse.json({ ok: true });
}
