// Trip-related types

import { PlaceCard } from './place';
import { UserPreview } from './user';

export type TripStatus = 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED';

export interface Trip {
  id: string;
  userId: string;
  cityId: string;

  title: string;
  description: string | null;
  startDate: Date | null;
  endDate: Date | null;

  isPublic: boolean;
  coverImageUrl: string | null;

  likeCount: number;
  viewCount: number;

  status: TripStatus;

  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;

  // Relations (when included)
  user?: UserPreview;
  city?: { id: string; name: string; country: { name: string } };
  stops?: TripStop[];
  isLiked?: boolean;
}

export interface TripStop {
  id: string;
  tripId: string;
  placeId: string;

  dayNumber: number | null;
  orderInDay: number;

  notes: string | null;

  arrivalTime: Date | null;
  departureTime: Date | null;

  createdAt: Date;

  // Relations
  place?: PlaceCard;
}

// For trip cards in feed/list
export interface TripCard {
  id: string;
  title: string;
  coverImageUrl: string | null;
  startDate: Date | null;
  endDate: Date | null;
  likeCount: number;
  status: TripStatus;

  user: UserPreview;
  city: { name: string; country: { name: string } };
  stopCount: number;

  isLiked: boolean;
}

// For creating/editing trips
export interface CreateTripInput {
  cityId: string;
  title: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  isPublic?: boolean;
  coverImageUrl?: string;
}

export interface UpdateTripInput {
  title?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  isPublic?: boolean;
  coverImageUrl?: string;
  status?: TripStatus;
}

// For adding stops to a trip
export interface AddTripStopInput {
  placeId: string;
  dayNumber?: number;
  orderInDay?: number;
  notes?: string;
  arrivalTime?: Date;
  departureTime?: Date;
}

// Trip filters for feed
export interface TripFilters {
  userId?: string;         // Trips by specific user
  cityId?: string;         // Trips to specific city
  countryId?: string;      // Trips to specific country
  followingOnly?: boolean; // Only from users I follow
  status?: TripStatus;     // Filter by status
}
