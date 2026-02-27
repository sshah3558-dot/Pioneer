// API request/response types

import { Place, PlaceCard, PlaceFilters, CreatePlaceInput } from './place';
import { Trip, TripCard, TripFilters, CreateTripInput, UpdateTripInput, AddTripStopInput } from './trip';
import { Review, ReviewCard, CreateReviewInput } from './review';
import { OnboardingSurveyAnswer, User, UserInterest, UserProfile, UserPreview } from './user';

// ============================================
// GENERIC API RESPONSE
// ============================================

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  message: string;
  code: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================
// AUTH ENDPOINTS
// ============================================

// POST /api/auth/signup
export interface SignupRequest {
  email: string;
  password: string;
  name?: string;
  username?: string;
}

export interface SignupResponse {
  user: User;
}

// POST /api/auth/login
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
}

// GET /api/auth/me
export interface MeResponse {
  user: UserProfile;
}

// ============================================
// USER ENDPOINTS
// ============================================

// GET /api/users/:username
export interface GetUserResponse {
  user: UserProfile;
}

// PUT /api/users/me
export interface UpdateUserRequest {
  name?: string;
  username?: string;
  bio?: string;
  avatarUrl?: string;
  coverImageUrl?: string;
  defaultTripPublic?: boolean;
  discoverable?: boolean;
  notificationPrefs?: {
    emailOnFollow: boolean;
    emailOnReviewLike: boolean;
    emailOnTripLike: boolean;
    emailOnForumReply: boolean;
  };
}

// GET /api/users/me/interests
export interface GetInterestsResponse {
  interests: UserInterest[];
}

// PUT /api/users/me/interests
export interface UpdateInterestsRequest {
  interests: OnboardingSurveyAnswer[];
}

// POST /api/users/me/onboarding/complete
export interface CompleteOnboardingResponse {
  user: User;
}

// ============================================
// FOLLOW ENDPOINTS
// ============================================

// POST /api/users/:userId/follow
export interface FollowUserResponse {
  following: boolean;
}

// DELETE /api/users/:userId/follow
export interface UnfollowUserResponse {
  following: boolean;
}

// GET /api/users/:userId/followers
export interface GetFollowersResponse extends PaginatedResponse<UserPreview> {}

// GET /api/users/:userId/following
export interface GetFollowingResponse extends PaginatedResponse<UserPreview> {}

// ============================================
// PLACE ENDPOINTS
// ============================================

// GET /api/places
export interface GetPlacesRequest extends PlaceFilters {
  page?: number;
  pageSize?: number;
  sortBy?: 'distance' | 'rating' | 'recent' | 'reviews';
}

export interface GetPlacesResponse extends PaginatedResponse<PlaceCard> {}

// GET /api/places/:id
export interface GetPlaceResponse {
  place: Place;
}

// POST /api/places
export interface CreatePlaceRequest extends CreatePlaceInput {}

export interface CreatePlaceResponse {
  place: Place;
}

// POST /api/places/:id/save
export interface SavePlaceResponse {
  saved: boolean;
}

// DELETE /api/places/:id/save
export interface UnsavePlaceResponse {
  saved: boolean;
}

// GET /api/users/me/saves
export interface GetSavedPlacesResponse extends PaginatedResponse<PlaceCard> {}

// ============================================
// REVIEW ENDPOINTS
// ============================================

// GET /api/places/:placeId/reviews
export interface GetPlaceReviewsRequest {
  page?: number;
  pageSize?: number;
  sortBy?: 'recent' | 'helpful' | 'rating';
}

export interface GetPlaceReviewsResponse extends PaginatedResponse<ReviewCard> {}

// POST /api/places/:placeId/reviews
export interface CreateReviewRequest extends CreateReviewInput {}

export interface CreateReviewResponse {
  review: Review;
}

// POST /api/reviews/:reviewId/like
export interface LikeReviewResponse {
  liked: boolean;
  likeCount: number;
}

// GET /api/users/:userId/reviews
export interface GetUserReviewsResponse extends PaginatedResponse<ReviewCard> {}

// ============================================
// TRIP ENDPOINTS
// ============================================

// GET /api/trips (feed)
export interface GetTripsRequest extends TripFilters {
  page?: number;
  pageSize?: number;
  sortBy?: 'recent' | 'popular';
}

export interface GetTripsResponse extends PaginatedResponse<TripCard> {}

// GET /api/trips/:id
export interface GetTripResponse {
  trip: Trip;
}

// POST /api/trips
export interface CreateTripRequest extends CreateTripInput {}

export interface CreateTripResponse {
  trip: Trip;
}

// PUT /api/trips/:id
export interface UpdateTripRequest extends UpdateTripInput {}

export interface UpdateTripResponse {
  trip: Trip;
}

// DELETE /api/trips/:id
export interface DeleteTripResponse {
  deleted: boolean;
}

// POST /api/trips/:id/stops
export interface AddTripStopRequest extends AddTripStopInput {}

export interface AddTripStopResponse {
  stop: { id: string; placeId: string; dayNumber: number | null; orderInDay: number };
}

// DELETE /api/trips/:tripId/stops/:stopId
export interface RemoveTripStopResponse {
  deleted: boolean;
}

// POST /api/trips/:id/like
export interface LikeTripResponse {
  liked: boolean;
  likeCount: number;
}

// GET /api/users/:userId/trips
export interface GetUserTripsResponse extends PaginatedResponse<TripCard> {}

// ============================================
// FEED/RECOMMENDATIONS ENDPOINTS
// ============================================

// GET /api/feed
// Returns trip reports from people user follows
export interface GetFeedRequest {
  page?: number;
  pageSize?: number;
}

export type FeedItemType = 'trip' | 'review' | 'follow' | 'post';

export interface FeedItem {
  id: string;
  type: FeedItemType;
  createdAt: string;
  trip?: TripCard;
  review?: ReviewCard;
  follow?: { follower: UserPreview; following: UserPreview };
  post?: {
    id: string;
    content: string;
    imageUrl: string | null;
    imageUrl2: string | null;
    imageUrl3: string | null;
    overallRating: number | null;
    valueRating: number | null;
    authenticityRating: number | null;
    crowdRating: number | null;
    compositeScore: number | null;
    likeCount: number;
    user: UserPreview;
    createdAt: string;
    place?: {
      id: string;
      name: string;
      category: string;
      imageUrl: string | null;
      cityName?: string;
      countryName?: string;
    } | null;
  };
}

export interface GetFeedResponse extends PaginatedResponse<FeedItem> {}

// GET /api/recommendations
// Personalized place recommendations based on trips from similar users
export interface GetRecommendationsRequest {
  cityId?: string;
  latitude?: number;
  longitude?: number;
  maxDuration?: number;
  limit?: number;
}

export interface GetRecommendationsResponse {
  places: PlaceCard[];
  basedOn?: {
    trips: TripCard[];  // "Recommended because users like you enjoyed..."
    users: UserPreview[]; // "Travelers with similar taste"
  };
}

// GET /api/discover
// Spontaneous discovery: "I have X hours"
export interface DiscoverRequest {
  cityId: string;
  availableMinutes: number;
  latitude?: number;
  longitude?: number;
  categories?: string[];
  priceLevels?: string[];
}

export interface DiscoverResponse {
  places: PlaceCard[];
  fromTrips: TripCard[]; // "These places are from trips by..."
}

// ============================================
// LOCATION ENDPOINTS
// ============================================

// GET /api/countries
export interface GetCountriesResponse {
  countries: {
    id: string;
    name: string;
    code: string;
    imageUrl: string | null;
    cityCount: number;
  }[];
}

// GET /api/countries/:countryId/cities
export interface GetCitiesResponse {
  cities: {
    id: string;
    name: string;
    imageUrl: string | null;
    placeCount: number;
    tripCount: number;
  }[];
}

// ============================================
// FORUM ENDPOINTS
// ============================================

// GET /api/forums
export interface GetForumsResponse {
  forums: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    postCount: number;
    countryName?: string;
    cityName?: string;
  }[];
}

// GET /api/forums/:slug/posts
export interface GetForumPostsRequest {
  page?: number;
  pageSize?: number;
}

export interface GetForumPostsResponse extends PaginatedResponse<{
  id: string;
  title: string;
  content: string;
  user: UserPreview;
  commentCount: number;
  viewCount: number;
  isPinned: boolean;
  createdAt: Date;
}> {}

// POST /api/forums/:slug/posts
export interface CreateForumPostRequest {
  title: string;
  content: string;
}

// GET /api/forums/posts/:postId/comments
export interface GetForumCommentsResponse {
  comments: {
    id: string;
    content: string;
    user: UserPreview;
    parentId: string | null;
    createdAt: Date;
    replies?: GetForumCommentsResponse['comments'];
  }[];
}

// POST /api/forums/posts/:postId/comments
export interface CreateForumCommentRequest {
  content: string;
  parentId?: string;
}

// ============================================
// SEARCH ENDPOINTS
// ============================================

// GET /api/search
export interface SearchRequest {
  q: string;
  type?: 'places' | 'trips' | 'users' | 'all';
  cityId?: string;
  limit?: number;
}

export interface SearchResponse {
  places?: PlaceCard[];
  trips?: TripCard[];
  users?: UserPreview[];
}

// ============================================
// POST ENDPOINTS
// ============================================

// POST /api/posts
export interface CreatePostRequest {
  content: string;
  imageUrl?: string;
  imageUrl2?: string;
  imageUrl3?: string;
  overallRating?: number;
  valueRating?: number;
  authenticityRating?: number;
  crowdRating?: number;
  placeId?: string;
}

export interface CreatePostResponse {
  post: {
    id: string;
    content: string;
    imageUrl: string | null;
    imageUrl2: string | null;
    imageUrl3: string | null;
    likeCount: number;
    viewCount: number;
    overallRating: number | null;
    valueRating: number | null;
    authenticityRating: number | null;
    crowdRating: number | null;
    compositeScore: number | null;
    rank: number | null;
    createdAt: string;
  };
}

// POST /api/upload
export interface UploadResponse {
  url: string;
}

// ============================================
// ACCOUNT MANAGEMENT ENDPOINTS
// ============================================

// PATCH /api/users/me/email
export interface ChangeEmailRequest {
  newEmail: string;
  currentPassword: string;
}

// PATCH /api/users/me/password
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// DELETE /api/users/me
export interface DeleteAccountRequest {
  confirmUsername: string;
}
