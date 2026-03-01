# Pioneer React Native Mobile App — Design Document

**Date:** February 28, 2026
**Goal:** Build a React Native (Expo) mobile app that mirrors the Pioneer web app, targeting iOS (TestFlight) and Android, reusing the same backend API.

---

## 1. Architecture Overview

### Monorepo Structure

```
Pioneer/
├── src/                      # Existing Next.js web app
├── prisma/                   # Shared Prisma schema
├── mobile/                   # NEW: React Native (Expo) app
│   ├── app/                  # Expo Router file-based screens
│   │   ├── (tabs)/           # Tab navigator screens
│   │   │   ├── feed.tsx
│   │   │   ├── explore.tsx
│   │   │   ├── create.tsx
│   │   │   ├── trips.tsx
│   │   │   └── profile.tsx
│   │   ├── (auth)/           # Auth screens (login, signup)
│   │   ├── onboarding/       # Onboarding flow
│   │   ├── settings/         # Settings screens
│   │   ├── forums/           # Forum screens
│   │   ├── users/[username].tsx
│   │   ├── moments/[id].tsx  # Moment detail
│   │   └── _layout.tsx       # Root layout
│   ├── components/           # React Native components
│   │   ├── feed/
│   │   ├── moments/
│   │   ├── trips/
│   │   ├── forums/
│   │   ├── profile/
│   │   └── shared/
│   ├── lib/                  # Utilities
│   │   ├── api.ts            # Typed API client
│   │   ├── auth.ts           # SecureStore token management
│   │   ├── query.ts          # React Query setup
│   │   └── utils/
│   ├── assets/               # Images, fonts
│   ├── app.json              # Expo config
│   ├── package.json          # Mobile dependencies
│   ├── tailwind.config.ts    # NativeWind config
│   └── tsconfig.json
├── shared/                   # NEW: Shared TypeScript types
│   ├── types/                # User, Moment, Trip, Place, etc.
│   └── schemas/              # Zod validation schemas
├── package.json              # Root (web)
└── ...
```

### Key Decisions

- **Expo SDK 52** with Expo Router v4 (file-based routing)
- **NativeWind v4** for styling (Tailwind CSS for React Native)
- **React Query v5** for data fetching (same patterns as web)
- **Expo SecureStore** for JWT token persistence
- **Expo Image** for optimized image rendering
- **Same API backend** — no new endpoints needed (except Bearer token auth)

---

## 2. API & Authentication

### API Strategy

The mobile app calls the **same Next.js API routes** deployed on Vercel:

```
Mobile App → HTTPS → pioneer-app.vercel.app/api/* → Prisma → Supabase DB
```

No API duplication. Both web and mobile share one backend.

### Authentication Changes

**Current (web only):** NextAuth uses HTTP-only cookies for JWT.

**Required change:** Add `Authorization: Bearer <token>` support so mobile can authenticate without cookies.

**Implementation:**
1. Create a `/api/auth/mobile-login` endpoint that returns a raw JWT token
2. Add middleware helper that checks both cookies (web) AND Authorization header (mobile)
3. Mobile stores token in Expo SecureStore (encrypted, persists across restarts)

**Token flow:**
```
Mobile Login → POST /api/auth/mobile-login → { token: "jwt..." }
                                            ↓
                              SecureStore.setItemAsync('token', jwt)
                                            ↓
                         All API calls: Authorization: Bearer <token>
```

### Image Uploads

Same Supabase upload flow. Mobile uses Expo ImagePicker to select photos, then uploads to `/api/upload`.

---

## 3. Screens

### Tab Navigation (Bottom Bar)

| Tab | Icon | Screen |
|-----|------|--------|
| Feed | Home | Home feed with FeedCards, pull-to-refresh |
| Explore | Search | Search, filter tabs, MomentCard grid |
| Create | Plus (circle) | Create Moment modal (camera/gallery, ratings) |
| Trips | Map | Trip list, trip detail, add stops |
| Profile | User | User profile, stats, moments grid |

### Full Screen List

| Screen | Route | Web Equivalent | Priority |
|--------|-------|---------------|----------|
| Login | `(auth)/login` | `/login` | P0 |
| Signup | `(auth)/signup` | `/signup` | P0 |
| Onboarding | `onboarding/` | `/onboarding` | P0 |
| Feed | `(tabs)/feed` | `/feed` | P0 |
| Explore | `(tabs)/explore` | `/explore` | P0 |
| Create Moment | `(tabs)/create` | CreateMoment modal | P0 |
| Trips List | `(tabs)/trips` | `/planner` | P1 |
| Trip Detail | `trips/[id]` | — | P1 |
| Forums List | `forums/` | `/forums` | P1 |
| Forum Thread | `forums/[slug]` | — | P1 |
| Profile | `(tabs)/profile` | `/profile` | P0 |
| User Profile | `users/[username]` | `/users/[username]` | P1 |
| Moment Detail | `moments/[id]` | — | P0 |
| Settings | `settings/` | `/settings` | P1 |
| Profile Edit | `settings/profile` | `/settings/profile` | P1 |

### Deferred (Not in Mobile MVP)
- Reviews page (`/reviews/new`)
- Admin/moderation tools
- Push notifications
- Password reset (needs email service)

---

## 4. Component Architecture

### Shared Components (mobile/components/shared/)

| Component | Purpose |
|-----------|---------|
| `Button` | Primary/secondary/ghost variants |
| `Input` | Text input with label, error state |
| `Avatar` | User avatar with fallback |
| `CompositeScoreBadge` | Score circle with color coding |
| `TabBar` | Custom bottom tab bar |
| `LoadingSkeleton` | Shimmer loading states |
| `EmptyState` | Empty list/search messaging |
| `ErrorState` | Error display with retry |

### Feature Components

Mirrors the web component structure:
- `feed/FeedCard.tsx` — native version of web FeedCard
- `moments/MomentCard.tsx` — card for explore grid
- `moments/CreateMomentForm.tsx` — camera, place picker, ratings
- `trips/TripCard.tsx` — trip overview card
- `forums/ForumPost.tsx` — forum post with replies
- `profile/ProfileHeader.tsx` — hero header with stats

---

## 5. Development & Distribution

### Development (Windows PC)

```bash
cd mobile
npx expo start
# Scan QR code with Expo Go app on any iPhone/Android
```

No Mac, no Xcode, no Android Studio required for basic development.

### Testing

| Method | Platform | Requirement |
|--------|----------|-------------|
| Expo Go (QR code) | iOS + Android | Free, any phone |
| Android Emulator | Android | Android Studio on Windows |
| EAS Build → TestFlight | iOS | Apple Developer Account ($99/yr) |
| EAS Build → APK | Android | Free |

### TestFlight Distribution

Prerequisites:
1. Apple Developer Account ($99/yr) — partner enrolls at developer.apple.com
2. EAS CLI configured with Apple credentials

```bash
# Build iOS app in the cloud (no Mac needed)
eas build --platform ios --profile preview

# Submit to TestFlight
eas submit --platform ios
```

### Timeline Estimate

| Day | Deliverable |
|-----|-------------|
| 1 | Project scaffold, auth screens, API client |
| 2 | Feed, explore, moment detail screens |
| 3 | Create moment, profile, user profile |
| 4 | Trips, forums screens |
| 5 | Settings, polish, EAS build, TestFlight submit |

---

## 6. Backend Changes Required

Minimal backend changes to support mobile:

1. **Bearer token auth** — New `/api/auth/mobile-login` endpoint + middleware update
2. **CORS headers** — Allow requests from Expo dev server and mobile app
3. **Shared types extraction** — Move types from `src/types/` to `shared/types/`

Everything else (API routes, Prisma, Supabase) stays exactly the same.

---

## 7. Future Phases (Post-MVP)

- Push notifications (Expo Push)
- Offline support (React Query persistence)
- Biometric login (FaceID/TouchID via Expo LocalAuthentication)
- Deep linking (expo-linking)
- App Store submission (after TestFlight beta)
- Password reset flow (needs email service)
