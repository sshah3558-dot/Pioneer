import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { hashPassword, validatePasswordStrength } from '@/lib/auth/password';
import { rateLimit } from '@/lib/security/rate-limiter';
import { SignupResponse } from '@/types/api';
import { User } from '@/types/user';

const signupSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().optional(),
  username: z.string().min(3, 'Username must be at least 3 characters').optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5 requests per minute per IP
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const { allowed, remaining } = rateLimit(ip, 5, 60_000);
    if (!allowed) {
      return NextResponse.json(
        { error: { message: 'Too many requests. Please try again later.', code: 'RATE_LIMITED' } },
        { status: 429, headers: { 'X-RateLimit-Remaining': String(remaining) } }
      );
    }

    const body = await request.json();
    const data = signupSchema.parse(body);

    // Validate password strength
    const passwordCheck = validatePasswordStrength(data.password);
    if (!passwordCheck.valid) {
      return NextResponse.json(
        { error: { message: passwordCheck.message, code: 'WEAK_PASSWORD' } },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingEmail) {
      return NextResponse.json(
        { error: { message: 'Email already registered', code: 'EMAIL_EXISTS' } },
        { status: 400 }
      );
    }

    // Check if username already exists (if provided)
    if (data.username) {
      const existingUsername = await prisma.user.findUnique({
        where: { username: data.username },
      });
      if (existingUsername) {
        return NextResponse.json(
          { error: { message: 'Username already taken', code: 'USERNAME_EXISTS' } },
          { status: 400 }
        );
      }
    }

    // Hash password and create user
    const passwordHash = await hashPassword(data.password);
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name || null,
        username: data.username || null,
      },
    });

    const response: SignupResponse = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        coverImageUrl: user.coverImageUrl,
        onboardingComplete: user.onboardingComplete,
        subscriptionTier: user.subscriptionTier,
        tripCount: user.tripCount,
        reviewCount: user.reviewCount,
        followerCount: user.followerCount,
        followingCount: user.followingCount,
        defaultTripPublic: user.defaultTripPublic,
        discoverable: user.discoverable,
        notificationPrefs: user.notificationPrefs as User['notificationPrefs'],
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return NextResponse.json(
        { error: { message: firstError.message, code: 'VALIDATION_ERROR' } },
        { status: 400 }
      );
    }
    console.error('POST /api/auth/signup error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
