// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { prisma } from '@/lib/db/prisma';
import { GetTripResponse } from '@/types/api';
import { TripStatus } from '@/types/trip';
import { PlaceCategory, PriceLevel } from '@/types/place';

type Params = Promise<{ id: string }>;

// GET /api/trips/[id] - Get trip details
export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatarUrl: true,
            tripCount: true,
            followerCount: true,
          },
        },
        city: {
          include: {
            country: true,
          },
        },
        stops: {
          include: {
            place: {
              include: {
                tags: true,
              },
            },
          },
          orderBy: [
            { dayNumber: 'asc' },
            { orderInDay: 'asc' },
          ],
        },
      },
    });

    if (!trip) {
      return NextResponse.json(
        { error: { message: 'Trip not found', code: 'NOT_FOUND' } },
        { status: 404 }
      );
    }

    // Check if user has access (public trip or owner)
    let isOwner = false;
    if (session?.user?.email) {
      const currentUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });
      if (currentUser) {
        isOwner = currentUser.id === trip.userId;
      }
    }

    if (!trip.isPublic && !isOwner) {
      return NextResponse.json(
        { error: { message: 'Trip not found', code: 'NOT_FOUND' } },
        { status: 404 }
      );
    }

    // Check if liked by current user
    let isLiked = false;
    if (session?.user?.email) {
      const currentUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });

      if (currentUser) {
        const like = await prisma.tripLike.findUnique({
          where: {
            userId_tripId: {
              userId: currentUser.id,
              tripId: trip.id,
            },
          },
        });
        isLiked = !!like;
      }
    }

    // Increment view count
    await prisma.trip.update({
      where: { id: trip.id },
      data: { viewCount: { increment: 1 } },
    });

    const response: GetTripResponse = {
      trip: {
        id: trip.id,
        userId: trip.userId,
        cityId: trip.cityId,
        title: trip.title,
        description: trip.description,
        startDate: trip.startDate,
        endDate: trip.endDate,
        isPublic: trip.isPublic,
        coverImageUrl: trip.coverImageUrl,
        likeCount: trip.likeCount,
        viewCount: trip.viewCount + 1,
        status: trip.status as TripStatus,
        createdAt: trip.createdAt,
        updatedAt: trip.updatedAt,
        publishedAt: trip.publishedAt,
        user: trip.user,
        city: {
          id: trip.city.id,
          name: trip.city.name,
          country: { name: trip.city.country.name },
        },
        stops: trip.stops.map(stop => ({
          id: stop.id,
          tripId: stop.tripId,
          placeId: stop.placeId,
          dayNumber: stop.dayNumber,
          orderInDay: stop.orderInDay,
          notes: stop.notes,
          arrivalTime: stop.arrivalTime,
          departureTime: stop.departureTime,
          createdAt: stop.createdAt,
          place: {
            id: stop.place.id,
            name: stop.place.name,
            category: stop.place.category as PlaceCategory,
            imageUrl: stop.place.imageUrl,
            neighborhood: stop.place.neighborhood,
            avgOverallRating: stop.place.avgOverallRating,
            totalReviewCount: stop.place.totalReviewCount,
            priceLevel: stop.place.priceLevel as PriceLevel | null,
            tags: stop.place.tags.map(t => t.tag),
            isSaved: false,
          },
        })),
        isLiked,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('GET /api/trips/[id] error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
