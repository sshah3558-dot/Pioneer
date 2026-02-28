# Pioneer Performance & AI Recommendation Engine Design

**Date:** 2026-02-27
**Approach:** Big Bang (all tracks in parallel)
**Scope:** Platform-wide performance overhaul + behavioral recommendation engine v2

---

## Track 1: Image & Rendering Performance

### 1a. Next.js Image Migration
- Replace all `<img>` tags with Next.js `<Image>` component across every component
- Automatic lazy loading, responsive `srcSet`, WebP/AVIF auto-conversion
- Mark above-fold images with `priority` for preloading
- Add Supabase domain + ui-avatars.com to `next.config.ts` `images.remotePatterns`
- **Files:** MomentCard, FeedCard, ProfileHeader, TripPlannerCard, RankingCard, TopNav, ForumPost, all avatar renderers

### 1b. Supabase Image Transforms
- Use Supabase on-the-fly transforms: `/render/image/public/{bucket}/{path}?width=400&height=300&quality=75`
- Create `src/lib/utils/image-url.ts` with `getOptimizedImageUrl(url, { width, height, quality })` utility
- Preset sizes: feed thumbnails (400x300), explore grid (600x400), profile cards (300x200), full-size on detail/carousel

### 1c. Blur Placeholders
- Generate tiny base64 blurDataURL during upload (canvas resize to 10px, encode base64)
- Store blurHash in the Post/Place model (new `blurDataUrl` field)
- Use `placeholder="blur"` on Next.js Image components for instant perceived loading

### 1d. Code Splitting
- `dynamic(() => import(...))` for heavy modals: CreateMoment, CreateTripModal, ReviewForm
- Reduces initial page bundle size

---

## Track 2: Data Layer & Caching

### 2a. React Query Tuning
- `staleTime`: 1 min → 5 min for most queries
- `staleTime: Infinity` for static data (countries, cities, forum categories)
- `prefetchQuery` on link hover for pre-loading next page data
- `placeholderData: keepPreviousData` on paginated queries

### 2b. API Response Optimization
- Switch Prisma queries from `include` to `select` — only fetch fields actually rendered
- Estimated payload reduction: 30-50%
- Target files: `/api/feed/route.ts`, `/api/moments/route.ts`, `/api/posts/route.ts`, `/api/places/route.ts`

### 2c. Server-Side Caching Headers
- `Cache-Control: public, s-maxage=300, stale-while-revalidate=600` for:
  - `/api/places`, `/api/cities`, `/api/countries`, `/api/forums`
- `private, no-cache` for user-specific routes (`/api/feed`, `/api/posts?userId=me`)

### 2d. Pre-computation
- Pre-compute recommendation scores (see Track 4)
- Store in `RecommendationScore` table
- API reads pre-computed scores instead of computing inline

---

## Track 3: Behavioral Tracking Infrastructure

### 3a. New Prisma Models

```prisma
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
  id         String     @id @default(cuid())
  userId     String
  user       User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  eventType  EventType
  targetId   String?
  targetType TargetType?
  metadata   Json?
  createdAt  DateTime   @default(now())

  @@index([userId, eventType, createdAt])
  @@index([targetId, targetType])
}

model RecommendationScore {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  momentId   String
  moment     Post     @relation(fields: [momentId], references: [id], onDelete: Cascade)
  score      Float
  factors    Json?
  computedAt DateTime @default(now())

  @@unique([userId, momentId])
  @@index([userId, score])
}
```

### 3b. Event Collector API
- `POST /api/events` — accepts batched events (up to 20 per request)
- Lightweight validation, async DB write
- Rate limited: 60 requests/min per user

### 3c. Client-Side Event Tracker
- `src/lib/tracking/event-tracker.ts` — singleton with `track(eventType, targetId, targetType, metadata?)`
- In-memory buffer, flushes every 5 seconds or on `visibilitychange` / `beforeunload`
- Intersection observer: track VIEW when moment card visible for 2+ seconds
- Fire-and-forget — never blocks UI

### 3d. Historical Backfill
- Seed from existing likes → LIKE events
- Seed from existing saves → SAVE events
- Seed from existing viewCount → approximate VIEW events
- One-time migration script

---

## Track 4: Recommendation Engine v2

### 4a. Scoring Formula

```
TOTAL_SCORE =
    w_interest   * InterestScore
  + w_social     * SocialScore
  + w_behavioral * BehavioralScore
  + w_quality    * QualityScore
  + w_freshness  * FreshnessScore
  + w_discovery  * DiscoveryBoost
```

Initial weights: `interest=3.0, social=2.0, behavioral=3.0, quality=1.5, freshness=1.0, discovery=0.5`

### 4b. Signal Definitions

**InterestScore** — Dynamic category affinity from behavior:
- Analyze last 30 days of VIEW/SAVE/LIKE events by place category
- Weight: SAVE 3x, LIKE 2x, VIEW 1x
- Temporal decay: recent events weighted more
- Output: `{ FOOD_DRINK: 0.8, OUTDOORS: 0.6, ... }` normalized to 0-1

**SocialScore** — Lightweight collaborative filtering:
- Count followed users who engaged with the moment / total following count
- Score range: 0-1

**BehavioralScore** — Personal engagement prediction:
- Per-user view→save conversion rate by category
- Predict save probability for unseen moments
- Downrank categories with high view but zero save rate

**QualityScore** — Rating with confidence penalty:
- `compositeScore / 10 * min(1, ratingCount / 5)`
- Moments with < 5 ratings get penalized proportionally

**FreshnessScore** — Recency with boost:
- `exp(-ageDays / 14)` base decay
- 1.5x multiplier for moments < 48 hours old

**DiscoveryBoost** — Anti-filter-bubble:
- 80% personalized (highest scoring)
- 20% exploration (random high-quality moments from unseen categories)

### 4c. Pre-computation Pipeline
- Trigger: moment create/update, OR every 6 hours via cron/scheduled function
- Process: For each active user (logged in within 7 days), score all eligible moments
- Write to `RecommendationScore` table
- API reads: `SELECT momentId FROM RecommendationScore WHERE userId = ? ORDER BY score DESC LIMIT ? OFFSET ?`

### 4d. Cold Start Strategy
- New users (no events): Stated interests from onboarding + popular moments (by engagement)
- New moments (no engagement): Boost by author credibility (follower count, avg rating) + category popularity
- Transition to behavioral scoring after 10+ tracked events

### 4e. API Changes
- `/api/moments?filter=recommended` reads from RecommendationScore table
- `/api/recommendations/refresh` for manual recomputation
- Optional `factors` field in response for debugging transparency

---

## Implementation Strategy

All 4 tracks run in parallel since they touch different parts of the codebase:

| Track | Files Touched | Dependencies |
|-------|--------------|--------------|
| 1 (Images) | Components, next.config.ts, upload route | None |
| 2 (Caching) | API routes, providers.tsx | None |
| 3 (Tracking) | New files + Prisma schema | Schema migration |
| 4 (Recommendations) | src/lib/ai/recommendations.ts, moments API | Track 3 (needs UserEvent table) |

Track 4 depends on Track 3's schema being in place, but can be developed in parallel and integrated once migrations run.

---

## Success Criteria

- **Performance:** Images load in < 500ms (currently 2-3s), page transitions feel instant
- **Payload:** API responses 30-50% smaller
- **Recommendations:** Users engage (save/like) with recommended moments at 2x the rate of random moments
- **Tracking:** Event collector handles 100+ events/user/session without UI impact
