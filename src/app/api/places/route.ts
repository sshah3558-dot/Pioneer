import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth/options';
import { prisma } from '@/lib/db/prisma';
import { GetPlacesResponse } from '@/types/api';
import { PlaceCard, PlaceCategory, PriceLevel } from '@/types/place';
import { Prisma } from '@prisma/client';

const VALID_CATEGORIES: PlaceCategory[] = [
  'RESTAURANT', 'CAFE', 'BAR', 'NIGHTCLUB', 'MUSEUM', 'GALLERY',
  'MONUMENT', 'LANDMARK', 'PARK', 'BEACH', 'VIEWPOINT', 'MARKET',
  'SHOP', 'HOTEL', 'HOSTEL', 'TOUR', 'ACTIVITY', 'HIDDEN_GEM', 'OTHER'
];

const querySchema = z.object({
  cityId: z.string().optional(),
  countryId: z.string().optional(),
  categories: z.string().optional(),
  priceLevels: z.string().optional(),
  tags: z.string().optional(),
  minRating: z.coerce.number().optional(),
  maxDuration: z.coerce.number().optional(),
  nearLatitude: z.coerce.number().optional(),
  nearLongitude: z.coerce.number().optional(),
  radiusKm: z.coerce.number().optional(),
  search: z.string().optional(),
  page: z.coerce.number().default(1),
  pageSize: z.coerce.number().max(50).default(20),
  sortBy: z.enum(['distance', 'rating', 'recent', 'reviews']).optional(),
});

function getOrderBy(sortBy: string | undefined): Prisma.PlaceOrderByWithRelationInput {
  switch (sortBy) {
    case 'rating':
      return { avgOverallRating: { sort: 'desc', nulls: 'last' } };
    case 'reviews':
      return { totalReviewCount: 'desc' };
    case 'recent':
      return { createdAt: 'desc' };
    case 'distance':
    default:
      return { createdAt: 'desc' };
  }
}

// GET /api/places - List places with filters
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));

    // Build where clause
    const where: Prisma.PlaceWhereInput = {};

    if (query.cityId) {
      where.cityId = query.cityId;
    }

    if (query.countryId) {
      where.city = { countryId: query.countryId };
    }

    if (query.categories) {
      const categories = query.categories.split(',').filter(c => VALID_CATEGORIES.includes(c as PlaceCategory));
      if (categories.length > 0) {
        where.category = { in: categories as PlaceCategory[] };
      }
    }

    if (query.priceLevels) {
      const priceLevels = query.priceLevels.split(',') as PriceLevel[];
      where.priceLevel = { in: priceLevels };
    }

    if (query.minRating) {
      where.avgOverallRating = { gte: query.minRating };
    }

    if (query.maxDuration) {
      where.estimatedDuration = { lte: query.maxDuration };
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { neighborhood: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    // Get places with pagination
    const [places, total] = await Promise.all([
      prisma.place.findMany({
        where,
        include: {
          tags: true,
          city: {
            include: {
              country: true,
            },
          },
        },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        orderBy: getOrderBy(query.sortBy),
      }),
      prisma.place.count({ where }),
    ]);

    // Check saved status for authenticated user
    let savedIds = new Set<string>();
    if (session?.user?.email) {
      const currentUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });

      if (currentUser) {
        const saves = await prisma.userSave.findMany({
          where: {
            userId: currentUser.id,
            placeId: { in: places.map(p => p.id) },
          },
          select: { placeId: true },
        });
        savedIds = new Set(saves.map(s => s.placeId));
      }
    }

    // Calculate distances if coordinates provided
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
      const R = 6371; // Earth's radius in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    // Transform to PlaceCard
    let items: PlaceCard[] = places.map(place => {
      const distance = query.nearLatitude && query.nearLongitude
        ? calculateDistance(query.nearLatitude, query.nearLongitude, place.latitude, place.longitude)
        : undefined;

      return {
        id: place.id,
        name: place.name,
        category: place.category as PlaceCategory,
        imageUrl: place.imageUrl,
        neighborhood: place.neighborhood,
        avgOverallRating: place.avgOverallRating,
        totalReviewCount: place.totalReviewCount,
        priceLevel: place.priceLevel as PriceLevel | null,
        tags: place.tags.map(t => t.tag),
        distance,
        isSaved: savedIds.has(place.id),
        cityName: place.city.name,
        countryName: place.city.country.name,
      };
    });

    // Filter by radius if provided
    if (query.nearLatitude && query.nearLongitude && query.radiusKm) {
      items = items.filter(item => item.distance !== undefined && item.distance <= query.radiusKm!);
    }

    // Sort by distance if requested
    if (query.sortBy === 'distance' && query.nearLatitude && query.nearLongitude) {
      items.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
    }

    const response: GetPlacesResponse = {
      items,
      total,
      page: query.page,
      pageSize: query.pageSize,
      hasMore: query.page * query.pageSize < total,
    };

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { message: 'Invalid request parameters', code: 'VALIDATION_ERROR' } },
        { status: 400 }
      );
    }
    console.error('GET /api/places error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
