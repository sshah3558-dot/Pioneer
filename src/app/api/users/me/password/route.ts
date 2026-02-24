import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth/options';
import { prisma } from '@/lib/db/prisma';
import { verifyPassword, hashPassword, validatePasswordStrength } from '@/lib/auth/password';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(1, 'New password is required'),
});

// PATCH /api/users/me/password - Change password
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
    const data = changePasswordSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { passwordHash: true },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: { message: 'Cannot change password for this account type', code: 'NO_PASSWORD' } },
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

    // Validate new password strength
    const strength = validatePasswordStrength(data.newPassword);
    if (!strength.valid) {
      return NextResponse.json(
        { error: { message: strength.message!, code: 'WEAK_PASSWORD' } },
        { status: 400 }
      );
    }

    // Hash and update
    const newHash = await hashPassword(data.newPassword);
    await prisma.user.update({
      where: { email: session.user.email },
      data: { passwordHash: newHash },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { message: error.issues[0].message, code: 'VALIDATION_ERROR' } },
        { status: 400 }
      );
    }
    console.error('PATCH /api/users/me/password error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
