# Frontend Agent Context

You are the **Frontend Agent** for Pioneer, a community-powered travel discovery platform.

## Project Overview

Pioneer is a social travel platform where users rate, review, and share travel experiences while discovering places through the trips of people they follow.

**App Name:** Pioneer
**Tagline:** "Discover Together"
**Launch City:** Lisbon, Portugal

## Your Responsibilities

You own all user-facing components and pages:
- `/src/app/*` - Next.js App Router pages (except `/api/*`)
- `/src/components/*` - React components
- `/src/hooks/*` - Custom React hooks
- `/src/styles/*` - Additional styles (Tailwind is primary)

## Off-Limits (Other Agents Own These)

- `/src/lib/db/*` - Backend Agent
- `/src/lib/ai/*` - AI Agent
- `/src/app/api/*` - Backend Agent
- `/prisma/*` - Main Agent
- `/scripts/*` - AI Agent
- `/python/*` - AI Agent

## Tech Stack

- **Next.js 14** with App Router
- **TypeScript** - strict mode
- **Tailwind CSS** - utility-first styling
- **Shadcn/ui** - component library
- **React Query** - data fetching (or Next.js fetch)

## Key Files to Read First

1. `/docs/API_CONTRACTS.md` - All endpoints you'll consume
2. `/src/types/*` - Shared TypeScript types (USE THESE, don't duplicate)
3. `/prisma/schema.prisma` - Understand data models

---

## App Structure (5 Tabs)

Pioneer uses a 5-tab bottom navigation:

```
┌─────────────────────────────────────────────────────────────────┐
│                        BOTTOM NAVIGATION                         │
├─────────────────────────────────────────────────────────────────┤
│  🏠 Feed    │  🔍 Explore   │  ✈️ Planner   │  💬 Forums  │  👤 Profile │
└─────────────────────────────────────────────────────────────────┘
```

---

## Design System

### Colors (Tailwind config)
```js
// tailwind.config.js
colors: {
  primary: {
    DEFAULT: '#667eea',
    dark: '#764ba2',
  },
  secondary: '#f093fb',
  background: '#FAFAFA',
  text: '#2D3436',
}

// Gradient usage
<div className="bg-gradient-to-r from-primary to-primary-dark" />
```

### Typography
- **Headings:** Sora (bold, clean)
- **Body:** DM Sans (readable)
- **Stats:** Bold gradient text

Add to `app/layout.tsx`:
```tsx
import { Sora, DM_Sans } from 'next/font/google';

const sora = Sora({ subsets: ['latin'], variable: '--font-sora' });
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans' });
```

### Component Patterns
- Cards: `rounded-2xl shadow-lg`
- Buttons: Gradient purple → pink
- Avatars: Colored borders
- Tags/badges: Colored backgrounds
- Stat cards: Gradient backgrounds

---

## Phase 1 MVP Tasks

Build these in order:

### 1. Landing Page (`/`)
- Hero section with value proposition
- "Discover Together" messaging
- Sign up / Login CTAs
- Preview of the app (trip cards, ratings)

### 2. Auth UI
- `/login` - Login form (email + password)
- `/signup` - Signup form
- Google OAuth button
- Redirect to onboarding after signup

### 3. Onboarding Flow (`/onboarding`)
Multi-step survey (5-6 questions):
- Step 1: Welcome screen
- Step 2: What type of traveler? (Solo/Couple/Group/Family)
- Step 3: What interests you? (use `INTEREST_CATEGORIES` from `/src/types/user.ts`)
- Step 4: Budget level? (Budget/Moderate/Luxury)
- Step 5: Travel pace? (Packed/Balanced/Slow)
- Step 6: Optional Instagram/TikTok connection
- Completion → redirect to `/feed`

### 4. Feed Tab (`/feed`)
Activity feed from followed users:
- Simple action cards:
  - "Rahul rated Barcelona trip ⭐4.8"
  - "Sneh uploaded 12 photos for Tokyo"
- Each card shows: user avatar, action, location, timestamp
- Preview image or photo grid
- Engagement: likes, comments, share, save
- Click → full trip/review detail

**Components:**
- `FeedCard.tsx` - Individual feed item
- `FeedList.tsx` - Infinite scroll list

### 5. Profile Tab (`/profile` and `/users/[username]`)
**Own Profile:**
- Avatar, name, username, bio
- Stats: trips, reviews, followers, following
- Edit profile button
- Tabs: Trips | Reviews | Saved

**Other User's Profile:**
- Same layout
- Follow/Unfollow button
- `isFollowing` status

**Components:**
- `ProfileHeader.tsx`
- `ProfileStats.tsx`
- `TripGrid.tsx`
- `ReviewGrid.tsx`

### 6. Trip Detail (`/trips/[id]`)
Full trip view:
- Cover image
- Title, description, dates
- City/country
- User info with follow button
- List of stops (places visited)
- Like/share buttons
- Comments section

### 7. Place Detail (`/places/[id]`)
Full place view:
- Image gallery
- Name, category, neighborhood
- Aggregated ratings (4 categories)
- Price level, estimated duration
- Save button
- Write review button
- Reviews list

### 8. Review Form (`/places/[id]/review`)
Create/edit review:
- Rate 4 categories (1-5 stars each):
  - Overall Experience (required)
  - Value for Money
  - Authenticity
  - Crowd Level
- Written review (required)
- Title (optional)
- Photo upload (optional)
- Link to trip (optional)
- Visit date

### 9. Create Trip (`/trips/new`)
- Select city
- Trip title
- Date range (optional)
- Description (optional)
- Public/private toggle

### 10. Global Components

**Navigation:**
- Bottom nav for mobile (5 tabs)
- Sidebar for desktop
- Active tab indicator with gradient

**Shared:**
- `TripCard.tsx` - Trip preview in lists
- `PlaceCard.tsx` - Place preview in lists
- `UserPreview.tsx` - Avatar + name for lists
- `RatingStars.tsx` - Star rating display/input
- `CategoryBadge.tsx` - Place category badge
- Loading states (skeletons)
- Empty states
- Error boundaries

---

## Page Routes

```
src/app/
├── page.tsx                    # Landing (unauthenticated)
├── login/page.tsx
├── signup/page.tsx
├── onboarding/page.tsx
├── (authenticated)/            # Layout with bottom nav
│   ├── feed/page.tsx           # Tab 1: Feed
│   ├── explore/page.tsx        # Tab 2: Explore (Phase 2)
│   ├── planner/page.tsx        # Tab 3: Planner (Phase 3)
│   ├── forums/page.tsx         # Tab 4: Forums (Phase 3)
│   └── profile/page.tsx        # Tab 5: Profile
├── users/[username]/page.tsx   # Other user profiles
├── trips/
│   ├── [id]/page.tsx           # Trip detail
│   └── new/page.tsx            # Create trip
├── places/
│   ├── [id]/page.tsx           # Place detail
│   └── [id]/review/page.tsx    # Write review
└── layout.tsx
```

---

## Component Structure

```
src/components/
├── ui/                         # Shadcn components
├── feed/
│   ├── FeedCard.tsx
│   └── FeedList.tsx
├── trips/
│   ├── TripCard.tsx
│   ├── TripDetail.tsx
│   ├── TripStopList.tsx
│   └── CreateTripForm.tsx
├── places/
│   ├── PlaceCard.tsx
│   ├── PlaceDetail.tsx
│   └── PlaceRatings.tsx
├── reviews/
│   ├── ReviewCard.tsx
│   ├── ReviewForm.tsx
│   └── ReviewList.tsx
├── users/
│   ├── UserPreview.tsx
│   ├── ProfileHeader.tsx
│   ├── FollowButton.tsx
│   └── FollowersList.tsx
├── auth/
│   ├── LoginForm.tsx
│   └── SignupForm.tsx
├── onboarding/
│   ├── OnboardingSteps.tsx
│   └── InterestSelector.tsx
├── shared/
│   ├── RatingStars.tsx
│   ├── CategoryBadge.tsx
│   ├── PriceLevel.tsx
│   └── GradientButton.tsx
└── layout/
    ├── BottomNav.tsx
    ├── Sidebar.tsx
    └── AuthenticatedLayout.tsx
```

---

## API Consumption

Use the types from `/src/types/api.ts` for all API calls.

Example pattern:
```typescript
// src/hooks/useTrips.ts
import { GetTripsResponse, TripFilters } from '@/types/api';
import { TripCard } from '@/types/trip';

export function useTrips(filters?: TripFilters) {
  const params = new URLSearchParams(filters as any);
  return useQuery<GetTripsResponse>({
    queryKey: ['trips', filters],
    queryFn: () => fetch(`/api/trips?${params}`).then(r => r.json()),
  });
}

// src/hooks/useFeed.ts
import { GetFeedResponse } from '@/types/api';

export function useFeed(page = 1) {
  return useQuery<GetFeedResponse>({
    queryKey: ['feed', page],
    queryFn: () => fetch(`/api/feed?page=${page}`).then(r => r.json()),
  });
}
```

---

## Mock Data

Until backend is ready, use mock data matching the types. Create `/src/lib/mock-data.ts`:

```typescript
import { TripCard } from '@/types/trip';
import { PlaceCard } from '@/types/place';
import { UserPreview } from '@/types/user';

export const mockUser: UserPreview = {
  id: '1',
  name: 'Rahul Sharma',
  username: 'rahul',
  avatarUrl: '/avatars/rahul.jpg',
  tripCount: 12,
  followerCount: 1234,
};

export const mockTrips: TripCard[] = [
  {
    id: '1',
    title: 'Barcelona Summer 2024',
    coverImageUrl: '/trips/barcelona.jpg',
    startDate: new Date('2024-06-15'),
    endDate: new Date('2024-06-22'),
    likeCount: 247,
    status: 'COMPLETED',
    user: mockUser,
    city: { name: 'Barcelona', country: { name: 'Spain' } },
    stopCount: 8,
    isLiked: false,
  },
];

export const mockPlaces: PlaceCard[] = [
  {
    id: '1',
    name: 'Manteigaria',
    category: 'CAFE',
    imageUrl: '/places/manteigaria.jpg',
    neighborhood: 'Chiado',
    avgOverallRating: 4.6,
    totalReviewCount: 2847,
    priceLevel: 'BUDGET',
    tags: ['foodie', 'local-favorite'],
    isSaved: false,
  },
];
```

---

## Coordination Rules

1. **Use shared types** - Import from `@/types/*`, never create duplicate types
2. **API shape matters** - Match the request/response formats in API_CONTRACTS.md exactly
3. **Request new endpoints** - If you need something not in the contracts, add to `/docs/API_REQUESTS.md`
4. **Don't add backend dependencies** - If you need server-side logic, coordinate with Backend Agent

---

## Mobile-First Design

- Design for 375px width first, then scale up
- Touch targets minimum 44x44px
- Bottom navigation on mobile (fixed position)
- Sidebar navigation on desktop (min-width: 768px)

---

## Getting Started

1. Read API_CONTRACTS.md thoroughly
2. Set up Shadcn/ui components: `npx shadcn-ui@latest add button card input avatar badge tabs`
3. Add fonts (Sora, DM Sans) to layout
4. Configure Tailwind with custom colors
5. Build auth forms first (can submit to mock handlers)
6. Build the feed page with mock data
7. Connect to real APIs as Backend Agent implements them

---

## Questions?

If you need clarification on:
- API contracts → Check API_CONTRACTS.md or ask Main Agent
- Data types → Check `/src/types/*`
- Design decisions → Reference the Pioneer mockups, make reasonable choices
