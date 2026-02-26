# Pioneer Overhaul Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform Pioneer from a generic social travel app into a moments-focused platform with rated experiences, Belli-style rankings, AI recommendations, and dark mode.

**Architecture:** Extend the existing Prisma `Post` model with rating fields and composite scoring. Replace Forums tab with a Rankings page. Overhaul Explore to show moments with color-coded scores. Add `next-themes` for dark mode. Build rule-based recommendation engine in `src/lib/ai/recommendations.ts`.

**Tech Stack:** Next.js 16, Prisma, TypeScript, Tailwind CSS v4, next-themes, React Query, Zod

---

## Task 1: Prisma Schema — Extend Post Model for Moments

**Files:**
- Modify: `prisma/schema.prisma` (Post model, ~line 469)

**Step 1: Add moment fields to Post model**

Replace the existing Post model with:

```prisma
model Post {
  id        String   @id @default(cuid())
  userId    String
  content   String   @db.Text
  imageUrl  String?
  imageUrl2 String?
  imageUrl3 String?
  likeCount Int      @default(0)
  viewCount Int      @default(0)

  // Moment ratings (1-5)
  overallRating      Int?
  valueRating        Int?
  authenticityRating Int?
  crowdRating        Int?

  // Computed
  compositeScore Float?
  rank           Int?     // Position among user's moments

  // Place reference
  placeId String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user  User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  place Place? @relation(fields: [placeId], references: [id])
  saves MomentSave[]

  @@index([userId])
  @@index([createdAt])
  @@index([compositeScore])
  @@index([viewCount])
  @@map("posts")
}

model MomentSave {
  id       String   @id @default(cuid())
  userId   String
  postId   String
  savedAt  DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  post Post @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@unique([userId, postId])
  @@map("moment_saves")
}
```

Also add to the User model relations section (after existing relations):
```prisma
  momentSaves MomentSave[]
```

Also add to the Place model relations section:
```prisma
  moments Post[]
```

**Step 2: Generate Prisma client and push schema**

Run: `npx prisma generate`
Run: `npx prisma db push` (if DB is connected) or just verify with `npx tsc --noEmit`

**Step 3: Commit**

```
git add prisma/schema.prisma
git commit -m "feat: extend Post model with moment ratings, composite score, and saves"
```

---

## Task 2: Composite Score Utility & Ranking Logic

**Files:**
- Create: `src/lib/services/moments.ts`

**Step 1: Create moment scoring and ranking service**

```typescript
import { prisma } from '@/lib/db/prisma';

/**
 * Compute composite score from 4 category ratings.
 * Formula: (overall*0.4 + value*0.2 + authenticity*0.2 + crowd*0.2) * 2
 * Result: 1.0 to 10.0 scale
 */
export function computeCompositeScore(
  overall: number,
  value?: number | null,
  authenticity?: number | null,
  crowd?: number | null,
): number {
  const v = value ?? overall;
  const a = authenticity ?? overall;
  const c = crowd ?? overall;
  const raw = overall * 0.4 + v * 0.2 + a * 0.2 + c * 0.2;
  return Math.round(raw * 2 * 10) / 10; // 1 decimal place, scale to 10
}

/**
 * Recompute ranks for all moments by a user.
 * Rank 1 = highest composite score.
 */
export async function recomputeUserRanks(userId: string): Promise<void> {
  const moments = await prisma.post.findMany({
    where: { userId, compositeScore: { not: null } },
    orderBy: { compositeScore: 'desc' },
    select: { id: true },
  });

  // Update ranks in parallel batches
  await prisma.$transaction(
    moments.map((m, i) =>
      prisma.post.update({
        where: { id: m.id },
        data: { rank: i + 1 },
      })
    )
  );
}

/**
 * Get the color class for a composite score badge.
 */
export function getScoreColor(score: number): string {
  if (score >= 8.0) return 'bg-green-600';
  if (score >= 6.0) return 'bg-lime-500';
  if (score >= 4.0) return 'bg-amber-500';
  return 'bg-red-500';
}

/**
 * Get the hex color for a composite score (for inline styles).
 */
export function getScoreHex(score: number): string {
  if (score >= 8.0) return '#16A34A';
  if (score >= 6.0) return '#84CC16';
  if (score >= 4.0) return '#F59E0B';
  return '#EF4444';
}
```

**Step 2: Commit**

```
git add src/lib/services/moments.ts
git commit -m "feat: add composite score computation and ranking logic"
```

---

## Task 3: Moments API — Create & List

**Files:**
- Modify: `src/app/api/posts/route.ts` (update POST to accept ratings, add moment query support)
- Create: `src/app/api/moments/route.ts` (public moments listing for Explore)
- Create: `src/app/api/moments/[id]/save/route.ts` (save/unsave moments)

**Step 1: Update POST /api/posts to support moments**

In `src/app/api/posts/route.ts`, update the `createPostSchema` and POST handler:

```typescript
const createPostSchema = z.object({
  content: z.string().min(1, 'Post content is required').max(2000),
  imageUrl: z.string().url().optional(),
  imageUrl2: z.string().url().optional(),
  imageUrl3: z.string().url().optional(),
  overallRating: z.number().min(1).max(5).optional(),
  valueRating: z.number().min(1).max(5).optional(),
  authenticityRating: z.number().min(1).max(5).optional(),
  crowdRating: z.number().min(1).max(5).optional(),
  placeId: z.string().optional(),
});
```

In the POST handler, after creating the post, if `overallRating` is provided:
1. Compute composite score using `computeCompositeScore()`
2. Update the post with the score
3. Call `recomputeUserRanks(userId)`

**Step 2: Create GET /api/moments for Explore page**

File: `src/app/api/moments/route.ts`

Accepts query params: `filter` (recommended|mostViewed|topRated), `country`, `search`, `page`, `pageSize`

Returns moments with user info, place info, composite scores, and isSaved status.

**Step 3: Create POST/DELETE /api/moments/[id]/save**

File: `src/app/api/moments/[id]/save/route.ts`

Toggle save/unsave a moment for the current user using MomentSave model.

**Step 4: Commit**

```
git add src/app/api/posts/route.ts src/app/api/moments/
git commit -m "feat: add moments API with ratings, composite scores, and save/unsave"
```

---

## Task 4: Recommendation Engine

**Files:**
- Create: `src/lib/ai/recommendations.ts`

**Step 1: Implement rule-based recommendation scoring**

```typescript
import { prisma } from '@/lib/db/prisma';

interface ScoredMoment {
  postId: string;
  score: number;
}

/**
 * Score moments for the "Recommended" filter on Explore.
 * Factors: interest match, following boost, engagement, recency, quality.
 */
export async function getRecommendedMomentIds(
  userId: string,
  limit: number = 20,
  offset: number = 0,
): Promise<{ ids: string[]; total: number }> {
  // 1. Get user's interests and following list
  const [interests, following] = await Promise.all([
    prisma.userInterest.findMany({
      where: { userId },
      select: { category: true, weight: true },
    }),
    prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    }),
  ]);

  const interestMap = new Map(interests.map(i => [i.category, i.weight]));
  const followingIds = new Set(following.map(f => f.followingId));

  // 2. Get all scored moments (exclude user's own)
  const moments = await prisma.post.findMany({
    where: {
      compositeScore: { not: null },
      userId: { not: userId },
    },
    include: {
      place: { select: { category: true } },
    },
    select: {
      id: true,
      userId: true,
      compositeScore: true,
      likeCount: true,
      viewCount: true,
      createdAt: true,
      place: { select: { category: true } },
    },
  });

  // 3. Score each moment
  const now = Date.now();
  const DAY_MS = 86400000;
  const maxEngagement = Math.max(...moments.map(m => m.likeCount + m.viewCount), 1);

  const scored: ScoredMoment[] = moments.map(m => {
    let score = 0;

    // Interest match: +3 if place category matches user interest
    if (m.place?.category && interestMap.has(m.place.category)) {
      score += 3 * (interestMap.get(m.place.category) || 1);
    }

    // Following boost: +2 if from a followed user
    if (followingIds.has(m.userId)) {
      score += 2;
    }

    // Engagement (normalized 0-2)
    const engagement = (m.likeCount + m.viewCount) / maxEngagement;
    score += engagement * 2;

    // Recency (exponential decay, max 1 for today, ~0 after 30 days)
    const ageMs = now - new Date(m.createdAt).getTime();
    const ageDays = ageMs / DAY_MS;
    score += Math.exp(-ageDays / 10);

    // Quality (composite score / 10, range 0-1)
    score += (m.compositeScore || 0) / 10;

    return { postId: m.id, score };
  });

  // 4. Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  return {
    ids: scored.slice(offset, offset + limit).map(s => s.postId),
    total: scored.length,
  };
}
```

**Step 2: Commit**

```
git add src/lib/ai/recommendations.ts
git commit -m "feat: add rule-based recommendation engine for Explore"
```

---

## Task 5: Navigation — Forums → Rankings

**Files:**
- Modify: `src/components/layout/TopNav.tsx` (line 20)
- Modify: `src/components/layout/BottomNav.tsx` (line 18)

**Step 1: Update TopNav**

Change line 20 from:
```typescript
{ href: '/forums', label: 'Forums', emoji: '\u{1F4AC}' },
```
To:
```typescript
{ href: '/forums', label: 'Rankings', emoji: '\u{1F3C6}' },
```

**Step 2: Update BottomNav**

Change line 18 from:
```typescript
{ href: '/forums', label: 'Forums', icon: <MessageSquare className="w-5 h-5" /> },
```
To:
```typescript
{ href: '/forums', label: 'Rankings', icon: <Trophy className="w-5 h-5" /> },
```

Add `Trophy` to the import from lucide-react (line 5).

**Step 3: Commit**

```
git add src/components/layout/TopNav.tsx src/components/layout/BottomNav.tsx
git commit -m "feat: rename Forums tab to Rankings with trophy icon"
```

---

## Task 6: Rankings Page (replaces Forums)

**Files:**
- Rewrite: `src/app/(authenticated)/forums/page.tsx`
- Create: `src/components/rankings/RankingCard.tsx`
- Create: `src/components/rankings/CreateMoment.tsx`

**Step 1: Create RankingCard component**

`src/components/rankings/RankingCard.tsx` — Displays a single ranked moment with:
- Rank number (#1, #2, etc.) on the left
- Composite score badge (color-coded) on the left
- Photo thumbnail, comment, place name, ratings breakdown on the right
- Expandable for full detail with all 3 photos

**Step 2: Create CreateMoment component**

`src/components/rankings/CreateMoment.tsx` — Moment creation form with:
- Text input for brief comment (max 500 chars)
- Up to 3 photo uploads using `useImageUpload` hook
- 4 star rating inputs (Overall, Value, Authenticity, Crowd) using `AnimatedRatingStars`
- Optional place search/select
- Submit button that POSTs to `/api/posts` with rating fields
- On success, invalidates rankings query

**Step 3: Rewrite Forums page as Rankings**

`src/app/(authenticated)/forums/page.tsx` — Replace entirely with:
- Header: "My Rankings" with total count
- "Post a Moment" button that opens CreateMoment
- List of all user's moments sorted by compositeScore desc
- Each item uses RankingCard
- Empty state for new users

**Step 4: Commit**

```
git add src/app/(authenticated)/forums/page.tsx src/components/rankings/
git commit -m "feat: replace Forums with Belli-style Rankings page"
```

---

## Task 7: Explore Page Overhaul

**Files:**
- Rewrite: `src/app/(authenticated)/explore/page.tsx`
- Create: `src/components/explore/MomentCard.tsx`
- Create: `src/components/explore/ScoreBadge.tsx`

**Step 1: Create ScoreBadge component**

`src/components/explore/ScoreBadge.tsx` — Color-coded composite score display:
- 1.0-3.9: red bg
- 4.0-5.9: amber/orange bg
- 6.0-7.9: lime/yellow-green bg
- 8.0-10.0: green bg
- Shows score as "8.5" text in white

**Step 2: Create MomentCard component**

`src/components/explore/MomentCard.tsx` — Card for Explore grid:
- First photo fills top of card
- ScoreBadge positioned top-right
- User avatar + name bottom-left overlay
- Place name + country below image
- Instagram-style Bookmark save button bottom-right
- onClick save calls `/api/moments/:id/save`

**Step 3: Rewrite Explore page**

`src/app/(authenticated)/explore/page.tsx`:
- Header: "Explore" / "Discover amazing moments from travelers"
- Filter pills: Recommended (default), Most Viewed, Top Rated
- Country dropdown filter (fetches countries from `/api/places` or distinct countries)
- Search input (debounced)
- 2-column grid of MomentCards
- Fetches from `GET /api/moments?filter=...&country=...&search=...`
- Loading skeletons, empty state

**Step 4: Commit**

```
git add src/app/(authenticated)/explore/page.tsx src/components/explore/
git commit -m "feat: overhaul Explore page with moments, scores, and filters"
```

---

## Task 8: Feed Update — Moments in Feed

**Files:**
- Modify: `src/components/feed/FeedCard.tsx`
- Modify: `src/components/feed/CreatePost.tsx`
- Modify: `src/app/api/feed/route.ts`

**Step 1: Update FeedCard to show moment data**

Add to FeedCard for post-type activities:
- ScoreBadge overlay on image (top-right) when moment has compositeScore
- Rating pills below description (Overall: 4/5, Value: 3/5, etc.)
- Bookmark/save button in action bar

**Step 2: Update CreatePost to become CreateMoment**

Transform `CreatePost.tsx`:
- Add rating inputs (4 categories with AnimatedRatingStars)
- Add 2 more photo upload slots (up to 3 total)
- Add optional place search
- Update API call to include ratings
- Keep backward compatible (ratings are optional for regular posts)

**Step 3: Update Feed API to include moment data**

In `src/app/api/feed/route.ts`, update the posts query to include:
- `overallRating`, `valueRating`, `authenticityRating`, `crowdRating`
- `compositeScore`
- `place` relation (name, city, country)
- `imageUrl2`, `imageUrl3`

**Step 4: Commit**

```
git add src/components/feed/ src/app/api/feed/route.ts
git commit -m "feat: update feed to display moment scores and ratings"
```

---

## Task 9: Trips — Saved Moments Integration

**Files:**
- Modify: `src/app/(authenticated)/planner/page.tsx`
- Create: `src/components/trips/SavedMoments.tsx`

**Step 1: Create SavedMoments component**

`src/components/trips/SavedMoments.tsx`:
- Fetches user's saved moments from `GET /api/moments?saved=true`
- Displays as horizontal scroll of small cards
- Each card shows photo, score badge, place name
- "Add to Trip" button that opens trip selector
- Quick-add creates a TripStop from the moment's place

**Step 2: Add SavedMoments to Trips page**

Add a "Saved Moments" section at the top of the planner page, before the trip cards.

**Step 3: Commit**

```
git add src/app/(authenticated)/planner/page.tsx src/components/trips/SavedMoments.tsx
git commit -m "feat: add saved moments section to Trips page"
```

---

## Task 10: Dark Mode

**Files:**
- Modify: `package.json` (add next-themes)
- Modify: `src/app/providers.tsx` (add ThemeProvider)
- Modify: `src/app/layout.tsx` (add suppressHydrationWarning)
- Create: `src/components/shared/ThemeToggle.tsx`
- Modify: `src/components/layout/TopNav.tsx` (add theme toggle)
- Modify: `src/components/layout/AuthenticatedLayout.tsx` (fix hardcoded bg)
- Modify: Multiple component files (add dark: variants)

**Step 1: Install next-themes**

Run: `npm install next-themes`

**Step 2: Add ThemeProvider to Providers**

In `src/app/providers.tsx`, wrap with ThemeProvider:

```typescript
import { ThemeProvider } from 'next-themes';

export function Providers({ children }: { children: React.ReactNode }) {
  // ... existing queryClient ...
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SessionProvider>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
```

**Step 3: Update layout.tsx**

Add `suppressHydrationWarning` to the `<html>` tag:
```tsx
<html lang="en" suppressHydrationWarning>
```

**Step 4: Create ThemeToggle component**

`src/components/shared/ThemeToggle.tsx`:
- Uses `useTheme()` from next-themes
- Sun/Moon icon toggle button
- Cycles: light → dark → system

**Step 5: Add ThemeToggle to TopNav**

Place the toggle button next to the notification bell in TopNav.

**Step 6: Fix hardcoded colors**

In `AuthenticatedLayout.tsx`:
- Change `bg-[#FAFAFA]` to `bg-[#FAFAFA] dark:bg-gray-950`

In `TopNav.tsx`:
- Change `bg-white` to `bg-white dark:bg-gray-900`
- Change text colors to include dark variants

In `BottomNav.tsx`:
- Change `bg-white` to `bg-white dark:bg-gray-900`
- Change border colors

In all card components (FeedCard, RankingCard, MomentCard, etc.):
- `bg-white` → `bg-white dark:bg-gray-800`
- `text-gray-900` → `text-gray-900 dark:text-gray-100`
- `text-gray-500` → `text-gray-500 dark:text-gray-400`
- `text-gray-700` → `text-gray-700 dark:text-gray-300`
- `border-gray-200` → `border-gray-200 dark:border-gray-700`

**Step 7: Commit**

```
git add .
git commit -m "feat: add dark mode with next-themes"
```

---

## Task 11: Build Verification & Debug

**Step 1: Run TypeScript check**
Run: `npx tsc --noEmit`
Fix any type errors.

**Step 2: Run build**
Run: `npm run build`
Fix any build errors.

**Step 3: Manual smoke test**
Run: `npm run dev`
Test: Explore page, Rankings page, Feed, Trips, Dark mode toggle, Post a moment

**Step 4: Final commit and push**

```
git add .
git commit -m "fix: resolve build errors and polish overhaul"
git push
```

---

## Task Dependency Graph

```
Task 1 (Schema) ──→ Task 2 (Scoring) ──→ Task 3 (API)
                                              │
                          ┌───────────────────┤
                          ↓                   ↓
                    Task 4 (Rec Engine)   Task 6 (Rankings Page)
                          │                   │
                          ↓                   ↓
                    Task 7 (Explore)     Task 8 (Feed Update)
                                              │
                                              ↓
                                        Task 9 (Trips Saved)

Task 5 (Nav rename) ── independent, can run anytime
Task 10 (Dark Mode) ── independent, can run anytime
Task 11 (Debug) ── runs last
```

**Parallelizable groups:**
- Group A (sequential): Tasks 1 → 2 → 3 → 4 → 7
- Group B (sequential): Tasks 1 → 2 → 3 → 6 → 8 → 9
- Group C (independent): Task 5, Task 10
- Group D (last): Task 11
