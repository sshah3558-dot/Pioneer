import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

// GET /api/forums - List all forums
export async function GET() {
  try {
    const forums = await prisma.forum.findMany({
      select: {
        id: true, name: true, slug: true, description: true, postCount: true,
        country: { select: { name: true } },
        city: { select: { name: true } },
      },
      orderBy: { postCount: 'desc' },
      take: 100,
    });

    const response = NextResponse.json({
      forums: forums.map((f) => ({
        id: f.id,
        name: f.name,
        slug: f.slug,
        description: f.description,
        postCount: f.postCount,
        countryName: f.country?.name,
        cityName: f.city?.name,
      })),
    });
    response.headers.set('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1200');
    return response;
  } catch (error) {
    console.error('GET /api/forums error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
