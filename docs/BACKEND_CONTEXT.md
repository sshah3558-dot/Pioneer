# Backend Agent Context

You are the **Backend Agent** for Pioneer, a community-powered travel discovery platform.

## Project Overview

Pioneer is a social travel platform where users rate, review, and share travel experiences while discovering places through the trips of people they follow.

**App Name:** Pioneer
**Tagline:** "Discover Together"
**Launch City:** Lisbon, Portugal

## Your Responsibilities

You own the API layer, database access, and authentication:
- `/src/app/api/*` - Next.js API Routes
- `/src/lib/db/*` - Database query functions
- `/src/lib/auth/*` - Authentication logic
- `/src/lib/services/*` - Business logic services

## Off-Limits (Other Agents Own These)

- `/src/components/*` - Frontend Agent
- `/src/app/` (except `/api/*`) - Frontend Agent
- `/src/lib/ai/*` - AI Agent
- `/prisma/schema.prisma` - Main Agent (request changes via SCHEMA_REQUESTS.md)
- `/scripts/*` - AI Agent
- `/python/*` - AI Agent

## Tech Stack

- **Next.js 14** API Routes (App Router)
- **TypeScript** - strict mode
- **Prisma** - ORM for PostgreSQL
- **NextAuth.js** - Authentication
- **Zod** - Request validation

## Key Files to Read First

1. `/docs/API_CONTRACTS.md` - All endpoints you'll implement
2. `/src/types/*` - Shared TypeScript types (USE THESE)
3. `/prisma/schema.prisma` - Database schema

---

## Database Setup

1. Create a PostgreSQL database (local or Supabase, Railway, Neon)
2. Update `.env` with `DATABASE_URL`
3. Run `npx prisma migrate dev --name initial` to apply schema
4. Run `npx prisma generate` to generate client

---

## Phase 1 MVP Tasks

Implement endpoints in this order:

### 1. Auth Endpoints

**POST /api/auth/signup**
```typescript
// Request: SignupRequest from @/types/api
// Response: SignupResponse
- Validate email format, password strength
- Hash password with bcrypt
- Create user in database
- Return user (exclude password)
```

**POST /api/auth/login**
```typescript
// Request: LoginRequest
// Response: LoginResponse
- Validate credentials
- Compare password hash
- Create session (NextAuth)
- Return user
```

**GET /api/auth/me**
```typescript
// Response: MeResponse
- Get current session
- Return user with interests, socialConnections, counts
```

Configure NextAuth in `/src/app/api/auth/[...nextauth]/route.ts`:
- Credentials provider (email/password)
- Google OAuth provider
- Prisma adapter for session storage

---

### 2. User Endpoints

**GET /api/users/:username**
```typescript
// Response: GetUserResponse
- Get user by username
- Include isFollowing for authenticated user
```

**PUT /api/users/me**
```typescript
// Request: UpdateUserRequest
// Response: UserProfile
- Update name, username, bio, avatarUrl, coverImageUrl
```

**GET /api/users/me/interests**
```typescript
// Response: GetInterestsResponse
- Return user's interests
```

**PUT /api/users/me/interests**
```typescript
// Request: UpdateInterestsRequest
// Response: GetInterestsResponse
- Upsert interests (delete old, create new)
- Validate categories and weights
```

**POST /api/users/me/onboarding/complete**
```typescript
// Response: CompleteOnboardingResponse
- Set onboardingComplete = true
```

---

### 3. Follow System

**POST /api/users/:userId/follow**
```typescript
// Response: FollowUserResponse
- Create follow relationship
- Increment follower/following counts
```

**DELETE /api/users/:userId/follow**
```typescript
// Response: UnfollowUserResponse
- Delete follow relationship
- Decrement follower/following counts
```

**GET /api/users/:userId/followers**
```typescript
// Response: GetFollowersResponse (paginated)
```

**GET /api/users/:userId/following**
```typescript
// Response: GetFollowingResponse (paginated)
```

---

### 4. Place Endpoints

**GET /api/places**
```typescript
// Request: GetPlacesRequest (query params)
// Response: GetPlacesResponse (paginated)
- Filter by cityId, categories, priceLevels, tags, minRating
- Location-based filtering with nearLatitude/nearLongitude/radiusKm
- Sorting: distance, rating, recent, reviews
- Include isSaved for authenticated user
```

**GET /api/places/:id**
```typescript
// Response: GetPlaceResponse
- Full place with all relations
- Include isSaved for authenticated user
```

**POST /api/places**
```typescript
// Request: CreatePlaceRequest
// Response: CreatePlaceResponse
- Create new place (user-generated)
- Validate all required fields
```

**POST /api/places/:id/save**
```typescript
// Response: SavePlaceResponse
- Create UserSave record
```

**DELETE /api/places/:id/save**
```typescript
// Response: UnsavePlaceResponse
- Delete UserSave record
```

**GET /api/users/me/saves**
```typescript
// Response: GetSavedPlacesResponse (paginated)
```

---

### 5. Review Endpoints

**GET /api/places/:placeId/reviews**
```typescript
// Request: GetPlaceReviewsRequest
// Response: GetPlaceReviewsResponse (paginated)
- Sort by recent, helpful, rating
```

**POST /api/places/:placeId/reviews**
```typescript
// Request: CreateReviewRequest
// Response: CreateReviewResponse
- Create review with 4 category ratings
- Update place aggregate ratings
- Increment user's reviewCount
```

**POST /api/reviews/:reviewId/like**
```typescript
// Response: LikeReviewResponse
- Toggle like (create/delete ReviewLike)
- Update likeCount on review
```

**GET /api/users/:userId/reviews**
```typescript
// Response: GetUserReviewsResponse (paginated)
```

---

### 6. Trip Endpoints

**GET /api/trips**
```typescript
// Request: GetTripsRequest (query params)
// Response: GetTripsResponse (paginated)
- Filter by userId, cityId, countryId, status
- followingOnly filter (trips from users I follow)
- Sort by recent, popular
```

**GET /api/trips/:id**
```typescript
// Response: GetTripResponse
- Full trip with stops, city, user
- Include isLiked for authenticated user
```

**POST /api/trips**
```typescript
// Request: CreateTripRequest
// Response: CreateTripResponse
- Create new trip
- Increment user's tripCount
```

**PUT /api/trips/:id**
```typescript
// Request: UpdateTripRequest
// Response: UpdateTripResponse
- Update trip details
- Only owner can update
```

**DELETE /api/trips/:id**
```typescript
// Response: DeleteTripResponse
- Delete trip and all stops
- Decrement user's tripCount
```

**POST /api/trips/:id/stops**
```typescript
// Request: AddTripStopRequest
// Response: AddTripStopResponse
- Add place to trip
```

**DELETE /api/trips/:tripId/stops/:stopId**
```typescript
// Response: RemoveTripStopResponse
- Remove stop from trip
```

**POST /api/trips/:id/like**
```typescript
// Response: LikeTripResponse
- Toggle like (create/delete TripLike)
- Update likeCount on trip
```

**GET /api/users/:userId/trips**
```typescript
// Response: GetUserTripsResponse (paginated)
```

---

### 7. Feed & Recommendations

**GET /api/feed**
```typescript
// Request: GetFeedRequest
// Response: GetFeedResponse (paginated)
- Trips from users I follow
- Ordered by recent
```

**GET /api/recommendations**
```typescript
// Request: GetRecommendationsRequest
// Response: GetRecommendationsResponse
- Personalized place recommendations
- Based on user interests and trip data
- Call AI service for MVP: use simple rule-based matching
```

**GET /api/discover**
```typescript
// Request: DiscoverRequest
// Response: DiscoverResponse
- "I have X hours" spontaneous discovery
- Filter by availableMinutes, categories, location
```

---

### 8. Location Endpoints

**GET /api/countries**
```typescript
// Response: GetCountriesResponse
- List all countries with city counts
```

**GET /api/countries/:countryId/cities**
```typescript
// Response: GetCitiesResponse
- List cities in country with place/trip counts
```

---

### 9. Forum Endpoints (Phase 3)

**GET /api/forums**
```typescript
// Response: GetForumsResponse
- List all forums with post counts
```

**GET /api/forums/:slug/posts**
```typescript
// Request: GetForumPostsRequest
// Response: GetForumPostsResponse (paginated)
```

**POST /api/forums/:slug/posts**
```typescript
// Request: CreateForumPostRequest
- Create new forum post
```

**GET /api/forums/posts/:postId/comments**
```typescript
// Response: GetForumCommentsResponse
- Nested comments structure
```

**POST /api/forums/posts/:postId/comments**
```typescript
// Request: CreateForumCommentRequest
- Create comment (supports nested replies via parentId)
```

---

### 10. Search

**GET /api/search**
```typescript
// Request: SearchRequest
// Response: SearchResponse
- Search places, trips, users
- Filter by type, cityId
```

---

## Code Patterns

### API Route Structure
```typescript
// src/app/api/places/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { prisma } from '@/lib/db/client';
import { authOptions } from '@/lib/auth/options';
import { GetPlacesRequest, GetPlacesResponse } from '@/types/api';

const querySchema = z.object({
  cityId: z.string().optional(),
  page: z.coerce.number().default(1),
  pageSize: z.coerce.number().default(20).max(50),
  categories: z.string().optional(), // comma-separated
  priceLevels: z.string().optional(), // comma-separated
  minRating: z.coerce.number().optional(),
  sortBy: z.enum(['distance', 'rating', 'recent', 'reviews']).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);

    const query = querySchema.parse(Object.fromEntries(searchParams));

    // Build where clause
    const where = {
      ...(query.cityId && { cityId: query.cityId }),
      ...(query.categories && {
        category: { in: query.categories.split(',') }
      }),
      ...(query.minRating && {
        avgOverallRating: { gte: query.minRating }
      }),
    };

    // Get places with pagination
    const [places, total] = await Promise.all([
      prisma.place.findMany({
        where,
        include: { tags: true },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        orderBy: getOrderBy(query.sortBy),
      }),
      prisma.place.count({ where }),
    ]);

    // Check saved status for authenticated user
    let savedIds = new Set<string>();
    if (session?.user) {
      const saves = await prisma.userSave.findMany({
        where: {
          userId: session.user.id,
          placeId: { in: places.map(p => p.id) },
        },
        select: { placeId: true },
      });
      savedIds = new Set(saves.map(s => s.placeId));
    }

    // Transform to PlaceCard
    const items = places.map(place => ({
      id: place.id,
      name: place.name,
      category: place.category,
      imageUrl: place.imageUrl,
      neighborhood: place.neighborhood,
      avgOverallRating: place.avgOverallRating,
      totalReviewCount: place.totalReviewCount,
      priceLevel: place.priceLevel,
      tags: place.tags.map(t => t.tag),
      isSaved: savedIds.has(place.id),
    }));

    const response: GetPlacesResponse = {
      items,
      total,
      page: query.page,
      pageSize: query.pageSize,
      hasMore: query.page * query.pageSize < total,
    };

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { message: 'Invalid request', code: 'VALIDATION_ERROR' } },
        { status: 400 }
      );
    }
    console.error('GET /api/places error:', error);
    return NextResponse.json(
      { error: { message: 'Internal error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
```

### Prisma Client
```typescript
// src/lib/db/client.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma || new PrismaClient({ log: ['query'] });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### Auth Helper
```typescript
// src/lib/auth/getUser.ts
import { getServerSession } from 'next-auth';
import { authOptions } from './options';
import { prisma } from '@/lib/db/client';

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;

  return prisma.user.findUnique({
    where: { email: session.user.email },
    include: { interests: true },
  });
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}
```

### Aggregate Rating Update
```typescript
// src/lib/services/reviews.ts
export async function updatePlaceRatings(placeId: string) {
  const reviews = await prisma.review.findMany({
    where: { placeId },
    select: {
      overallRating: true,
      valueRating: true,
      authenticityRating: true,
      crowdRating: true,
    },
  });

  const count = reviews.length;
  if (count === 0) {
    await prisma.place.update({
      where: { id: placeId },
      data: {
        avgOverallRating: null,
        avgValueRating: null,
        avgAuthenticityRating: null,
        avgCrowdRating: null,
        totalReviewCount: 0,
      },
    });
    return;
  }

  const avg = (arr: (number | null)[]) => {
    const valid = arr.filter((n): n is number => n !== null);
    return valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : null;
  };

  await prisma.place.update({
    where: { id: placeId },
    data: {
      avgOverallRating: avg(reviews.map(r => r.overallRating)),
      avgValueRating: avg(reviews.map(r => r.valueRating)),
      avgAuthenticityRating: avg(reviews.map(r => r.authenticityRating)),
      avgCrowdRating: avg(reviews.map(r => r.crowdRating)),
      totalReviewCount: count,
    },
  });
}
```

---

## File Structure

```
src/
├── app/
│   └── api/
│       ├── auth/
│       │   ├── [...nextauth]/route.ts
│       │   ├── signup/route.ts
│       │   └── login/route.ts
│       ├── users/
│       │   ├── [username]/route.ts
│       │   ├── [userId]/
│       │   │   ├── follow/route.ts
│       │   │   ├── followers/route.ts
│       │   │   ├── following/route.ts
│       │   │   ├── trips/route.ts
│       │   │   └── reviews/route.ts
│       │   └── me/
│       │       ├── route.ts
│       │       ├── interests/route.ts
│       │       ├── saves/route.ts
│       │       └── onboarding/complete/route.ts
│       ├── places/
│       │   ├── route.ts
│       │   └── [id]/
│       │       ├── route.ts
│       │       ├── save/route.ts
│       │       └── reviews/route.ts
│       ├── reviews/
│       │   └── [id]/
│       │       └── like/route.ts
│       ├── trips/
│       │   ├── route.ts
│       │   └── [id]/
│       │       ├── route.ts
│       │       ├── stops/route.ts
│       │       └── like/route.ts
│       ├── feed/route.ts
│       ├── recommendations/route.ts
│       ├── discover/route.ts
│       ├── search/route.ts
│       ├── countries/
│       │   ├── route.ts
│       │   └── [id]/cities/route.ts
│       └── forums/
│           ├── route.ts
│           ├── [slug]/posts/route.ts
│           └── posts/[id]/comments/route.ts
├── lib/
│   ├── db/
│   │   ├── client.ts
│   │   ├── users.ts
│   │   ├── places.ts
│   │   ├── reviews.ts
│   │   └── trips.ts
│   ├── auth/
│   │   ├── options.ts
│   │   ├── getUser.ts
│   │   └── password.ts
│   └── services/
│       ├── reviews.ts
│       ├── trips.ts
│       └── recommendations.ts
```

---

## Environment Variables

Add to `.env`:
```
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="generate-a-secret"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

---

## Coordination Rules

1. **Follow API contracts exactly** - Response shapes must match API_CONTRACTS.md
2. **Use shared types** - Import from `@/types/*`
3. **Request schema changes** - Add to `/docs/SCHEMA_REQUESTS.md`, notify Main Agent
4. **Don't modify frontend code** - That's Frontend Agent's domain
5. **AI integration** - For recommendations/NLP, call functions from `/src/lib/ai/*` (AI Agent implements these)

---

## Getting Started

1. Set up PostgreSQL database
2. Update `.env` with DATABASE_URL and NEXTAUTH_SECRET
3. Run `npx prisma migrate dev --name initial`
4. Run `npx prisma generate`
5. Install dependencies: `npm install next-auth @auth/prisma-adapter bcryptjs zod`
6. Start with auth endpoints (signup, login, me)
7. Then places/reviews CRUD
8. Then trips CRUD
9. Then feed and follow system

---

## Questions?

If you need clarification on:
- API contracts → Check API_CONTRACTS.md or ask Main Agent
- Schema changes → Document in SCHEMA_REQUESTS.md
- AI integration → Check AI_CONTEXT.md or ask AI Agent
