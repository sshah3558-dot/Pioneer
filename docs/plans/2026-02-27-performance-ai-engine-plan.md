# Performance & AI Recommendation Engine Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Eliminate image loading lag, optimize data fetching, add behavioral event tracking, and rebuild the recommendation engine with multi-signal behavioral scoring.

**Architecture:** Four parallel tracks — (1) Image rendering with Next.js Image + Supabase transforms, (2) React Query tuning + API response optimization + caching headers, (3) New UserEvent/RecommendationScore Prisma models + event collector API + client-side tracker, (4) Multi-signal recommendation scorer with pre-computation pipeline. Track 4 depends on Track 3's schema.

**Tech Stack:** Next.js 16 Image component, Supabase image transforms, React Query v5, Prisma (PostgreSQL), Intersection Observer API

---

## Track 1: Image & Rendering Performance

### Task 1.1: Configure Next.js Image in next.config.ts

**Files:**
- Modify: `next.config.ts`

**Step 1: Add images.remotePatterns to next.config.ts**

Add the `images` configuration to allow Next.js Image to optimize remote images from Supabase and ui-avatars.com:

```typescript
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  env: {
    // ... existing env config
  },
  headers: async () => [
    // ... existing headers
  ],
};
```

**Step 2: Verify build succeeds**

Run: `npm run build`
Expected: Clean build with no errors

**Step 3: Commit**

```bash
git add next.config.ts
git commit -m "feat: configure Next.js Image remote patterns for Supabase, ui-avatars, Unsplash"
```

---

### Task 1.2: Create image utility helpers

**Files:**
- Create: `src/lib/utils/image-url.ts`

**Step 1: Create the image utility file**

```typescript
/**
 * Generate an optimized Supabase image URL with transforms.
 * Supabase storage supports on-the-fly transforms via /render/image endpoint.
 */
export function getOptimizedImageUrl(
  url: string,
  options: { width?: number; height?: number; quality?: number } = {}
): string {
  if (!url) return '';

  // Only transform Supabase storage URLs
  if (!url.includes('supabase.co/storage/v1/object/public/')) {
    return url;
  }

  const { width, height, quality = 75 } = options;

  // Convert /object/public/ to /render/image/public/ for transforms
  const transformUrl = url.replace(
    '/storage/v1/object/public/',
    '/storage/v1/render/image/public/'
  );

  const params = new URLSearchParams();
  if (width) params.set('width', String(width));
  if (height) params.set('height', String(height));
  params.set('quality', String(quality));
  params.set('format', 'origin'); // Let Next.js handle format conversion

  return `${transformUrl}?${params.toString()}`;
}

/** Preset image sizes for common use cases */
export const IMAGE_SIZES = {
  /** Feed/explore card thumbnails */
  cardThumb: { width: 400, height: 300, quality: 75 },
  /** Full-width card images */
  cardFull: { width: 800, height: 600, quality: 80 },
  /** Carousel/detail view */
  carousel: { width: 1200, height: 800, quality: 85 },
  /** Small thumbnails (rankings, saved) */
  thumbnail: { width: 128, height: 128, quality: 70 },
  /** Avatar images */
  avatar: { width: 96, height: 96, quality: 75 },
  /** Cover images */
  cover: { width: 1200, height: 400, quality: 80 },
} as const;
```

**Step 2: Verify build succeeds**

Run: `npm run build`
Expected: Clean build

**Step 3: Commit**

```bash
git add src/lib/utils/image-url.ts
git commit -m "feat: add image URL optimization utility with Supabase transforms"
```

---

### Task 1.3: Migrate content images to Next.js Image

Migrate all moment/place/trip content images (NOT avatars or local previews) to Next.js `<Image>`.

**Files:**
- Modify: `src/components/moments/MomentCard.tsx:53-57` — moment card image
- Modify: `src/components/moments/RankingCard.tsx:60-64` — ranking thumbnail
- Modify: `src/components/moments/RankingCard.tsx:92` — carousel images
- Modify: `src/components/moments/SavedMoments.tsx:73` — saved moment thumbnail
- Modify: `src/components/feed/FeedCard.tsx:225` — feed carousel images
- Modify: `src/components/places/PlaceCard.tsx:42-46,92-96,122-126` — place card images
- Modify: `src/components/trips/TripCard.tsx:49-53,83-87` — trip cover images
- Modify: `src/app/(authenticated)/profile/page.tsx:95` — profile moment images
- Modify: `src/app/(authenticated)/profile/posts/page.tsx:89` — all moments page images
- Modify: `src/app/(authenticated)/forums/page.tsx:129` — ranking page thumbnails

**Step 1: Migrate each component**

For each file, add `import Image from 'next/image'` and replace `<img>` with `<Image>`. Pattern:

Replace:
```tsx
<img src={url} alt="" className="w-full h-48 object-cover" />
```
With:
```tsx
<Image src={url} alt="" width={800} height={300} className="w-full h-48 object-cover" />
```

Key rules:
- Content images (moments, places, trips): use `width`/`height` props with `className` for CSS sizing
- Images inside `relative` containers: use `fill` prop + `sizes` prop instead of width/height
- Add `loading="lazy"` (default) or `priority` for above-fold images
- Add `sizes` prop for responsive: `sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"`
- Handle null/undefined URLs with conditional rendering (already done in most places)
- For carousel images in FeedCard and RankingCard, use `fill` inside a relative container

**Step 2: Verify build succeeds**

Run: `npm run build`
Expected: Clean build, no missing image domain errors

**Step 3: Commit**

```bash
git add src/components/moments/ src/components/feed/ src/components/places/ src/components/trips/ src/app/\(authenticated\)/
git commit -m "feat: migrate content images to Next.js Image with lazy loading and responsive sizing"
```

---

### Task 1.4: Migrate avatar images to Next.js Image

**Files:**
- Modify: `src/components/feed/CreatePost.tsx:16-20`
- Modify: `src/components/feed/FeedCard.tsx:166-170`
- Modify: `src/components/feed/ProfileSummary.tsx:31-35`
- Modify: `src/components/feed/SuggestedUsers.tsx:95-99`
- Modify: `src/components/forums/ForumPost.tsx:50-54`
- Modify: `src/components/layout/TopNav.tsx:95-99`
- Modify: `src/components/moments/MomentCard.tsx:88-92`
- Modify: `src/components/trips/TripActivity.tsx:41-45`

**Step 1: Migrate each avatar**

Pattern for avatars:
```tsx
<Image
  src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}&background=667eea&color=fff`}
  alt={user.name || 'User'}
  width={48}
  height={48}
  className="w-12 h-12 rounded-full object-cover"
/>
```

Adjust `width`/`height` to match the CSS size (w-10=40, w-12=48, w-24=96).

**Step 2: Verify build succeeds**

Run: `npm run build`
Expected: Clean build

**Step 3: Commit**

```bash
git add src/components/
git commit -m "feat: migrate avatar images to Next.js Image"
```

---

### Task 1.5: Migrate static/auth page images

**Files:**
- Modify: `src/app/login/page.tsx:36-40`
- Modify: `src/app/signup/page.tsx:36-40`
- Modify: `src/components/users/ProfileHeader.tsx` — cover image
- Modify: `src/app/(authenticated)/settings/profile/page.tsx:120-124,149-152`

**Step 1: Migrate login/signup background images**

These are decorative and above-fold, use `priority` and `fill`:
```tsx
<Image
  src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=1600&fit=crop"
  alt="Travel"
  fill
  priority
  className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
/>
```

**Note:** Do NOT migrate `CreateMoment.tsx:306` (`photo.preview`) — these are local blob URLs that Next.js Image cannot optimize. Keep as `<img>`.

**Step 2: Verify build succeeds**

Run: `npm run build`
Expected: Clean build

**Step 3: Commit**

```bash
git add src/app/login/ src/app/signup/ src/components/users/ src/app/\(authenticated\)/settings/
git commit -m "feat: migrate auth page and profile images to Next.js Image"
```

---

### Task 1.6: Add dynamic imports for heavy modals

**Files:**
- Modify: `src/app/(authenticated)/feed/page.tsx` — CreateMoment import
- Modify: `src/app/(authenticated)/forums/page.tsx` — CreateMoment import
- Modify: `src/app/(authenticated)/planner/page.tsx` — CreateTripModal import
- Modify: `src/app/(authenticated)/reviews/new/page.tsx` — ReviewForm if applicable

**Step 1: Convert static imports to dynamic**

Pattern:
```tsx
// Before
import { CreateMoment } from '@/components/moments/CreateMoment';

// After
import dynamic from 'next/dynamic';
const CreateMoment = dynamic(() => import('@/components/moments/CreateMoment').then(m => m.CreateMoment), {
  loading: () => null,
});
```

Apply to CreateMoment, CreateTripModal wherever they're imported in page-level components.

**Step 2: Verify build succeeds**

Run: `npm run build`
Expected: Clean build

**Step 3: Commit**

```bash
git add src/app/\(authenticated\)/
git commit -m "feat: add dynamic imports for CreateMoment and CreateTripModal modals"
```

---

## Track 2: Data Layer & Caching

### Task 2.1: Tune React Query defaults

**Files:**
- Modify: `src/app/providers.tsx`

**Step 1: Update QueryClient configuration**

```typescript
const [queryClient] = useState(
  () =>
    new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 5 * 60 * 1000,  // 5 minutes (was 1 min)
          gcTime: 10 * 60 * 1000,     // 10 minutes garbage collection
          retry: 1,
          refetchOnWindowFocus: false, // Don't refetch every tab switch
        },
      },
    })
);
```

**Step 2: Verify build succeeds**

Run: `npm run build`
Expected: Clean build

**Step 3: Commit**

```bash
git add src/app/providers.tsx
git commit -m "feat: tune React Query — 5min staleTime, disable refetchOnWindowFocus"
```

---

### Task 2.2: Add staleTime overrides for static data

**Files:**
- Modify: `src/components/forums/ForumSidebar.tsx` — forums query
- Modify: Any component querying cities/countries

**Step 1: Add per-query staleTime for near-static data**

```typescript
// ForumSidebar.tsx
const { data, isLoading } = useQuery({
  queryKey: ['forums'],
  queryFn: () => apiFetch<{ forums: ForumItem[] }>('/api/forums'),
  staleTime: Infinity, // Forum categories almost never change
});
```

Apply `staleTime: Infinity` to queries for: forums, cities, countries.
Apply `staleTime: 30 * 60 * 1000` (30 min) to: places, user suggestions.

**Step 2: Add placeholderData for paginated queries**

In `src/app/(authenticated)/profile/posts/page.tsx` and any paginated query:
```typescript
import { keepPreviousData } from '@tanstack/react-query';

const { data, isLoading } = useQuery({
  // ...existing config
  placeholderData: keepPreviousData,
});
```

**Step 3: Verify build and commit**

```bash
git add src/components/ src/app/
git commit -m "feat: add staleTime overrides for static data, keepPreviousData for pagination"
```

---

### Task 2.3: Add Cache-Control headers to static API routes

**Files:**
- Modify: `src/app/api/cities/route.ts`
- Modify: `src/app/api/places/route.ts`
- Modify: `src/app/api/forums/route.ts`

**Step 1: Add caching headers to GET handlers**

Pattern for each route's GET handler, add before the return statement:

```typescript
const response = NextResponse.json({ /* existing response data */ });
response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
return response;
```

Apply:
- `/api/cities`: `s-maxage=3600` (1 hour — city list rarely changes)
- `/api/places` (list): `s-maxage=300` (5 min)
- `/api/forums` (list): `s-maxage=600` (10 min)

**Step 2: Verify and commit**

```bash
git add src/app/api/cities/ src/app/api/places/ src/app/api/forums/
git commit -m "feat: add Cache-Control headers to static API routes"
```

---

### Task 2.4: Optimize Prisma queries with select

**Files:**
- Modify: `src/app/api/feed/route.ts`
- Modify: `src/app/api/moments/route.ts`
- Modify: `src/app/api/posts/route.ts`

**Step 1: Replace `include` with `select` in feed API**

In `src/app/api/feed/route.ts`, for each Prisma query that currently uses `include`, switch to `select` with only the fields the frontend actually needs. Example:

```typescript
// Before (fetches all user fields)
include: { user: true }

// After (fetches only what's rendered)
select: {
  id: true,
  content: true,
  imageUrl: true,
  imageUrl2: true,
  imageUrl3: true,
  likeCount: true,
  viewCount: true,
  compositeScore: true,
  createdAt: true,
  user: {
    select: { id: true, name: true, username: true, avatarUrl: true }
  },
  place: {
    select: {
      id: true, name: true, category: true, imageUrl: true,
      city: { select: { name: true, country: { select: { name: true } } } }
    }
  },
}
```

Apply this pattern to the moments and posts routes too. Each route should only select fields that appear in its response formatter.

**Step 2: Verify API responses still contain all needed fields**

Run: `npm run build`
Test manually or check TypeScript compilation catches any missing fields.

**Step 3: Commit**

```bash
git add src/app/api/
git commit -m "feat: optimize Prisma queries with select to reduce API payload sizes"
```

---

## Track 3: Behavioral Tracking Infrastructure

### Task 3.1: Add Prisma schema for UserEvent and RecommendationScore

**Files:**
- Modify: `prisma/schema.prisma`

**Step 1: Add new enums and models**

Add to the end of the schema file (before any closing comments):

```prisma
// ===== BEHAVIORAL TRACKING =====

enum EventType {
  VIEW
  SAVE
  UNSAVE
  LIKE
  UNLIKE
  CLICK
  SEARCH
  FILTER_CHANGE
  SHARE
}

enum TargetType {
  MOMENT
  PLACE
  TRIP
  USER
}

model UserEvent {
  id         String      @id @default(cuid())
  userId     String
  user       User        @relation("UserEvents", fields: [userId], references: [id], onDelete: Cascade)
  eventType  EventType
  targetId   String?
  targetType TargetType?
  metadata   Json?
  createdAt  DateTime    @default(now())

  @@index([userId, eventType, createdAt])
  @@index([targetId, targetType])
  @@index([createdAt])
  @@map("user_events")
}

model RecommendationScore {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation("RecommendationScores", fields: [userId], references: [id], onDelete: Cascade)
  momentId   String
  moment     Post     @relation("RecommendationScores", fields: [momentId], references: [id], onDelete: Cascade)
  score      Float
  factors    Json?
  computedAt DateTime @default(now())

  @@unique([userId, momentId])
  @@index([userId, score])
  @@map("recommendation_scores")
}
```

**Step 2: Add relations to User and Post models**

In the `User` model, add:
```prisma
events               UserEvent[]          @relation("UserEvents")
recommendationScores RecommendationScore[] @relation("RecommendationScores")
```

In the `Post` model, add:
```prisma
recommendationScores RecommendationScore[] @relation("RecommendationScores")
```

**Step 3: Generate and run migration**

```bash
npx prisma migrate dev --name add-behavioral-tracking
```

Expected: Migration creates `user_events` and `recommendation_scores` tables.

**Step 4: Verify and commit**

```bash
npx prisma generate
npm run build
git add prisma/
git commit -m "feat: add UserEvent and RecommendationScore Prisma models for behavioral tracking"
```

---

### Task 3.2: Create event collector API route

**Files:**
- Create: `src/app/api/events/route.ts`

**Step 1: Create the API route**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

const eventSchema = z.object({
  eventType: z.enum(['VIEW', 'SAVE', 'UNSAVE', 'LIKE', 'UNLIKE', 'CLICK', 'SEARCH', 'FILTER_CHANGE', 'SHARE']),
  targetId: z.string().optional(),
  targetType: z.enum(['MOMENT', 'PLACE', 'TRIP', 'USER']).optional(),
  metadata: z.record(z.unknown()).optional(),
});

const batchSchema = z.object({
  events: z.array(eventSchema).min(1).max(20),
});

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
      { status: 401 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json(
      { error: { message: 'User not found', code: 'NOT_FOUND' } },
      { status: 404 }
    );
  }

  const body = await request.json();
  const parsed = batchSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: 'Invalid events', code: 'VALIDATION_ERROR' } },
      { status: 400 }
    );
  }

  // Fire-and-forget: don't await, don't block response
  prisma.userEvent.createMany({
    data: parsed.data.events.map((event) => ({
      userId: user.id,
      eventType: event.eventType,
      targetId: event.targetId,
      targetType: event.targetType,
      metadata: event.metadata ?? undefined,
    })),
  }).catch((err) => console.error('Event tracking error:', err));

  return NextResponse.json({ ok: true });
}
```

**Step 2: Verify build**

Run: `npm run build`

**Step 3: Commit**

```bash
git add src/app/api/events/
git commit -m "feat: add batched event collector API route for behavioral tracking"
```

---

### Task 3.3: Create client-side event tracker

**Files:**
- Create: `src/lib/tracking/event-tracker.ts`

**Step 1: Create the tracker singleton**

```typescript
type EventType = 'VIEW' | 'SAVE' | 'UNSAVE' | 'LIKE' | 'UNLIKE' | 'CLICK' | 'SEARCH' | 'FILTER_CHANGE' | 'SHARE';
type TargetType = 'MOMENT' | 'PLACE' | 'TRIP' | 'USER';

interface TrackingEvent {
  eventType: EventType;
  targetId?: string;
  targetType?: TargetType;
  metadata?: Record<string, unknown>;
}

const FLUSH_INTERVAL = 5000; // 5 seconds
const MAX_BATCH_SIZE = 20;

class EventTracker {
  private buffer: TrackingEvent[] = [];
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.timer = setInterval(() => this.flush(), FLUSH_INTERVAL);
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') this.flush();
      });
      window.addEventListener('beforeunload', () => this.flush());
    }
  }

  track(eventType: EventType, targetId?: string, targetType?: TargetType, metadata?: Record<string, unknown>) {
    this.buffer.push({ eventType, targetId, targetType, metadata });
    if (this.buffer.length >= MAX_BATCH_SIZE) {
      this.flush();
    }
  }

  private flush() {
    if (this.buffer.length === 0) return;

    const events = this.buffer.splice(0, MAX_BATCH_SIZE);

    // Fire-and-forget — never block UI
    fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events }),
      keepalive: true, // Ensures request completes even on page unload
    }).catch(() => {
      // Silent failure — tracking should never break the app
    });
  }

  destroy() {
    if (this.timer) clearInterval(this.timer);
    this.flush();
  }
}

// Singleton
export const tracker = typeof window !== 'undefined' ? new EventTracker() : null;
```

**Step 2: Verify build**

Run: `npm run build`

**Step 3: Commit**

```bash
git add src/lib/tracking/
git commit -m "feat: add client-side event tracker with batching and page-unload flush"
```

---

### Task 3.4: Create useTrackView hook and integrate tracking

**Files:**
- Create: `src/lib/hooks/useTrackView.ts`
- Modify: `src/components/moments/MomentCard.tsx` — add view tracking
- Modify: `src/components/moments/MomentCard.tsx` — add save/like tracking
- Modify: `src/app/(authenticated)/explore/page.tsx` — add filter/search tracking

**Step 1: Create useTrackView hook**

```typescript
import { useEffect, useRef } from 'react';
import { tracker } from '@/lib/tracking/event-tracker';

/**
 * Track a VIEW event when the element is visible for at least `threshold` ms.
 */
export function useTrackView(
  targetId: string,
  targetType: 'MOMENT' | 'PLACE' | 'TRIP' | 'USER',
  thresholdMs: number = 2000
) {
  const ref = useRef<HTMLDivElement>(null);
  const tracked = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || tracked.current) return;

    let timer: ReturnType<typeof setTimeout>;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !tracked.current) {
          timer = setTimeout(() => {
            tracker?.track('VIEW', targetId, targetType);
            tracked.current = true;
            observer.disconnect();
          }, thresholdMs);
        } else {
          clearTimeout(timer);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [targetId, targetType, thresholdMs]);

  return ref;
}
```

**Step 2: Add view tracking to MomentCard**

In `src/components/moments/MomentCard.tsx`, wrap the card in the ref:
```typescript
import { useTrackView } from '@/lib/hooks/useTrackView';

// Inside the component:
const viewRef = useTrackView(moment.id, 'MOMENT');

// Wrap the outer div:
<div ref={viewRef} className="...">
```

**Step 3: Add event tracking to save/like toggles**

In components that handle save/like, add tracker calls:
```typescript
import { tracker } from '@/lib/tracking/event-tracker';

// After a successful save toggle:
tracker?.track(isSaved ? 'UNSAVE' : 'SAVE', momentId, 'MOMENT');

// After a successful like toggle:
tracker?.track(isLiked ? 'UNLIKE' : 'LIKE', momentId, 'MOMENT');
```

**Step 4: Add search/filter tracking to Explore page**

In `src/app/(authenticated)/explore/page.tsx`:
```typescript
import { tracker } from '@/lib/tracking/event-tracker';

// On search submit (debounced):
tracker?.track('SEARCH', undefined, undefined, { query: searchTerm });

// On filter change:
tracker?.track('FILTER_CHANGE', undefined, undefined, { filter: selectedFilter, country: selectedCountry });
```

**Step 5: Verify build and commit**

```bash
npm run build
git add src/lib/hooks/useTrackView.ts src/components/moments/ src/app/\(authenticated\)/explore/
git commit -m "feat: integrate behavioral event tracking in MomentCard, save/like, and Explore"
```

---

## Track 4: Recommendation Engine v2

### Task 4.1: Build behavioral scoring functions

**Files:**
- Create: `src/lib/ai/scoring.ts`

**Step 1: Create the scoring module**

```typescript
import { prisma } from '@/lib/db/prisma';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const DAY_MS = 86400000;

/**
 * Compute dynamic interest affinities from behavioral events (last 30 days).
 * Returns a map of category → affinity score (0-1).
 */
export async function computeInterestAffinities(userId: string): Promise<Map<string, number>> {
  const since = new Date(Date.now() - THIRTY_DAYS_MS);

  const events = await prisma.userEvent.findMany({
    where: {
      userId,
      eventType: { in: ['VIEW', 'SAVE', 'LIKE'] },
      targetType: 'MOMENT',
      createdAt: { gte: since },
    },
    select: {
      eventType: true,
      targetId: true,
      createdAt: true,
    },
  });

  if (events.length === 0) return new Map();

  // Get categories for the moments involved
  const momentIds = [...new Set(events.filter(e => e.targetId).map(e => e.targetId!))];
  const moments = await prisma.post.findMany({
    where: { id: { in: momentIds } },
    select: { id: true, place: { select: { category: true } } },
  });

  const momentCategoryMap = new Map<string, string>();
  for (const m of moments) {
    if (m.place?.category) momentCategoryMap.set(m.id, m.place.category);
  }

  // Weight events: SAVE=3, LIKE=2, VIEW=1
  const weights: Record<string, number> = { SAVE: 3, LIKE: 2, VIEW: 1 };
  const categoryScores = new Map<string, number>();

  for (const event of events) {
    if (!event.targetId) continue;
    const category = momentCategoryMap.get(event.targetId);
    if (!category) continue;

    // Temporal decay: recent events matter more
    const ageMs = Date.now() - new Date(event.createdAt).getTime();
    const decay = Math.exp(-ageMs / (THIRTY_DAYS_MS / 2));
    const weight = (weights[event.eventType] ?? 1) * decay;

    categoryScores.set(category, (categoryScores.get(category) ?? 0) + weight);
  }

  // Normalize to 0-1
  const maxScore = Math.max(...categoryScores.values(), 1);
  const affinities = new Map<string, number>();
  for (const [cat, score] of categoryScores) {
    affinities.set(cat, score / maxScore);
  }

  return affinities;
}

/**
 * Compute social score for a moment: what fraction of followed users engaged with it.
 */
export async function computeSocialScore(
  userId: string,
  momentId: string,
  followingIds: Set<string>
): Promise<number> {
  if (followingIds.size === 0) return 0;

  const engagements = await prisma.userEvent.count({
    where: {
      userId: { in: [...followingIds] },
      targetId: momentId,
      targetType: 'MOMENT',
      eventType: { in: ['SAVE', 'LIKE'] },
    },
  });

  return Math.min(engagements / followingIds.size, 1);
}

/**
 * Compute quality score with confidence penalty.
 * Moments with fewer than 5 total ratings get penalized.
 */
export function computeQualityScore(compositeScore: number | null, ratingCount: number): number {
  if (compositeScore == null) return 0;
  const confidence = Math.min(ratingCount / 5, 1);
  return (compositeScore / 10) * confidence;
}

/**
 * Compute freshness score with recency boost.
 */
export function computeFreshnessScore(createdAt: Date): number {
  const ageDays = (Date.now() - createdAt.getTime()) / DAY_MS;
  const decay = Math.exp(-ageDays / 14);
  // 1.5x boost for moments < 48 hours old
  const boost = ageDays < 2 ? 1.5 : 1;
  return decay * boost;
}
```

**Step 2: Verify build**

Run: `npm run build`

**Step 3: Commit**

```bash
git add src/lib/ai/scoring.ts
git commit -m "feat: add behavioral scoring functions — interest affinities, social, quality, freshness"
```

---

### Task 4.2: Build recommendation computation pipeline

**Files:**
- Create: `src/lib/ai/compute-recommendations.ts`

**Step 1: Create the pipeline**

```typescript
import { prisma } from '@/lib/db/prisma';
import {
  computeInterestAffinities,
  computeSocialScore,
  computeQualityScore,
  computeFreshnessScore,
} from './scoring';

// Tunable weights
const WEIGHTS = {
  interest: 3.0,
  social: 2.0,
  behavioral: 3.0,
  quality: 1.5,
  freshness: 1.0,
  discovery: 0.5,
};

/**
 * Map PlaceCategory → InterestCategory for interest matching.
 */
const CATEGORY_TO_INTEREST: Record<string, string> = {
  RESTAURANT: 'FOOD_DRINK', CAFE: 'FOOD_DRINK', BAR: 'FOOD_DRINK',
  MUSEUM: 'ART_CULTURE', GALLERY: 'ART_CULTURE',
  PARK: 'OUTDOORS_NATURE', BEACH: 'OUTDOORS_NATURE', VIEWPOINT: 'OUTDOORS_NATURE',
  NIGHTCLUB: 'NIGHTLIFE',
  MARKET: 'SHOPPING', SHOP: 'SHOPPING',
  MONUMENT: 'HISTORY', LANDMARK: 'HISTORY',
  TOUR: 'ADVENTURE', ACTIVITY: 'ADVENTURE',
  HOTEL: 'RELAXATION', HOSTEL: 'RELAXATION',
  HIDDEN_GEM: 'LOCAL_EXPERIENCES',
};

interface ScoredMoment {
  momentId: string;
  score: number;
  factors: Record<string, number>;
}

/**
 * Compute recommendation scores for a single user.
 */
export async function computeRecommendationsForUser(userId: string): Promise<ScoredMoment[]> {
  // Gather user context
  const [affinities, following] = await Promise.all([
    computeInterestAffinities(userId),
    prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    }),
  ]);

  const followingIds = new Set(following.map(f => f.followingId));

  // Get candidate moments (not by this user, has composite score)
  const candidates = await prisma.post.findMany({
    where: {
      userId: { not: userId },
      compositeScore: { not: null },
    },
    select: {
      id: true,
      userId: true,
      compositeScore: true,
      likeCount: true,
      viewCount: true,
      createdAt: true,
      place: { select: { category: true } },
      _count: { select: { saves: true } },
    },
  });

  if (candidates.length === 0) return [];

  // Get view→save conversion rates by category for behavioral scoring
  const userViewSaveCounts = await prisma.userEvent.groupBy({
    by: ['eventType'],
    where: {
      userId,
      targetType: 'MOMENT',
      eventType: { in: ['VIEW', 'SAVE'] },
    },
    _count: true,
  });
  const viewCount = userViewSaveCounts.find(e => e.eventType === 'VIEW')?._count ?? 0;
  const saveCount = userViewSaveCounts.find(e => e.eventType === 'SAVE')?._count ?? 0;
  const globalSaveRate = viewCount > 0 ? saveCount / viewCount : 0.1;

  // Determine categories the user has NOT engaged with (for discovery)
  const allCategories = new Set(candidates.map(c => c.place?.category).filter(Boolean) as string[]);
  const seenCategories = new Set(affinities.keys());
  const unseenCategories = [...allCategories].filter(c => !seenCategories.has(c));

  // Score each candidate
  const scored: ScoredMoment[] = [];

  for (const candidate of candidates) {
    const category = candidate.place?.category;
    const interestCategory = category ? CATEGORY_TO_INTEREST[category] : null;

    // Interest score (from behavioral affinities)
    const interestScore = interestCategory && affinities.has(interestCategory)
      ? affinities.get(interestCategory)!
      : (category && affinities.has(category) ? affinities.get(category)! : 0);

    // Social score
    const socialScore = followingIds.has(candidate.userId) ? 0.5 : 0;
    // Note: full social scoring (computeSocialScore) is expensive per-moment,
    // so we use a lightweight "is following" check for batch computation.
    // The full version can be used for re-ranking top N results.

    // Behavioral score (predict save likelihood)
    const behavioralScore = interestScore > 0 ? interestScore * globalSaveRate * 10 : globalSaveRate;

    // Quality score
    const ratingCount = [candidate.compositeScore].filter(x => x != null).length;
    const qualityScore = computeQualityScore(candidate.compositeScore, Math.max(ratingCount, candidate._count.saves));

    // Freshness score
    const freshnessScore = computeFreshnessScore(candidate.createdAt);

    // Discovery boost (for unseen categories)
    const discoveryBoost = category && unseenCategories.includes(category) ? 1.0 : 0;

    // Weighted total
    const totalScore =
      WEIGHTS.interest * interestScore +
      WEIGHTS.social * socialScore +
      WEIGHTS.behavioral * behavioralScore +
      WEIGHTS.quality * qualityScore +
      WEIGHTS.freshness * freshnessScore +
      WEIGHTS.discovery * discoveryBoost;

    scored.push({
      momentId: candidate.id,
      score: totalScore,
      factors: {
        interest: interestScore,
        social: socialScore,
        behavioral: behavioralScore,
        quality: qualityScore,
        freshness: freshnessScore,
        discovery: discoveryBoost,
      },
    });
  }

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  return scored;
}

/**
 * Compute and store recommendations for a user.
 */
export async function refreshRecommendationsForUser(userId: string): Promise<void> {
  const scored = await computeRecommendationsForUser(userId);

  if (scored.length === 0) return;

  // Delete old scores, insert new ones
  await prisma.$transaction([
    prisma.recommendationScore.deleteMany({ where: { userId } }),
    prisma.recommendationScore.createMany({
      data: scored.map(s => ({
        userId,
        momentId: s.momentId,
        score: s.score,
        factors: s.factors,
      })),
    }),
  ]);
}

/**
 * Compute recommendations for all active users (logged in within 7 days).
 */
export async function refreshAllRecommendations(): Promise<number> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const activeUsers = await prisma.user.findMany({
    where: {
      sessions: { some: { expires: { gte: sevenDaysAgo } } },
    },
    select: { id: true },
  });

  let count = 0;
  for (const user of activeUsers) {
    await refreshRecommendationsForUser(user.id);
    count++;
  }

  return count;
}
```

**Step 2: Verify build**

Run: `npm run build`

**Step 3: Commit**

```bash
git add src/lib/ai/compute-recommendations.ts
git commit -m "feat: add recommendation computation pipeline with multi-signal behavioral scoring"
```

---

### Task 4.3: Create recommendations refresh API route

**Files:**
- Create: `src/app/api/recommendations/refresh/route.ts`

**Step 1: Create the route**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { refreshRecommendationsForUser } from '@/lib/ai/compute-recommendations';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
      { status: 401 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json(
      { error: { message: 'User not found', code: 'NOT_FOUND' } },
      { status: 404 }
    );
  }

  await refreshRecommendationsForUser(user.id);

  return NextResponse.json({ ok: true, message: 'Recommendations refreshed' });
}
```

**Step 2: Verify build and commit**

```bash
npm run build
git add src/app/api/recommendations/
git commit -m "feat: add recommendations refresh API route"
```

---

### Task 4.4: Update moments API to use pre-computed recommendations

**Files:**
- Modify: `src/app/api/moments/route.ts`

**Step 1: Update the recommended filter logic**

In `src/app/api/moments/route.ts`, find the section where `filter === 'recommended'` is handled. Replace the inline call to `getRecommendedMomentIds()` with a query to the `RecommendationScore` table, falling back to the old algorithm if no pre-computed scores exist:

```typescript
// When filter === 'recommended'
let specificIds: string[] | null = null;

if (filter === 'recommended' && currentUser) {
  // Try pre-computed scores first
  const precomputed = await prisma.recommendationScore.findMany({
    where: { userId: currentUser.id },
    orderBy: { score: 'desc' },
    select: { momentId: true },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  if (precomputed.length > 0) {
    specificIds = precomputed.map(r => r.momentId);
  } else {
    // Fallback to legacy inline algorithm for cold start
    const recommended = await getRecommendedMomentIds(currentUser.id, pageSize, (page - 1) * pageSize);
    specificIds = recommended.ids;
  }
}
```

Also trigger a background refresh when serving recommendations (so scores stay fresh):
```typescript
// After serving the response, refresh in background (fire-and-forget)
if (filter === 'recommended' && currentUser) {
  refreshRecommendationsForUser(currentUser.id).catch(() => {});
}
```

**Step 2: Verify build and commit**

```bash
npm run build
git add src/app/api/moments/
git commit -m "feat: serve recommendations from pre-computed scores with legacy fallback"
```

---

### Task 4.5: Add cold start handling for new users

**Files:**
- Modify: `src/lib/ai/compute-recommendations.ts`

**Step 1: Add cold start logic at the top of computeRecommendationsForUser**

After computing affinities, check if user has enough behavioral data:

```typescript
// Cold start: if user has fewer than 10 events, use onboarding interests
const eventCount = await prisma.userEvent.count({ where: { userId } });

if (eventCount < 10) {
  // Fall back to stated interests from onboarding
  const interests = await prisma.userInterest.findMany({
    where: { userId },
    select: { category: true, weight: true },
  });
  for (const interest of interests) {
    if (!affinities.has(interest.category)) {
      affinities.set(interest.category, interest.weight / 5); // Normalize weight to 0-1
    }
  }
}
```

**Step 2: Verify build and commit**

```bash
npm run build
git add src/lib/ai/
git commit -m "feat: add cold start handling — fall back to onboarding interests for new users"
```

---

## Final Verification

### Task 5.1: Full build and verification

**Step 1: Run full build**

```bash
npm run build
```

Expected: Clean build, 0 errors, all routes generated.

**Step 2: Verify no TypeScript errors**

```bash
npx tsc --noEmit
```

**Step 3: Final commit if any remaining changes**

```bash
git add -A
git commit -m "chore: final cleanup for performance and AI engine overhaul"
```
