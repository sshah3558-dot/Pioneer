# Pioneer - Travel Discovery Platform

## Project Overview
Pioneer is a community-powered travel discovery platform built with Next.js 16 (App Router), React, TypeScript, Tailwind CSS, and shadcn UI. Uses Prisma for DB schema (not yet connected — currently using mock data).

## Tech Stack
- **Framework**: Next.js 16.1.6 (Turbopack, App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + shadcn UI components
- **Fonts**: Sora (headings), DM Sans (body)
- **Icons**: lucide-react
- **Auth**: NextAuth (stubbed)

## Key Architecture
- `src/app/(authenticated)/` — Authenticated pages wrapped by `AuthenticatedLayout`
- `src/components/layout/TopNav.tsx` — Desktop sticky top navigation (hidden on mobile)
- `src/components/layout/BottomNav.tsx` — Mobile bottom navigation (hidden on desktop)
- `src/lib/mock-data.ts` — All mock data with TypeScript interfaces
- `src/types/` — Shared type definitions (user, trip, place, review)

## Completed Work (Feb 2026)

### Pioneer UI Rebuild — ALL 7 PHASES COMPLETE
Rebuilt the entire UI to match HTML mockups in `docs/pioneer-mvp-complete.html` and `docs/pioneer-rating-enhanced.html`.

**Phase 1: Foundation** — TopNav, AuthenticatedLayout (sidebar→topnav), BottomNav, globals.css animations
**Phase 2: Feed** — 3-column layout with ProfileSummary, SuggestedUsers, CreatePost, redesigned FeedCard
**Phase 3: Profile** — Full hero cover photo, 5-stat grid, achievement badges with float animation
**Phase 4: Trips** — TripPlannerCard with members/destinations/progress, TripActivity sidebar, QuickAdd
**Phase 5: Forums** — ForumPost with trending indicators, ForumSidebar with categories + active members
**Phase 6: Review Form** — AnimatedRatingStars (SVG), full ReviewForm with validation, `/reviews/new` route
**Phase 7: Mock Data & Polish** — Extended mock-data.ts, new loading skeletons, build verified clean

### Files Created
- `src/components/layout/TopNav.tsx`
- `src/components/feed/ProfileSummary.tsx`
- `src/components/feed/SuggestedUsers.tsx`
- `src/components/feed/CreatePost.tsx`
- `src/components/trips/TripPlannerCard.tsx`
- `src/components/trips/TripActivity.tsx`
- `src/components/trips/QuickAdd.tsx`
- `src/components/forums/ForumPost.tsx`
- `src/components/forums/ForumSidebar.tsx`
- `src/components/shared/AnimatedRatingStars.tsx`
- `src/components/reviews/ReviewForm.tsx`
- `src/app/(authenticated)/reviews/new/page.tsx`

### Files Modified
- `src/app/globals.css` — Added keyframes, animation utilities, component styles
- `src/components/layout/AuthenticatedLayout.tsx` — Sidebar→TopNav, max-w-7xl
- `src/components/layout/BottomNav.tsx` — "Planner"→"Trips" label
- `src/components/feed/FeedCard.tsx` — Redesigned with description-first layout, tag pills
- `src/components/users/ProfileHeader.tsx` — Full hero with cover photo, stats, badges
- `src/app/(authenticated)/feed/page.tsx` — 3-column grid layout
- `src/app/(authenticated)/profile/page.tsx` — Recent reviews grid
- `src/app/(authenticated)/planner/page.tsx` — Trip cards + sidebar layout
- `src/app/(authenticated)/forums/page.tsx` — Forum posts + sidebar layout
- `src/components/shared/LoadingSkeletons.tsx` — Added ForumPost, TripPlanner, ProfileSummary skeletons
- `src/lib/mock-data.ts` — Extended with trip planner, forum, suggested user data

### Build Status
`npm run build` passes clean — 0 errors, all 34 routes generated.

### Security Hardening (Feb 2026)
- **Rate limiting** added to login (10/min), signup (5/min), upload (20/min) via `src/lib/security/rate-limiter.ts`
- **Security headers** in `next.config.ts`: X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- **SVG uploads blocked** — removed from allowed image types (XSS vector)
- **Email stripped** from public user profile API (`/api/users/[username]`) — only available via `/api/users/me`
- **Forum post max length** added (10,000 chars) to prevent abuse
- **Client-side image compression** via `src/lib/utils/compress-image.ts` — auto-compresses before upload to fit bucket limits

### Profile "My Posts" Enhancement (Feb 2026)
- Profile page now shows max 3 posts with "View All Posts" link
- New `/profile/posts` page with full pagination (12 per page)

## Known Issues & Gotchas
- **Image uploads fail if file > bucket max size AND client compression is bypassed** — always use the `useImageUpload` hook which handles compression automatically
- **SVG files are intentionally blocked** for upload — they can contain embedded JavaScript (XSS)
- **Public user profiles do NOT include email** — use `/api/users/me` for the current user's email
- **Rate limiter is in-memory** — resets on server restart, not shared across instances. For production with multiple instances, switch to Redis-based rate limiting

## What's Next
- Visual QA pass against the HTML mockups at mobile (375px) and desktop (1280px+)
- Run superpowers:code-reviewer against the rebuild plan
- Connect mock data to real Prisma DB / API routes
- Implement Explore page
- Wire up auth flow
