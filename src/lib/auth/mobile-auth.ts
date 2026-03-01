import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from './options';
import { prisma } from '@/lib/db/prisma';
import jwt from 'jsonwebtoken';

interface MobileToken {
  id: string;
  email: string;
  username: string | null;
  onboardingComplete: boolean;
}

const USER_SELECT = {
  id: true,
  email: true,
  username: true,
  name: true,
  avatarUrl: true,
  onboardingComplete: true,
} as const;

/**
 * Get the current user from either NextAuth session (web) or Bearer token (mobile).
 *
 * Usage in API routes:
 *   const user = await getCurrentUser(request);
 *   if (!user) return NextResponse.json({ error: ... }, { status: 401 });
 */
export async function getCurrentUser(request?: NextRequest) {
  // Try NextAuth session first (web)
  const session = await getServerSession(authOptions);
  if (session?.user?.email) {
    return prisma.user.findUnique({
      where: { email: session.user.email },
      select: USER_SELECT,
    });
  }

  // Try Bearer token (mobile)
  if (request) {
    const auth = request.headers.get('authorization');
    if (auth?.startsWith('Bearer ')) {
      try {
        const secret = process.env.NEXTAUTH_SECRET;
        if (!secret) {
          if (process.env.NODE_ENV === 'production') return null;
          // dev-only fallback
        }
        const signingSecret = secret || 'dev-secret';
        const decoded = jwt.verify(auth.slice(7), signingSecret) as MobileToken;
        return prisma.user.findUnique({
          where: { email: decoded.email },
          select: USER_SELECT,
        });
      } catch {
        return null;
      }
    }
  }

  return null;
}
