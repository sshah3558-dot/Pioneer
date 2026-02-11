# Pioneer API Contracts

This document defines all API endpoints. Backend Agent implements these, Frontend Agent consumes them.

**Base URL:** `/api`

**Authentication:** All endpoints except `/auth/*` require a valid session (NextAuth).

**Types:** All request/response types are defined in `/src/types/api.ts`. Use those types directly.

**Error Format:**
```json
{
  "error": {
    "message": "Human readable message",
    "code": "ERROR_CODE"
  }
}
```

---

## Authentication

### POST /api/auth/signup
Create a new user account.

**Request:** `SignupRequest`
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe",
  "username": "johndoe"
}
```

**Response (201):** `SignupResponse`
```json
{
  "user": {
    "id": "clx...",
    "email": "user@example.com",
    "name": "John Doe",
    "username": "johndoe",
    "onboardingComplete": false,
    "subscriptionTier": "FREE",
    "tripCount": 0,
    "reviewCount": 0,
    "followerCount": 0,
    "followingCount": 0
  }
}
```

**Errors:**
- `EMAIL_EXISTS` - Email already registered
- `USERNAME_EXISTS` - Username already taken
- `INVALID_EMAIL` - Email format invalid
- `WEAK_PASSWORD` - Password doesn't meet requirements

---

### POST /api/auth/login
Log in with email/password.

**Request:** `LoginRequest`
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):** `LoginResponse`
```json
{
  "user": { /* User object */ }
}
```

**Errors:**
- `INVALID_CREDENTIALS` - Email or password incorrect

---

### GET /api/auth/me
Get current authenticated user with full profile.

**Response (200):** `MeResponse`
```json
{
  "user": {
    /* UserProfile - includes interests, socialConnections, isFollowing */
  }
}
```

---

## User Profile

### GET /api/users/:username
Get user profile by username.

**Response (200):** `GetUserResponse`
```json
{
  "user": {
    /* UserProfile - includes isFollowing for authenticated user */
  }
}
```

---

### PUT /api/users/me
Update current user's profile.

**Request:** `UpdateUserRequest`
```json
{
  "name": "Jane Doe",
  "username": "janedoe",
  "bio": "Travel enthusiast",
  "avatarUrl": "https://...",
  "coverImageUrl": "https://..."
}
```

**Response (200):** User object

---

### GET /api/users/me/interests
Get user's interests.

**Response (200):** `GetInterestsResponse`
```json
{
  "interests": [
    { "id": "...", "userId": "...", "category": "FOOD_DRINK", "weight": 8, "createdAt": "..." }
  ]
}
```

---

### PUT /api/users/me/interests
Update user interests (from onboarding or settings).

**Request:** `UpdateInterestsRequest`
```json
{
  "interests": [
    { "category": "FOOD_DRINK", "weight": 8 },
    { "category": "PHOTOGRAPHY", "weight": 7 }
  ]
}
```

**Response (200):** Same as GET interests

---

### POST /api/users/me/onboarding/complete
Mark onboarding as complete.

**Response (200):** `CompleteOnboardingResponse`
```json
{
  "user": { /* User with onboardingComplete: true */ }
}
```

---

## Follow System

### POST /api/users/:userId/follow
Follow a user.

**Response (200):** `FollowUserResponse`
```json
{
  "following": true
}
```

---

### DELETE /api/users/:userId/follow
Unfollow a user.

**Response (200):** `UnfollowUserResponse`
```json
{
  "following": false
}
```

---

### GET /api/users/:userId/followers
Get user's followers (paginated).

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Page number (default: 1) |
| `pageSize` | number | Items per page (default: 20) |

**Response (200):** `GetFollowersResponse` (extends `PaginatedResponse<UserPreview>`)
```json
{
  "items": [ /* UserPreview[] */ ],
  "total": 100,
  "page": 1,
  "pageSize": 20,
  "hasMore": true
}
```

---

### GET /api/users/:userId/following
Get users that this user follows (paginated).

**Response (200):** `GetFollowingResponse` (extends `PaginatedResponse<UserPreview>`)

---

## Places

### GET /api/places
List places with filters.

**Query Parameters:** Based on `GetPlacesRequest` (extends `PlaceFilters`)
| Param | Type | Description |
|-------|------|-------------|
| `cityId` | string | Filter by city |
| `countryId` | string | Filter by country |
| `categories` | string | Comma-separated: RESTAURANT,CAFE,BAR,... |
| `priceLevels` | string | Comma-separated: FREE,BUDGET,MODERATE,... |
| `tags` | string | Comma-separated tags |
| `minRating` | number | Minimum average rating |
| `maxDuration` | number | Max duration in minutes |
| `nearLatitude` | number | User's latitude |
| `nearLongitude` | number | User's longitude |
| `radiusKm` | number | Search radius in km |
| `search` | string | Text search |
| `page` | number | Page number (default: 1) |
| `pageSize` | number | Items per page (default: 20, max: 50) |
| `sortBy` | string | distance, rating, recent, reviews |

**Response (200):** `GetPlacesResponse` (extends `PaginatedResponse<PlaceCard>`)
```json
{
  "items": [
    {
      "id": "clx...",
      "name": "Manteigaria",
      "category": "CAFE",
      "imageUrl": "https://...",
      "neighborhood": "Chiado",
      "avgOverallRating": 4.6,
      "totalReviewCount": 2847,
      "priceLevel": "BUDGET",
      "tags": ["foodie", "local-favorite"],
      "distance": 0.8,
      "isSaved": false,
      "cityName": "Lisbon",
      "countryName": "Portugal"
    }
  ],
  "total": 156,
  "page": 1,
  "pageSize": 20,
  "hasMore": true
}
```

---

### GET /api/places/:id
Get single place with full details.

**Response (200):** `GetPlaceResponse`
```json
{
  "place": {
    "id": "clx...",
    "cityId": "clx...",
    "createdById": "clx...",
    "name": "Manteigaria",
    "description": "Best pastel de nata in Lisbon...",
    "category": "CAFE",
    "latitude": 38.7103,
    "longitude": -9.1426,
    "address": "Rua do Loreto 2, Lisbon",
    "neighborhood": "Chiado",
    "estimatedDuration": 20,
    "priceLevel": "BUDGET",
    "imageUrl": "https://...",
    "googlePlaceId": "ChIJ...",
    "avgOverallRating": 4.6,
    "avgValueRating": 4.8,
    "avgAuthenticityRating": 4.5,
    "avgCrowdRating": 3.2,
    "totalReviewCount": 2847,
    "createdAt": "2024-01-15T...",
    "updatedAt": "2024-01-15T...",
    "city": { "id": "...", "name": "Lisbon", "country": { "name": "Portugal" } },
    "createdBy": { /* UserPreview */ },
    "tags": ["foodie", "local-favorite"],
    "isSaved": false
  }
}
```

---

### POST /api/places
Create a new place (user-generated).

**Request:** `CreatePlaceRequest` (extends `CreatePlaceInput`)
```json
{
  "cityId": "clx...",
  "name": "Hidden Cafe",
  "description": "A quiet spot...",
  "category": "CAFE",
  "latitude": 38.71,
  "longitude": -9.14,
  "address": "Rua...",
  "neighborhood": "Alfama",
  "estimatedDuration": 45,
  "priceLevel": "BUDGET",
  "tags": ["hidden-gem", "chill"]
}
```

**Response (201):** `CreatePlaceResponse`
```json
{
  "place": { /* Full Place object */ }
}
```

---

### POST /api/places/:id/save
Save a place.

**Response (200):** `SavePlaceResponse`
```json
{
  "saved": true
}
```

---

### DELETE /api/places/:id/save
Unsave a place.

**Response (200):** `UnsavePlaceResponse`
```json
{
  "saved": false
}
```

---

### GET /api/users/me/saves
Get user's saved places.

**Response (200):** `GetSavedPlacesResponse` (extends `PaginatedResponse<PlaceCard>`)

---

## Reviews

### GET /api/places/:placeId/reviews
Get reviews for a place.

**Query Parameters:** `GetPlaceReviewsRequest`
| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Page number |
| `pageSize` | number | Items per page |
| `sortBy` | string | recent, helpful, rating |

**Response (200):** `GetPlaceReviewsResponse` (extends `PaginatedResponse<ReviewCard>`)
```json
{
  "items": [
    {
      "id": "clx...",
      "overallRating": 5,
      "title": "Amazing!",
      "content": "The best pastel de nata...",
      "likeCount": 42,
      "createdAt": "2024-01-15T...",
      "user": { /* UserPreview */ },
      "place": { /* PlaceCard - optional */ },
      "photoCount": 3,
      "isLiked": false
    }
  ],
  "total": 100,
  "page": 1,
  "pageSize": 20,
  "hasMore": true
}
```

---

### POST /api/places/:placeId/reviews
Create a review for a place.

**Request:** `CreateReviewRequest` (extends `CreateReviewInput`)
```json
{
  "placeId": "clx...",
  "tripId": "clx...",
  "overallRating": 5,
  "valueRating": 5,
  "authenticityRating": 4,
  "crowdRating": 3,
  "title": "Amazing experience!",
  "content": "This place was incredible...",
  "visitedAt": "2024-01-10T..."
}
```

**Response (201):** `CreateReviewResponse`
```json
{
  "review": { /* Full Review object */ }
}
```

---

### POST /api/reviews/:reviewId/like
Toggle like on a review.

**Response (200):** `LikeReviewResponse`
```json
{
  "liked": true,
  "likeCount": 43
}
```

---

### GET /api/users/:userId/reviews
Get reviews by a user.

**Response (200):** `GetUserReviewsResponse` (extends `PaginatedResponse<ReviewCard>`)

---

## Trips

### GET /api/trips
List trips (feed).

**Query Parameters:** `GetTripsRequest` (extends `TripFilters`)
| Param | Type | Description |
|-------|------|-------------|
| `userId` | string | Trips by specific user |
| `cityId` | string | Trips to specific city |
| `countryId` | string | Trips to specific country |
| `followingOnly` | boolean | Only from users I follow |
| `status` | string | PLANNING, IN_PROGRESS, COMPLETED |
| `page` | number | Page number |
| `pageSize` | number | Items per page |
| `sortBy` | string | recent, popular |

**Response (200):** `GetTripsResponse` (extends `PaginatedResponse<TripCard>`)
```json
{
  "items": [
    {
      "id": "clx...",
      "title": "Barcelona Summer 2024",
      "coverImageUrl": "https://...",
      "startDate": "2024-06-15T...",
      "endDate": "2024-06-22T...",
      "likeCount": 247,
      "status": "COMPLETED",
      "user": { /* UserPreview */ },
      "city": { "name": "Barcelona", "country": { "name": "Spain" } },
      "stopCount": 8,
      "isLiked": false
    }
  ],
  "total": 50,
  "page": 1,
  "pageSize": 20,
  "hasMore": true
}
```

---

### GET /api/trips/:id
Get single trip with full details.

**Response (200):** `GetTripResponse`
```json
{
  "trip": {
    "id": "clx...",
    "userId": "clx...",
    "cityId": "clx...",
    "title": "Barcelona Summer 2024",
    "description": "An amazing week exploring...",
    "startDate": "2024-06-15T...",
    "endDate": "2024-06-22T...",
    "isPublic": true,
    "coverImageUrl": "https://...",
    "likeCount": 247,
    "viewCount": 1500,
    "status": "COMPLETED",
    "createdAt": "...",
    "updatedAt": "...",
    "publishedAt": "...",
    "user": { /* UserPreview */ },
    "city": { "id": "...", "name": "Barcelona", "country": { "name": "Spain" } },
    "stops": [
      {
        "id": "clx...",
        "tripId": "clx...",
        "placeId": "clx...",
        "dayNumber": 1,
        "orderInDay": 0,
        "notes": "Great start!",
        "arrivalTime": "...",
        "departureTime": "...",
        "createdAt": "...",
        "place": { /* PlaceCard */ }
      }
    ],
    "isLiked": false
  }
}
```

---

### POST /api/trips
Create a new trip.

**Request:** `CreateTripRequest` (extends `CreateTripInput`)
```json
{
  "cityId": "clx...",
  "title": "My Lisbon Adventure",
  "description": "Exploring the city...",
  "startDate": "2024-07-01T...",
  "endDate": "2024-07-05T...",
  "isPublic": true,
  "coverImageUrl": "https://..."
}
```

**Response (201):** `CreateTripResponse`
```json
{
  "trip": { /* Full Trip object */ }
}
```

---

### PUT /api/trips/:id
Update a trip.

**Request:** `UpdateTripRequest` (extends `UpdateTripInput`)
```json
{
  "title": "Updated Title",
  "description": "...",
  "status": "COMPLETED"
}
```

**Response (200):** `UpdateTripResponse`
```json
{
  "trip": { /* Full Trip object */ }
}
```

---

### DELETE /api/trips/:id
Delete a trip.

**Response (200):** `DeleteTripResponse`
```json
{
  "deleted": true
}
```

---

### POST /api/trips/:id/stops
Add a stop to a trip.

**Request:** `AddTripStopRequest` (extends `AddTripStopInput`)
```json
{
  "placeId": "clx...",
  "dayNumber": 1,
  "orderInDay": 0,
  "notes": "Must try the pastries!",
  "arrivalTime": "2024-07-01T10:00:00Z",
  "departureTime": "2024-07-01T10:30:00Z"
}
```

**Response (201):** `AddTripStopResponse`
```json
{
  "stop": {
    "id": "clx...",
    "placeId": "clx...",
    "dayNumber": 1,
    "orderInDay": 0
  }
}
```

---

### DELETE /api/trips/:tripId/stops/:stopId
Remove a stop from a trip.

**Response (200):** `RemoveTripStopResponse`
```json
{
  "deleted": true
}
```

---

### POST /api/trips/:id/like
Toggle like on a trip.

**Response (200):** `LikeTripResponse`
```json
{
  "liked": true,
  "likeCount": 248
}
```

---

### GET /api/users/:userId/trips
Get trips by a user.

**Response (200):** `GetUserTripsResponse` (extends `PaginatedResponse<TripCard>`)

---

## Feed & Recommendations

### GET /api/feed
Get activity feed (trips from followed users).

**Query Parameters:** `GetFeedRequest`
| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Page number |
| `pageSize` | number | Items per page |

**Response (200):** `GetFeedResponse` (extends `PaginatedResponse<TripCard>`)

---

### GET /api/recommendations
Get personalized place recommendations.

**Query Parameters:** `GetRecommendationsRequest`
| Param | Type | Description |
|-------|------|-------------|
| `cityId` | string | Filter by city |
| `latitude` | number | User's current latitude |
| `longitude` | number | User's current longitude |
| `maxDuration` | number | Max duration in minutes |
| `limit` | number | Number of recommendations |

**Response (200):** `GetRecommendationsResponse`
```json
{
  "places": [ /* PlaceCard[] */ ],
  "basedOn": {
    "trips": [ /* TripCard[] */ ],
    "users": [ /* UserPreview[] */ ]
  }
}
```

---

### GET /api/discover
Spontaneous discovery: "I have X hours"

**Query Parameters:** `DiscoverRequest`
| Param | Type | Description |
|-------|------|-------------|
| `cityId` | string | Required - city to discover in |
| `availableMinutes` | number | Required - time available |
| `latitude` | number | Current location |
| `longitude` | number | Current location |
| `categories` | string | Comma-separated categories |
| `priceLevels` | string | Comma-separated price levels |

**Response (200):** `DiscoverResponse`
```json
{
  "places": [ /* PlaceCard[] */ ],
  "fromTrips": [ /* TripCard[] - "These places are from trips by..." */ ]
}
```

---

## Location

### GET /api/countries
Get list of countries.

**Response (200):** `GetCountriesResponse`
```json
{
  "countries": [
    {
      "id": "clx...",
      "name": "Portugal",
      "code": "PT",
      "imageUrl": "https://...",
      "cityCount": 5
    }
  ]
}
```

---

### GET /api/countries/:countryId/cities
Get cities in a country.

**Response (200):** `GetCitiesResponse`
```json
{
  "cities": [
    {
      "id": "clx...",
      "name": "Lisbon",
      "imageUrl": "https://...",
      "placeCount": 247,
      "tripCount": 89
    }
  ]
}
```

---

## Forums (Phase 3)

### GET /api/forums
Get list of forums.

**Response (200):** `GetForumsResponse`
```json
{
  "forums": [
    {
      "id": "clx...",
      "name": "Lisbon",
      "slug": "lisbon",
      "description": "Discuss all things Lisbon",
      "postCount": 156,
      "countryName": "Portugal",
      "cityName": "Lisbon"
    }
  ]
}
```

---

### GET /api/forums/:slug/posts
Get posts in a forum.

**Query Parameters:** `GetForumPostsRequest`

**Response (200):** `GetForumPostsResponse` (paginated)
```json
{
  "items": [
    {
      "id": "clx...",
      "title": "Best hidden gems in Alfama?",
      "content": "Looking for...",
      "user": { /* UserPreview */ },
      "commentCount": 12,
      "viewCount": 234,
      "isPinned": false,
      "createdAt": "..."
    }
  ],
  "total": 50,
  "page": 1,
  "pageSize": 20,
  "hasMore": true
}
```

---

### POST /api/forums/:slug/posts
Create a forum post.

**Request:** `CreateForumPostRequest`
```json
{
  "title": "Best hidden gems in Alfama?",
  "content": "I'm visiting next week..."
}
```

---

### GET /api/forums/posts/:postId/comments
Get comments on a post.

**Response (200):** `GetForumCommentsResponse`
```json
{
  "comments": [
    {
      "id": "clx...",
      "content": "You should check out...",
      "user": { /* UserPreview */ },
      "parentId": null,
      "createdAt": "...",
      "replies": [ /* Nested comments */ ]
    }
  ]
}
```

---

### POST /api/forums/posts/:postId/comments
Create a comment.

**Request:** `CreateForumCommentRequest`
```json
{
  "content": "Great question! You should...",
  "parentId": "clx..."
}
```

---

## Search

### GET /api/search
Search across places, trips, and users.

**Query Parameters:** `SearchRequest`
| Param | Type | Description |
|-------|------|-------------|
| `q` | string | Search query |
| `type` | string | places, trips, users, all |
| `cityId` | string | Filter by city |
| `limit` | number | Results per type |

**Response (200):** `SearchResponse`
```json
{
  "places": [ /* PlaceCard[] */ ],
  "trips": [ /* TripCard[] */ ],
  "users": [ /* UserPreview[] */ ]
}
```

---

## Error Codes Reference

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Not authenticated |
| `FORBIDDEN` | 403 | Not authorized for this resource |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `EMAIL_EXISTS` | 400 | Email already registered |
| `USERNAME_EXISTS` | 400 | Username already taken |
| `INVALID_CREDENTIALS` | 401 | Wrong email or password |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |
