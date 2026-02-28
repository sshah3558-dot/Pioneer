import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

// GET /api/cities - List or search cities
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    const cities = await prisma.city.findMany({
      where: search
        ? { name: { contains: search, mode: 'insensitive' } }
        : { active: true },
      select: {
        id: true,
        name: true,
        country: { select: { name: true } },
      },
      orderBy: { name: 'asc' },
      take: 20,
    });

    const response = NextResponse.json({ cities });
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=7200');
    return response;
  } catch (error) {
    console.error('GET /api/cities error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
