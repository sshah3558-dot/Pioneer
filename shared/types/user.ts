export type SubscriptionTier = 'FREE' | 'PREMIUM';

export type InterestCategory =
  | 'FOOD_DRINK' | 'ART_CULTURE' | 'OUTDOORS_NATURE' | 'NIGHTLIFE'
  | 'SHOPPING' | 'HISTORY' | 'ADVENTURE' | 'RELAXATION' | 'PHOTOGRAPHY'
  | 'LOCAL_EXPERIENCES' | 'ARCHITECTURE' | 'MUSIC' | 'SPORTS' | 'WELLNESS';

export interface UserPreview {
  id: string;
  name: string | null;
  username: string | null;
  avatarUrl: string | null;
  tripCount: number;
  followerCount: number;
}

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
  tripCount: number;
  reviewCount: number;
  followerCount: number;
  followingCount: number;
  createdAt: string;
}

export interface UserInterest {
  id: string;
  userId: string;
  category: InterestCategory;
  weight: number;
}

export interface UserProfile extends User {
  interests: UserInterest[];
  isFollowing?: boolean;
}
