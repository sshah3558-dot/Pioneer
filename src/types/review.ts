// Review-related types

import { PlaceCard } from './place';
import { UserPreview } from './user';

export interface Review {
  id: string;
  userId: string;
  placeId: string;
  tripId: string | null;

  // Multi-category ratings (1-5)
  overallRating: number;
  valueRating: number | null;
  authenticityRating: number | null;
  crowdRating: number | null; // 1=packed, 5=empty

  // Content
  title: string | null;
  content: string;
  visitedAt: Date | null;

  likeCount: number;

  createdAt: Date;
  updatedAt: Date;

  // Relations (when included)
  user?: UserPreview;
  place?: PlaceCard;
  photos?: Photo[];
  isLiked?: boolean;
}

export interface Photo {
  id: string;
  userId: string;
  placeId: string | null;
  reviewId: string | null;
  tripId: string | null;

  url: string;
  caption: string | null;

  createdAt: Date;
}

// For review cards in lists
export interface ReviewCard {
  id: string;
  overallRating: number;
  title: string | null;
  content: string;
  likeCount: number;
  createdAt: Date;

  user: UserPreview;
  place?: PlaceCard;
  photoCount: number;
  isLiked: boolean;
}

// For creating reviews
export interface CreateReviewInput {
  placeId: string;
  tripId?: string;

  overallRating: number; // Required, 1-5
  valueRating?: number;
  authenticityRating?: number;
  crowdRating?: number;

  title?: string;
  content: string;
  visitedAt?: Date;
}

// Rating category metadata for UI
export const RATING_CATEGORIES = {
  overall: {
    label: 'Overall Experience',
    description: 'How was your overall experience?',
    required: true,
  },
  value: {
    label: 'Value',
    description: 'Was it worth the price?',
    required: false,
  },
  authenticity: {
    label: 'Authenticity',
    description: 'How authentic/local was it?',
    required: false,
  },
  crowd: {
    label: 'Crowd Level',
    description: 'How crowded was it? (5 = empty, 1 = packed)',
    required: false,
    inverted: true, // Lower crowd is better
  },
} as const;

// Helper to display star ratings
export function getRatingLabel(rating: number): string {
  if (rating >= 4.5) return 'Excellent';
  if (rating >= 4) return 'Very Good';
  if (rating >= 3) return 'Good';
  if (rating >= 2) return 'Fair';
  return 'Poor';
}
