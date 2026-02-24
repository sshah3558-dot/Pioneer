import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth/options';
import { prisma } from '@/lib/db/prisma';
import { verifyPassword } from '@/lib/auth/password';

const changeEmailSchema = z.object({
  newEmail: z.string().email('Invalid email address'),
  currentPassword: z.string().min(1, 'Current password is required'),
});

// PATCH /api/users/me/email - Change email
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
    const data = changeEmailSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { passwordHash: true },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: { message: 'Cannot change email for this account type', code: 'NO_PASSWORD' } },
        { status: 400 }
      );
    }

    // Verify current password
    const isValid = await verifyPassword(data.currentPassword, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: { message: 'Current password is incorrect', code: 'INVALID_PASSWORD' } },
        { status: 400 }
      );
    }

    // Check if new email is already taken
    const existingUser = await prisma.user.findUnique({
      where: { email: data.newEmail },
    });
    if (existingUser) {
      return NextResponse.json(
        { error: { message: 'Email is already in use', code: 'EMAIL_EXISTS' } },
        { status: 400 }
      );
    }

    // Update email
    await prisma.user.update({
      where: { email: session.user.email },
      data: { email: data.newEmail },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { message: error.issues[0].message, code: 'VALIDATION_ERROR' } },
        { status: 400 }
      );
    }
    console.error('PATCH /api/users/me/email error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
