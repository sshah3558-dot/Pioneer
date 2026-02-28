import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { prisma } from '@/lib/db/prisma';

type Params = Promise<{ id: string }>;

export async function POST(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id: postId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: { message: 'Not authenticated', code: 'UNAUTHORIZED' } },
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

    await prisma.momentSave.upsert({
      where: { userId_postId: { userId: user.id, postId } },
      update: {},  // already exists, do nothing
      create: { userId: user.id, postId },
    });

    return NextResponse.json({ saved: true }, { status: 200 });
  } catch (error) {
    console.error('POST /api/moments/[id]/save error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id: postId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: { message: 'Not authenticated', code: 'UNAUTHORIZED' } },
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

    await prisma.momentSave.deleteMany({
      where: { userId: user.id, postId },
    });

    return NextResponse.json({ saved: false });
  } catch (error) {
    console.error('DELETE /api/moments/[id]/save error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
