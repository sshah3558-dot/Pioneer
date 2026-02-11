// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { prisma } from '@/lib/db/prisma';
import { GetPlaceResponse } from '@/types/api';
import { PlaceCategory, PriceLevel } from '@/types/place';

type Params = Promise<{ id: string }>;

// GET /api/places/[id] - Get place details
export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    const place = await prisma.place.findUnique({
      where: { id },
      include: {
        tags: true,
        city: {
          include: {
            country: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            username: true,
            avatarUrl: true,
            tripCount: true,
            followerCount: true,
          },
        },
      },
    });

    if (!place) {
      return NextResponse.json(
        { error: { message: 'Place not found', code: 'NOT_FOUND' } },
        { status: 404 }
      );
    }

    // Check if saved by current user
    let isSaved = false;
    if (session?.user?.email) {
      const currentUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });

      if (currentUser) {
        const save = await prisma.userSave.findUnique({
          where: {
            userId_placeId: {
              userId: currentUser.id,
              placeId: place.id,
            },
          },
        });
        isSaved = !!save;
      }
    }

    const response: GetPlaceResponse = {
      place: {
        id: place.id,
        cityId: place.cityId,
        createdById: place.createdById,
        name: place.name,
        description: place.description,
        category: place.category as PlaceCategory,
        latitude: place.latitude,
        longitude: place.longitude,
        address: place.address,
        neighborhood: place.neighborhood,
        estimatedDuration: place.estimatedDuration,
        priceLevel: place.priceLevel as PriceLevel | null,
        imageUrl: place.imageUrl,
        googlePlaceId: place.googlePlaceId,
        avgOverallRating: place.avgOverallRating,
        avgValueRating: place.avgValueRating,
        avgAuthenticityRating: place.avgAuthenticityRating,
        avgCrowdRating: place.avgCrowdRating,
        totalReviewCount: place.totalReviewCount,
        createdAt: place.createdAt,
        updatedAt: place.updatedAt,
        city: {
          id: place.city.id,
          countryId: place.city.countryId,
          name: place.city.name,
          latitude: place.city.latitude,
          longitude: place.city.longitude,
          timezone: place.city.timezone,
          imageUrl: place.city.imageUrl,
          active: place.city.active,
          country: {
            id: place.city.country.id,
            name: place.city.country.name,
            code: place.city.country.code,
            imageUrl: place.city.country.imageUrl,
          },
        },
        createdBy: {
          id: place.createdBy.id,
          name: place.createdBy.name,
          username: place.createdBy.username,
          avatarUrl: place.createdBy.avatarUrl,
          tripCount: place.createdBy.tripCount,
          followerCount: place.createdBy.followerCount,
        },
        tags: place.tags.map(t => t.tag),
        isSaved,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('GET /api/places/[id] error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
