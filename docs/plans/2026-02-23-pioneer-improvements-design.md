# Pioneer Improvements Design

Date: 2026-02-23
Status: Approved
Approach: Parallel Streams (all four workstreams developed simultaneously)

## Overview

Four improvement areas for Pioneer, developed in parallel:

1. Critical fixes (security, migrations, cleanup, seeding)
2. Image upload system (Supabase Storage)
3. Feed enrichment + CreatePost + QuickAdd
4. Full settings hub

---

## 1. Critical Fixes

### 1a. DB Host Leak

`src/app/api/auth/signup/route.ts:93-97` leaks the database host in client-facing error responses via `dbHint`. Fix: keep `console.error(...)` for server logs, remove `dbHint` from the returned JSON body.

### 1b. Prisma Migrations

Run `prisma migrate dev --name init` to generate the initial migration from the existing schema. Creates `prisma/migrations/` for version-controlled schema changes.

### 1c. Delete Unused Sidebar

`src/components/layout/Sidebar.tsx` is imported nowhere. Delete it.

### 1d. Database Seeding

Create `prisma/seed.ts` that populates: 3-5 countries, 8-10 cities, sample forums (one per city), and interest categories. No mock users (those come from signup).

---

## 2. Image Upload System (Supabase Storage)

### Storage Buckets

| Bucket    | Purpose             | Max Size | Public |
|-----------|---------------------|----------|--------|
| `avatars` | User profile photos | 2MB      | Yes    |
| `covers`  | Cover/banner photos | 5MB      | Yes    |
| `reviews` | Review photos       | 5MB      | Yes    |
| `posts`   | Feed post photos    | 5MB      | Yes    |

All buckets accept `image/*` only.

### API Routes

- `POST /api/upload` - Upload a file. Accepts `multipart/form-data` with `file` field and `bucket` query param. Returns `{ url: string }`. Validates file type and size per bucket. Requires auth.
- `DELETE /api/upload` - Remove a file by URL. Validates the requesting user owns the resource. Requires auth.

### Client Flow

1. User selects image in form
2. Client shows local preview via `URL.createObjectURL`
3. On form submit, upload image(s) to `/api/upload` first, get back URL(s)
4. Submit main form with returned URLs
5. Orphan images from failed submissions are acceptable (cron cleanup later)

### Dependencies

- `@supabase/supabase-js` (server-side only)

### Setup

- Buckets created via Supabase dashboard or setup script
- Bucket policies: public read, authenticated write
- No client-side Supabase SDK; all uploads go through the Next.js API route

---

## 3. Feed Enrichment + CreatePost + QuickAdd

### 3a. Feed Enrichment

The current feed API only returns trips. Expand to query four tables and merge:

1. Recent **trips** from followed users (existing)
2. Recent **reviews** from followed users (new)
3. Recent **follows** by followed users (new - "X started following Y")
4. Recent **posts** from followed users (new, see 3b)

Each item gets a `type` field: `"trip"` | `"review"` | `"follow"` | `"post"`. Merge all results, sort by `createdAt` descending, paginate. The `FeedCard` component extends its conditional rendering for the new types.

### 3b. CreatePost - New Post Model

New Prisma model:

```prisma
model Post {
  id        String   @id @default(cuid())
  userId    String
  content   String   @db.Text
  imageUrl  String?
  likeCount Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("posts")
}
```

API routes:
- `POST /api/posts` - create a post (text required, image optional via upload URL)
- Posts appear in the feed, no separate listing endpoint needed

The `CreatePost` component becomes functional: text input + optional image picker. On submit: upload image if present, create post via API, invalidate feed query.

### 3c. QuickAdd - Inline Place Creation

The `QuickAdd` sidebar component becomes a mini form:

- Place name (required)
- Category dropdown (from `PlaceCategory` enum)
- City search (reuses existing city autocomplete)
- Address (required)
- Optional: price level, description

New API route: `POST /api/places` - create a place. Requires auth. Sets `createdById` to current user. Returns created place with success message and link to add as a trip stop.

---

## 4. Full Settings Hub

### Route Structure

```
/settings              -> redirect to /settings/profile
/settings/profile      -> edit profile info
/settings/account      -> email, password, connected accounts
/settings/notifications -> notification preferences
/settings/privacy      -> visibility defaults
/settings/danger       -> delete account
```

Single layout with sidebar nav + nested pages.

### 4a. Profile Settings

- Fields: name, username, bio (textarea, max 500 chars)
- Avatar upload: click avatar to open file picker, preview, upload to `avatars` bucket
- Cover photo upload: same pattern, `covers` bucket
- Submit calls `PATCH /api/users/me` (existing) with updated values + uploaded URLs
- Validation: username uniqueness (API already checks)

### 4b. Account Settings

- **Change email:** new email + current password confirmation. Route: `PATCH /api/users/me/email`
- **Change password:** current, new, confirm. Route: `PATCH /api/users/me/password`. Uses existing `validatePasswordStrength()` and `hashPassword()`.
- **Connected accounts:** Google connection status with link/unlink via NextAuth account linking.

### 4c. Notification Preferences

- Toggle switches: email on new follower, review like, trip like, forum reply
- UI-only scaffolding for now (no notification system yet). Preferences saved to User model for future consumption.

### 4d. Privacy Settings

- Default trip visibility: public/private toggle
- Profile discoverability: show in suggested users toggle

### 4e. Danger Zone

- Red-themed section with "Delete my account" button
- Confirmation dialog requiring username input
- `DELETE /api/users/me` - cascading delete via Prisma
- Signs out via NextAuth after deletion

### New Prisma Fields on User

```prisma
defaultTripPublic  Boolean @default(true)
discoverable       Boolean @default(true)
notificationPrefs  Json?
```

`notificationPrefs` schema:

```json
{
  "emailOnFollow": true,
  "emailOnReviewLike": true,
  "emailOnTripLike": true,
  "emailOnForumReply": true
}
```

---

## Schema Changes Summary

New model: `Post` (id, userId, content, imageUrl, likeCount, timestamps)

New fields on `User`:
- `defaultTripPublic Boolean @default(true)`
- `discoverable Boolean @default(true)`
- `notificationPrefs Json?`

New relation on `User`: `posts Post[]`

New API routes:
- `POST /api/upload`
- `DELETE /api/upload`
- `POST /api/posts`
- `POST /api/places` (create)
- `PATCH /api/users/me/email`
- `PATCH /api/users/me/password`
- `DELETE /api/users/me`
