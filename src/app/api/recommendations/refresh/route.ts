import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { prisma } from '@/lib/db/prisma';
import { refreshRecommendationsForUser } from '@/lib/ai/compute-recommendations';

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

  await refreshRecommendationsForUser(user.id);
  return NextResponse.json({ ok: true, message: 'Recommendations refreshed' });
}
