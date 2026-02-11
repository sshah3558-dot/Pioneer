// Place-related types

import { UserPreview } from './user';

export type PlaceCategory =
  | 'RESTAURANT'
  | 'CAFE'
  | 'BAR'
  | 'NIGHTCLUB'
  | 'MUSEUM'
  | 'GALLERY'
  | 'MONUMENT'
  | 'LANDMARK'
  | 'PARK'
  | 'BEACH'
  | 'VIEWPOINT'
  | 'MARKET'
  | 'SHOP'
  | 'HOTEL'
  | 'HOSTEL'
  | 'TOUR'
  | 'ACTIVITY'
  | 'HIDDEN_GEM'
  | 'OTHER';

export type PriceLevel = 'FREE' | 'BUDGET' | 'MODERATE' | 'EXPENSIVE' | 'LUXURY';

export interface Place {
  id: string;
  cityId: string;
  createdById: string;

  name: string;
  description: string | null;
  category: PlaceCategory;

  // Location
  latitude: number;
  longitude: number;
  address: string;
  neighborhood: string | null;

  // Attributes
  estimatedDuration: number | null; // minutes
  priceLevel: PriceLevel | null;

  // Media
  imageUrl: string | null;

  // Google Places integration
  googlePlaceId: string | null;

  // Aggregated ratings
  avgOverallRating: number | null;
  avgValueRating: number | null;
  avgAuthenticityRating: number | null;
  avgCrowdRating: number | null;
  totalReviewCount: number;

  createdAt: Date;
  updatedAt: Date;

  // Relations (when included)
  city?: City;
  createdBy?: UserPreview;
  tags?: string[];
  isSaved?: boolean;
}

export interface City {
  id: string;
  countryId: string;
  name: string;
  latitude: number;
  longitude: number;
  timezone: string;
  imageUrl: string | null;
  active: boolean;
  country?: Country;
}

export interface Country {
  id: string;
  name: string;
  code: string; // ISO 3166-1 alpha-2
  imageUrl: string | null;
}

// For place cards in list view
export interface PlaceCard {
  id: string;
  name: string;
  category: PlaceCategory;
  imageUrl: string | null;
  neighborhood: string | null;
  avgOverallRating: number | null;
  totalReviewCount: number;
  priceLevel: PriceLevel | null;
  tags: string[];
  distance?: number; // km from user
  isSaved: boolean;
  cityName?: string;
  countryName?: string;
}

// Place filters for search/browse
export interface PlaceFilters {
  cityId?: string;
  countryId?: string;
  categories?: PlaceCategory[];
  priceLevels?: PriceLevel[];
  tags?: string[];
  minRating?: number;
  maxDuration?: number;
  nearLatitude?: number;
  nearLongitude?: number;
  radiusKm?: number;
  search?: string;
}

// For adding a new place
export interface CreatePlaceInput {
  cityId: string;
  name: string;
  description?: string;
  category: PlaceCategory;
  latitude: number;
  longitude: number;
  address: string;
  neighborhood?: string;
  estimatedDuration?: number;
  priceLevel?: PriceLevel;
  tags?: string[];
  googlePlaceId?: string;
}

// Category metadata for UI
export const PLACE_CATEGORIES: Record<PlaceCategory, { label: string; icon: string }> = {
  RESTAURANT: { label: 'Restaurant', icon: '🍽️' },
  CAFE: { label: 'Cafe', icon: '☕' },
  BAR: { label: 'Bar', icon: '🍸' },
  NIGHTCLUB: { label: 'Nightclub', icon: '🎵' },
  MUSEUM: { label: 'Museum', icon: '🏛️' },
  GALLERY: { label: 'Gallery', icon: '🎨' },
  MONUMENT: { label: 'Monument', icon: '🗽' },
  LANDMARK: { label: 'Landmark', icon: '📍' },
  PARK: { label: 'Park', icon: '🌳' },
  BEACH: { label: 'Beach', icon: '🏖️' },
  VIEWPOINT: { label: 'Viewpoint', icon: '👀' },
  MARKET: { label: 'Market', icon: '🛒' },
  SHOP: { label: 'Shop', icon: '🛍️' },
  HOTEL: { label: 'Hotel', icon: '🏨' },
  HOSTEL: { label: 'Hostel', icon: '🛏️' },
  TOUR: { label: 'Tour', icon: '🚶' },
  ACTIVITY: { label: 'Activity', icon: '🎯' },
  HIDDEN_GEM: { label: 'Hidden Gem', icon: '💎' },
  OTHER: { label: 'Other', icon: '📌' },
};

export const PRICE_LEVELS: Record<PriceLevel, { label: string; symbol: string }> = {
  FREE: { label: 'Free', symbol: 'Free' },
  BUDGET: { label: 'Budget', symbol: '$' },
  MODERATE: { label: 'Moderate', symbol: '$$' },
  EXPENSIVE: { label: 'Expensive', symbol: '$$$' },
  LUXURY: { label: 'Luxury', symbol: '$$$$' },
};
