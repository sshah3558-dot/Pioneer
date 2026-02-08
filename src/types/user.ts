// User-related types

export type SubscriptionTier = 'FREE' | 'PREMIUM';

export type InterestCategory =
  | 'FOOD_DRINK'
  | 'ART_CULTURE'
  | 'OUTDOORS_NATURE'
  | 'NIGHTLIFE'
  | 'SHOPPING'
  | 'HISTORY'
  | 'ADVENTURE'
  | 'RELAXATION'
  | 'PHOTOGRAPHY'
  | 'LOCAL_EXPERIENCES'
  | 'ARCHITECTURE'
  | 'MUSIC'
  | 'SPORTS'
  | 'WELLNESS';

export type SocialPlatform = 'INSTAGRAM' | 'TIKTOK';

export interface User {
  id: string;
  email: string;
  name: string | null;
  username: string | null;
  bio: string | null;
  avatarUrl: string | null;
  coverImageUrl: string | null;
  onboardingComplete: boolean;
  subscriptionTier: SubscriptionTier;

  // Stats
  tripCount: number;
  reviewCount: number;
  followerCount: number;
  followingCount: number;

  createdAt: Date;
  updatedAt: Date;
}

export interface UserInterest {
  id: string;
  userId: string;
  category: InterestCategory;
  weight: number; // 1-10
  createdAt: Date;
}

export interface SocialConnection {
  id: string;
  userId: string;
  platform: SocialPlatform;
  connectedAt: Date;
  expiresAt: Date | null;
}

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: Date;
}

// For onboarding survey
export interface OnboardingSurveyAnswer {
  category: InterestCategory;
  weight: number;
}

// User profile for display
export interface UserProfile extends User {
  interests: UserInterest[];
  socialConnections: SocialConnection[];
  isFollowing?: boolean; // If viewing another user's profile
}

// Compact user info for lists/cards
export interface UserPreview {
  id: string;
  name: string | null;
  username: string | null;
  avatarUrl: string | null;
  tripCount: number;
  followerCount: number;
}

// Interest category metadata for UI
export const INTEREST_CATEGORIES: Record<InterestCategory, { label: string; icon: string; description: string }> = {
  FOOD_DRINK: {
    label: 'Food & Drink',
    icon: '🍽️',
    description: 'Local cuisine, street food, cafes, restaurants, bars',
  },
  ART_CULTURE: {
    label: 'Art & Culture',
    icon: '🎨',
    description: 'Museums, galleries, street art, cultural sites',
  },
  OUTDOORS_NATURE: {
    label: 'Outdoors & Nature',
    icon: '🌿',
    description: 'Parks, gardens, hikes, beaches, viewpoints',
  },
  NIGHTLIFE: {
    label: 'Nightlife',
    icon: '🌙',
    description: 'Bars, clubs, live music, late-night spots',
  },
  SHOPPING: {
    label: 'Shopping',
    icon: '🛍️',
    description: 'Markets, boutiques, vintage shops, local crafts',
  },
  HISTORY: {
    label: 'History',
    icon: '🏛️',
    description: 'Historical sites, monuments, walking tours',
  },
  ADVENTURE: {
    label: 'Adventure',
    icon: '🎢',
    description: 'Thrilling activities, unique experiences, off-the-beaten-path',
  },
  RELAXATION: {
    label: 'Relaxation',
    icon: '☕',
    description: 'Quiet cafes, spas, peaceful spots, slow travel',
  },
  PHOTOGRAPHY: {
    label: 'Photography',
    icon: '📸',
    description: 'Instagrammable spots, viewpoints, unique visuals',
  },
  LOCAL_EXPERIENCES: {
    label: 'Local Experiences',
    icon: '👥',
    description: 'Authentic local life, hidden gems, neighborhood vibes',
  },
  ARCHITECTURE: {
    label: 'Architecture',
    icon: '🏗️',
    description: 'Buildings, design, urban exploration',
  },
  MUSIC: {
    label: 'Music',
    icon: '🎵',
    description: 'Live music, concerts, music venues, local sounds',
  },
  SPORTS: {
    label: 'Sports',
    icon: '⚽',
    description: 'Sports venues, activities, local games',
  },
  WELLNESS: {
    label: 'Wellness',
    icon: '🧘',
    description: 'Yoga, meditation, healthy spots, self-care',
  },
};
