# Pioneer Overhaul Design: Moments, Rankings, Explore, Dark Mode

**Date:** 2026-02-26
**Status:** Approved

## Core Concept: "Moments"

A Moment replaces the generic "post" — it's a rated experience/attraction from a trip.

**Moment data:**
- Brief comment (max 500 chars)
- Up to 3 photos
- 4 ratings (1-5): Overall, Value, Authenticity, Crowd Level
- Composite score (1.0-10.0): `(overall*0.4 + value*0.2 + authenticity*0.2 + crowd*0.2) * 2`
- Optional Place reference
- Relative rank among user's other moments

## Data Model Changes (Prisma Post table)

Add to Post model:
- `overallRating Int` (1-5, required for moments)
- `valueRating Int?` (1-5)
- `authenticityRating Int?` (1-5)
- `crowdRating Int?` (1-5)
- `compositeScore Float?` (1.0-10.0, computed)
- `placeId String?` (FK to Place)
- `imageUrl2 String?` (2nd photo)
- `imageUrl3 String?` (3rd photo)
- `viewCount Int @default(0)`
- `rank Int?` (position among user's moments)

## Task 1: Explore Page

**Moments-focused discovery page with:**
- Filter pills: Recommended (AI), Most Viewed, Top Rated
- Country dropdown filter
- Search bar (text, place name, country)
- 2-column grid of moment cards with:
  - First photo filling card top
  - Composite score badge (top-right), color-coded: red(1-3.9), orange(4-5.9), yellow-green(6-7.9), green(8-10)
  - User avatar + name
  - Place name + location
  - Instagram-style bookmark/save button (bottom-right)
- New API: `GET /api/moments?filter=recommended|mostViewed|topRated&country=XX&search=term`
- Save API: `POST/DELETE /api/moments/:id/save`

## Task 2: Forums → Rankings

**Replace Forums tab with Belli-style ranking page:**
- Nav: "Forums" → "Rankings", icon MessageSquare → Trophy
- URL stays /forums (or redirects) — simpler to just repurpose the route
- Page shows all user's moments sorted by compositeScore desc
- Each row: rank # + score badge (left) | photo + comment + place + ratings (right)
- Expandable rows for full detail
- CreateMoment flow:
  1. Write comment
  2. Upload up to 3 photos
  3. Rate 4 categories (1-5 stars)
  4. Optionally link to Place
  5. Compute score, recompute all user rankings

## Task 3: Feed Update

- FeedCard shows composite score badge on moment images
- Rating pills below description
- Save/bookmark button
- CreatePost → CreateMoment on feed page

## Task 4: Trips + Saved Moments

- "Saved Moments" section on Trips page
- Quick-add saved moments to trip itinerary as TripStops

## Task 5: Dark Mode

- Install `next-themes`
- ThemeProvider in Providers component
- Theme toggle in Settings + TopNav
- Dark CSS variables already exist in globals.css
- Add dark: variants to hardcoded colors in components

## Task 6: Recommendation Engine (Rule-Based MVP)

File: `src/lib/ai/recommendations.ts`

Scoring algorithm for "Recommended" filter:
- Interest match: +3 points if moment's place category matches user interest
- Following boost: +2 points if moment is from a followed user
- Engagement: normalized (likes + views) score 0-2
- Recency: exponential decay, max +1 for last 24h, 0 after 30 days
- Rating quality: compositeScore / 10 (0-1 range)
- Final: interestMatch*3 + followingBoost*2 + engagementScore + recencyScore + qualityScore
- Fallback to topRated if no interests/follows exist
