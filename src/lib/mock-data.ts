import { TripCard } from '@/types/trip';
import { PlaceCard } from '@/types/place';
import { UserPreview, UserProfile, InterestCategory } from '@/types/user';
import { ReviewCard } from '@/types/review';

// Mock Users
export const mockUser: UserPreview = {
  id: '1',
  name: 'Rahul Sharma',
  username: 'rahul',
  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
  tripCount: 12,
  followerCount: 1234,
};

export const mockUsers: UserPreview[] = [
  mockUser,
  {
    id: '2',
    name: 'Sneh Patel',
    username: 'sneh',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    tripCount: 8,
    followerCount: 892,
  },
  {
    id: '3',
    name: 'Maya Chen',
    username: 'maya_travels',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
    tripCount: 23,
    followerCount: 4567,
  },
  {
    id: '4',
    name: 'Alex Thompson',
    username: 'alex_adventures',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
    tripCount: 15,
    followerCount: 2341,
  },
];

export const mockCurrentUser: UserProfile = {
  id: '1',
  email: 'rahul@example.com',
  name: 'Rahul Sharma',
  username: 'rahul',
  bio: 'Travel enthusiast exploring the world one city at a time. Based in Mumbai, currently exploring Europe.',
  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
  coverImageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop',
  onboardingComplete: true,
  subscriptionTier: 'FREE',
  tripCount: 12,
  reviewCount: 47,
  followerCount: 1234,
  followingCount: 567,
  defaultTripPublic: true,
  discoverable: true,
  notificationPrefs: null,
  createdAt: new Date('2023-06-15'),
  updatedAt: new Date('2024-01-15'),
  interests: [
    { id: '1', userId: '1', category: 'FOOD_DRINK' as InterestCategory, weight: 9, createdAt: new Date() },
    { id: '2', userId: '1', category: 'PHOTOGRAPHY' as InterestCategory, weight: 8, createdAt: new Date() },
    { id: '3', userId: '1', category: 'LOCAL_EXPERIENCES' as InterestCategory, weight: 7, createdAt: new Date() },
  ],
  socialConnections: [],
};

// Suggested Users for feed sidebar
export interface SuggestedUser {
  id: string;
  name: string;
  avatarUrl: string;
  stat: string;
}

export const mockSuggestedUsers: SuggestedUser[] = [
  {
    id: 's1',
    name: 'Mike Chen',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
    stat: '89 countries',
  },
  {
    id: 's2',
    name: 'Emma Wilson',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop',
    stat: '42 countries',
  },
  {
    id: 's3',
    name: 'James Lee',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop',
    stat: '56 countries',
  },
];

// Mock Trips
export const mockTrips: TripCard[] = [
  {
    id: '1',
    title: 'Barcelona Summer 2024',
    coverImageUrl: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600&h=400&fit=crop',
    startDate: new Date('2024-06-15'),
    endDate: new Date('2024-06-22'),
    likeCount: 247,
    status: 'COMPLETED',
    user: mockUser,
    city: { name: 'Barcelona', country: { name: 'Spain' } },
    stopCount: 8,
    isLiked: false,
  },
  {
    id: '2',
    title: 'Tokyo Food Adventure',
    coverImageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&h=400&fit=crop',
    startDate: new Date('2024-04-01'),
    endDate: new Date('2024-04-10'),
    likeCount: 412,
    status: 'COMPLETED',
    user: mockUsers[1],
    city: { name: 'Tokyo', country: { name: 'Japan' } },
    stopCount: 15,
    isLiked: true,
  },
  {
    id: '3',
    title: 'Lisbon Hidden Gems',
    coverImageUrl: 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=600&h=400&fit=crop',
    startDate: new Date('2024-09-05'),
    endDate: new Date('2024-09-12'),
    likeCount: 189,
    status: 'IN_PROGRESS',
    user: mockUsers[2],
    city: { name: 'Lisbon', country: { name: 'Portugal' } },
    stopCount: 6,
    isLiked: false,
  },
  {
    id: '4',
    title: 'Paris Art & Culture',
    coverImageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&h=400&fit=crop',
    startDate: new Date('2024-03-20'),
    endDate: new Date('2024-03-27'),
    likeCount: 534,
    status: 'COMPLETED',
    user: mockUsers[3],
    city: { name: 'Paris', country: { name: 'France' } },
    stopCount: 12,
    isLiked: true,
  },
];

// Mock Places
export const mockPlaces: PlaceCard[] = [
  {
    id: '1',
    name: 'Manteigaria',
    category: 'CAFE',
    imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop',
    neighborhood: 'Chiado',
    avgOverallRating: 4.6,
    totalReviewCount: 2847,
    priceLevel: 'BUDGET',
    tags: ['foodie', 'local-favorite'],
    isSaved: false,
    cityName: 'Lisbon',
    countryName: 'Portugal',
  },
  {
    id: '2',
    name: 'Time Out Market',
    category: 'MARKET',
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop',
    neighborhood: 'Cais do Sodre',
    avgOverallRating: 4.3,
    totalReviewCount: 5123,
    priceLevel: 'MODERATE',
    tags: ['tourist', 'food-hall'],
    isSaved: true,
    cityName: 'Lisbon',
    countryName: 'Portugal',
  },
  {
    id: '3',
    name: 'Miradouro da Senhora do Monte',
    category: 'VIEWPOINT',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    neighborhood: 'Graca',
    avgOverallRating: 4.8,
    totalReviewCount: 1523,
    priceLevel: 'FREE',
    tags: ['sunset', 'photography'],
    isSaved: false,
    cityName: 'Lisbon',
    countryName: 'Portugal',
  },
  {
    id: '4',
    name: 'LX Factory',
    category: 'ACTIVITY',
    imageUrl: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop',
    neighborhood: 'Alcantara',
    avgOverallRating: 4.5,
    totalReviewCount: 3241,
    priceLevel: 'FREE',
    tags: ['creative', 'shopping', 'art'],
    isSaved: true,
    cityName: 'Lisbon',
    countryName: 'Portugal',
  },
];

// Mock Reviews
export const mockReviews: ReviewCard[] = [
  {
    id: '1',
    overallRating: 5,
    title: 'Best pastel de nata in Lisbon!',
    content: 'Absolutely incredible! The pasteis here are freshly baked and you can watch them being made. The warm, flaky pastry with the creamy custard is perfection. Go early to avoid the crowds.',
    likeCount: 142,
    createdAt: new Date('2024-08-15'),
    user: mockUsers[0],
    place: mockPlaces[0],
    photoCount: 3,
    isLiked: false,
  },
  {
    id: '2',
    overallRating: 4,
    title: 'Great food variety, a bit touristy',
    content: 'Loved the variety of food options here. You can try a bit of everything from different vendors. It does get very crowded, especially on weekends. Come on a weekday for a better experience.',
    likeCount: 89,
    createdAt: new Date('2024-08-10'),
    user: mockUsers[1],
    place: mockPlaces[1],
    photoCount: 5,
    isLiked: true,
  },
  {
    id: '3',
    overallRating: 5,
    title: 'The best sunset view in the city',
    content: 'This viewpoint is less crowded than Santa Luzia and offers even better views. Perfect for sunset - bring some wine and snacks. The walk up is steep but worth it.',
    likeCount: 234,
    createdAt: new Date('2024-08-05'),
    user: mockUsers[2],
    photoCount: 8,
    isLiked: false,
  },
];

// Feed Activity Types
export type FeedActivityType =
  | 'trip_completed'
  | 'trip_started'
  | 'review_posted'
  | 'photos_uploaded'
  | 'place_saved';

export interface FeedActivity {
  id: string;
  type: FeedActivityType;
  user: UserPreview;
  timestamp: Date;
  trip?: TripCard;
  place?: PlaceCard;
  review?: ReviewCard;
  photoCount?: number;
  rating?: number;
}

export const mockFeedActivities: FeedActivity[] = [
  {
    id: '1',
    type: 'trip_completed',
    user: mockUsers[0],
    timestamp: new Date('2024-09-01T14:30:00'),
    trip: mockTrips[0],
  },
  {
    id: '2',
    type: 'review_posted',
    user: mockUsers[1],
    timestamp: new Date('2024-09-01T12:15:00'),
    place: mockPlaces[0],
    review: mockReviews[0],
    rating: 5,
  },
  {
    id: '3',
    type: 'photos_uploaded',
    user: mockUsers[2],
    timestamp: new Date('2024-09-01T10:45:00'),
    trip: mockTrips[2],
    photoCount: 12,
  },
  {
    id: '4',
    type: 'trip_started',
    user: mockUsers[3],
    timestamp: new Date('2024-08-31T18:00:00'),
    trip: mockTrips[3],
  },
  {
    id: '5',
    type: 'place_saved',
    user: mockUsers[1],
    timestamp: new Date('2024-08-31T15:30:00'),
    place: mockPlaces[2],
  },
];

// ===================== Trip Planner Data =====================

export interface TripPlannerMember {
  id: string;
  name: string;
  avatarUrl: string;
}

export interface TripDestination {
  name: string;
  color: string;
}

export interface TripPlannerStats {
  placesSaved: number;
  bookings: number;
  estBudget: string;
}

export interface TripPlannerData {
  id: string;
  title: string;
  status: 'Active' | 'Completed';
  dateRange: string;
  duration: string;
  members?: TripPlannerMember[];
  destinations: TripDestination[];
  progress?: number;
  stats?: TripPlannerStats;
}

export const mockTripPlannerData: TripPlannerData[] = [
  {
    id: 'tp1',
    title: 'Summer Europe Adventure',
    status: 'Active',
    dateRange: 'June 15 - July 30, 2024',
    duration: '45 days',
    members: [
      { id: 'm1', name: 'Rahul', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop' },
      { id: 'm2', name: 'Mike', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop' },
      { id: 'm3', name: 'Lisa', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop' },
      { id: 'm4', name: 'Tom', avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop' },
      { id: 'm5', name: 'Sara', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop' },
    ],
    destinations: [
      { name: 'Paris', color: 'bg-purple-100 text-purple-700' },
      { name: 'Barcelona', color: 'bg-blue-100 text-blue-700' },
      { name: 'Rome', color: 'bg-pink-100 text-pink-700' },
      { name: 'Amsterdam', color: 'bg-green-100 text-green-700' },
    ],
    progress: 68,
    stats: { placesSaved: 23, bookings: 12, estBudget: '$3.2k' },
  },
  {
    id: 'tp2',
    title: 'Japan Cherry Blossom Tour',
    status: 'Completed',
    dateRange: 'March 20 - April 5, 2024',
    duration: '16 days',
    destinations: [
      { name: 'Tokyo', color: 'bg-red-100 text-red-700' },
      { name: 'Kyoto', color: 'bg-orange-100 text-orange-700' },
      { name: 'Osaka', color: 'bg-yellow-100 text-yellow-700' },
    ],
  },
];

// Trip Activity
export interface TripActivityItem {
  id: string;
  userName: string;
  avatarUrl: string;
  action: string;
  timeAgo: string;
}

export const mockTripActivities: TripActivityItem[] = [
  {
    id: 'ta1',
    userName: 'Mike',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
    action: 'added Hotel Le Meurice to Paris',
    timeAgo: '2 hours ago',
  },
  {
    id: 'ta2',
    userName: 'Lisa',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop',
    action: 'voted for La Sagrada Familia',
    timeAgo: '5 hours ago',
  },
  {
    id: 'ta3',
    userName: 'Tom',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop',
    action: 'commented on Rome itinerary',
    timeAgo: '1 day ago',
  },
];

// ===================== Forum Data =====================

export interface ForumPostData {
  id: string;
  title: string;
  author: string;
  avatarUrl: string;
  timeAgo: string;
  description: string;
  category: string;
  categoryEmoji: string;
  categoryColor: string;
  replyCount: number;
  viewCount: string;
  isTrending?: boolean;
}

export const mockForumPosts: ForumPostData[] = [
  {
    id: 'f1',
    title: 'Best hidden restaurants in Tokyo?',
    author: 'foodie_traveler',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
    timeAgo: '3 hours ago',
    description: "Hey pioneers! I'm visiting Tokyo next month and looking for authentic local spots that tourists don't know about. Any recommendations? I love ramen, sushi, and yakitori!",
    category: 'Food',
    categoryEmoji: '🍜',
    categoryColor: 'bg-purple-100 text-purple-700',
    replyCount: 24,
    viewCount: '156',
  },
  {
    id: 'f2',
    title: 'Solo travel safety tips for Southeast Asia',
    author: 'solo_sarah',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
    timeAgo: '1 day ago',
    description: 'Planning my first solo trip through Thailand, Vietnam, and Cambodia. What safety tips do you wish you knew before your first solo adventure?',
    category: 'Tips',
    categoryEmoji: '💡',
    categoryColor: 'bg-green-100 text-green-700',
    replyCount: 67,
    viewCount: '342',
  },
  {
    id: 'f3',
    title: 'Overrated vs Underrated European Cities',
    author: 'europe_expert',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    timeAgo: '2 days ago',
    description: "Let's debate! Which European cities are overrated and which hidden gems deserve more attention? I'll start: Prague is overrated, Ljubljana is underrated.",
    category: 'Discussion',
    categoryEmoji: '🗺️',
    categoryColor: 'bg-orange-100 text-orange-700',
    replyCount: 189,
    viewCount: '2.1k',
    isTrending: true,
  },
];

// Forum Categories
export interface ForumCategory {
  emoji: string;
  label: string;
  count: number;
}

export const mockForumCategories: ForumCategory[] = [
  { emoji: '🍜', label: 'Food & Dining', count: 234 },
  { emoji: '🏨', label: 'Accommodation', count: 156 },
  { emoji: '💡', label: 'Travel Tips', count: 412 },
  { emoji: '📸', label: 'Photography', count: 198 },
  { emoji: '🗺️', label: 'Destinations', count: 567 },
];

// Active Members
export interface ActiveMember {
  id: string;
  name: string;
  avatarUrl: string;
  status: 'online' | 'away';
}

export const mockActiveMembers: ActiveMember[] = [
  {
    id: 'am1',
    name: 'Alex Chen',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
    status: 'online',
  },
  {
    id: 'am2',
    name: 'Maya Patel',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    status: 'online',
  },
  {
    id: 'am3',
    name: 'David Kim',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop',
    status: 'away',
  },
];

// Achievement Badges
export interface AchievementBadge {
  label: string;
  gradient: string;
}

export const mockAchievementBadges: AchievementBadge[] = [
  { label: '🌟 Top Reviewer', gradient: 'from-yellow-400 to-orange-500' },
  { label: '🗺️ Globe Trotter', gradient: 'from-blue-400 to-purple-500' },
  { label: '💎 Hidden Gem Hunter', gradient: 'from-green-400 to-emerald-500' },
  { label: '📸 Photography Pro', gradient: 'from-pink-400 to-red-500' },
];
