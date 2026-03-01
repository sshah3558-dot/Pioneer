import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { verifyPassword } from '@/lib/auth/password';
import { rateLimit } from '@/lib/security/rate-limiter';
import { User } from '@/types/user';
import jwt from 'jsonwebtoken';

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 10 requests per minute per IP (same as web login)
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const { allowed, remaining } = rateLimit(`mobile-login:${ip}`, 10, 60_000);
    if (!allowed) {
      return NextResponse.json(
        { error: { message: 'Too many requests. Please try again later.', code: 'RATE_LIMITED' } },
        { status: 429, headers: { 'X-RateLimit-Remaining': String(remaining) } }
      );
    }

    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return NextResponse.json(
        { error: { message: firstError.message, code: 'VALIDATION_ERROR' } },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({
      where: { email },
      include: { interests: true },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: { message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' } },
        { status: 401 }
      );
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: { message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' } },
        { status: 401 }
      );
    }

    const secret = process.env.NEXTAUTH_SECRET || 'dev-secret';
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        username: user.username,
        onboardingComplete: user.onboardingComplete,
      },
      secret,
      { expiresIn: '30d' }
    );

    // Strip passwordHash from the response
    const safeUser: User & { interests: typeof user.interests } = {
      id: user.id,
      email: user.email,
      name: user.name,
      username: user.username,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      coverImageUrl: user.coverImageUrl,
      onboardingComplete: user.onboardingComplete,
      subscriptionTier: user.subscriptionTier as User['subscriptionTier'],
      tripCount: user.tripCount,
      reviewCount: user.reviewCount,
      followerCount: user.followerCount,
      followingCount: user.followingCount,
      defaultTripPublic: user.defaultTripPublic,
      discoverable: user.discoverable,
      notificationPrefs: user.notificationPrefs as User['notificationPrefs'],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      interests: user.interests,
    };

    return NextResponse.json({ token, user: safeUser });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return NextResponse.json(
        { error: { message: firstError.message, code: 'VALIDATION_ERROR' } },
        { status: 400 }
      );
    }
    console.error('POST /api/auth/mobile-login error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
