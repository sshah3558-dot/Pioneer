# Pioneer Improvements Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement four parallel improvement streams — critical fixes, image uploads, feed enrichment, and a full settings hub.

**Architecture:** Four independent workstreams that share a common Prisma schema migration. Stream 1 (critical fixes) should be done first since it includes the schema migration that other streams depend on. Streams 2-4 can then proceed in parallel.

**Tech Stack:** Next.js 16 App Router, Prisma 7, Supabase Storage (@supabase/supabase-js), NextAuth 4, React Query, Zod, Tailwind CSS v4

---

## Stream 1: Critical Fixes

### Task 1: Fix DB Host Leak in Signup Route

**Files:**
- Modify: `src/app/api/auth/signup/route.ts` (lines 91-100)

**Step 1: Fix the leak**

Replace lines 91-100 in `src/app/api/auth/signup/route.ts`:

```typescript
// BEFORE (lines 91-100):
    const errMsg = error instanceof Error ? error.message : String(error);
    const dbUrl = process.env.DATABASE_URL;
    const dbHint = dbUrl ? `DB host: ${dbUrl.split('@')[1]?.split('/')[0] ?? 'unknown'}` : 'DATABASE_URL is not set';
    console.error('POST /api/auth/signup error:', error, dbHint);
    return NextResponse.json(
      { error: { message: `${errMsg} [${dbHint}]`, code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );

// AFTER:
    console.error('POST /api/auth/signup error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
```

**Step 2: Also fix login route (same pattern)**

Check `src/app/api/auth/login/route.ts` for the same pattern and apply the same fix if present.

**Step 3: Verify build**

Run: `npm run build`
Expected: Clean build, 0 errors

**Step 4: Commit**

```bash
git add src/app/api/auth/signup/route.ts src/app/api/auth/login/route.ts
git commit -m "fix: remove database host from client-facing error responses"
```

---

### Task 2: Delete Unused Sidebar Component

**Files:**
- Delete: `src/components/layout/Sidebar.tsx`

**Step 1: Verify Sidebar is not imported anywhere**

Run: `grep -r "Sidebar" src/ --include="*.tsx" --include="*.ts"`

Expected: Only `Sidebar.tsx` itself appears (no imports elsewhere). If other files import it, do NOT delete — update those files first.

**Step 2: Delete the file**

```bash
rm src/components/layout/Sidebar.tsx
```

**Step 3: Verify build**

Run: `npm run build`
Expected: Clean build, 0 errors

**Step 4: Commit**

```bash
git add -u src/components/layout/Sidebar.tsx
git commit -m "chore: remove unused Sidebar component"
```

---

### Task 3: Schema Migration — Add Post Model and User Fields

This task adds all new Prisma schema changes needed by streams 2-4.

**Files:**
- Modify: `prisma/schema.prisma`
- Modify: `src/types/user.ts`
- Modify: `src/types/api.ts`

**Step 1: Add Post model and new User fields to Prisma schema**

Add the following to `prisma/schema.prisma`:

After the `TripLike` model (around line 457), add:

```prisma
// ============================================
// POSTS (Feed Posts)
// ============================================

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
  @@index([createdAt])
  @@map("posts")
}
```

Add new fields to the `User` model (after the `followingCount` field, around line 32):

```prisma
  // Settings
  defaultTripPublic  Boolean  @default(true)
  discoverable       Boolean  @default(true)
  notificationPrefs  Json?    // { emailOnFollow, emailOnReviewLike, emailOnTripLike, emailOnForumReply }
```

Add the `posts` relation to User's relations section (after `forumComments`):

```prisma
  posts              Post[]
```

**Step 2: Generate Prisma client and run migration**

```bash
npx prisma migrate dev --name add-posts-and-user-settings
```

Expected: Migration created and applied successfully. Prisma Client regenerated.

**Step 3: Update TypeScript types**

In `src/types/user.ts`, add fields to the `User` interface (after `followingCount`):

```typescript
  // Settings
  defaultTripPublic: boolean;
  discoverable: boolean;
  notificationPrefs: {
    emailOnFollow: boolean;
    emailOnReviewLike: boolean;
    emailOnTripLike: boolean;
    emailOnForumReply: boolean;
  } | null;
```

In `src/types/api.ts`, update `GetFeedResponse` to support polymorphic feed items. Replace the existing definition:

```typescript
// BEFORE:
export interface GetFeedResponse extends PaginatedResponse<TripCard> {}

// AFTER:
export type FeedItemType = 'trip' | 'review' | 'follow' | 'post';

export interface FeedItem {
  id: string;
  type: FeedItemType;
  createdAt: string;
  trip?: TripCard;
  review?: ReviewCard;
  follow?: { follower: UserPreview; following: UserPreview };
  post?: { id: string; content: string; imageUrl: string | null; likeCount: number; user: UserPreview; createdAt: string };
}

export interface GetFeedResponse extends PaginatedResponse<FeedItem> {}
```

Add new API types at the bottom of the file:

```typescript
// POST /api/posts
export interface CreatePostRequest {
  content: string;
  imageUrl?: string;
}

export interface CreatePostResponse {
  post: { id: string; content: string; imageUrl: string | null; likeCount: number; createdAt: string };
}

// POST /api/upload
export interface UploadResponse {
  url: string;
}

// PATCH /api/users/me/email
export interface ChangeEmailRequest {
  newEmail: string;
  currentPassword: string;
}

// PATCH /api/users/me/password
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// DELETE /api/users/me
export interface DeleteAccountRequest {
  confirmUsername: string;
}
```

**Step 4: Verify build**

Run: `npm run build`
Expected: Clean build, 0 errors

**Step 5: Commit**

```bash
git add prisma/schema.prisma src/types/user.ts src/types/api.ts
git commit -m "feat: add Post model and user settings fields to schema"
```

---

### Task 4: Update Database Seed Script

**Files:**
- Modify: `prisma/seed.ts` (already exists with countries, cities, places, forums)

**Step 1: Review existing seed**

Read `prisma/seed.ts` to understand what's already seeded.

**Step 2: Add sample forums if missing**

The seed already creates countries, cities, places, and forums. Verify it covers the needed data. If it already seeds adequate data, this task is done. If not, add missing entries following the existing pattern.

**Step 3: Run the seed**

```bash
npm run seed
```

Expected: Seed completes without errors. Data is visible in the database.

**Step 4: Commit (if changes were made)**

```bash
git add prisma/seed.ts
git commit -m "chore: update database seed script"
```

---

## Stream 2: Image Upload System

### Task 5: Install Supabase JS and Create Upload Utility

**Files:**
- Create: `src/lib/storage/supabase.ts`

**Step 1: Install dependency**

```bash
npm install @supabase/supabase-js
```

**Step 2: Create the Supabase storage client**

Create `src/lib/storage/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('Supabase storage not configured: missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

export const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    })
  : null;

export const BUCKETS = {
  avatars: { name: 'avatars', maxSize: 2 * 1024 * 1024 },    // 2MB
  covers: { name: 'covers', maxSize: 5 * 1024 * 1024 },      // 5MB
  reviews: { name: 'reviews', maxSize: 5 * 1024 * 1024 },     // 5MB
  posts: { name: 'posts', maxSize: 5 * 1024 * 1024 },         // 5MB
} as const;

export type BucketName = keyof typeof BUCKETS;

export function getPublicUrl(bucket: string, path: string): string {
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}
```

**Step 3: Commit**

```bash
git add package.json package-lock.json src/lib/storage/supabase.ts
git commit -m "feat: add Supabase storage client and bucket config"
```

---

### Task 6: Create Upload API Route

**Files:**
- Create: `src/app/api/upload/route.ts`

**Step 1: Create the upload endpoint**

Create `src/app/api/upload/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { supabase, BUCKETS, BucketName, getPublicUrl } from '@/lib/storage/supabase';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: { message: 'Not authenticated', code: 'UNAUTHORIZED' } },
        { status: 401 }
      );
    }

    if (!supabase) {
      return NextResponse.json(
        { error: { message: 'Storage not configured', code: 'STORAGE_NOT_CONFIGURED' } },
        { status: 503 }
      );
    }

    const bucket = request.nextUrl.searchParams.get('bucket') as BucketName | null;
    if (!bucket || !BUCKETS[bucket]) {
      return NextResponse.json(
        { error: { message: 'Invalid bucket. Must be one of: avatars, covers, reviews, posts', code: 'INVALID_BUCKET' } },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json(
        { error: { message: 'No file provided', code: 'NO_FILE' } },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: { message: 'Only image files are allowed', code: 'INVALID_FILE_TYPE' } },
        { status: 400 }
      );
    }

    // Validate file size
    const bucketConfig = BUCKETS[bucket];
    if (file.size > bucketConfig.maxSize) {
      const maxMB = bucketConfig.maxSize / (1024 * 1024);
      return NextResponse.json(
        { error: { message: `File too large. Maximum size is ${maxMB}MB`, code: 'FILE_TOO_LARGE' } },
        { status: 400 }
      );
    }

    // Generate unique file path
    const ext = file.name.split('.').pop() || 'jpg';
    const fileName = `${session.user.id}/${crypto.randomUUID()}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from(bucketConfig.name)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: { message: 'Upload failed', code: 'UPLOAD_FAILED' } },
        { status: 500 }
      );
    }

    const url = getPublicUrl(bucketConfig.name, fileName);

    return NextResponse.json({ url });
  } catch (error) {
    console.error('POST /api/upload error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: { message: 'Not authenticated', code: 'UNAUTHORIZED' } },
        { status: 401 }
      );
    }

    if (!supabase) {
      return NextResponse.json(
        { error: { message: 'Storage not configured', code: 'STORAGE_NOT_CONFIGURED' } },
        { status: 503 }
      );
    }

    const { url } = await request.json();
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: { message: 'URL is required', code: 'INVALID_REQUEST' } },
        { status: 400 }
      );
    }

    // Extract bucket and path from URL
    // URL format: {supabaseUrl}/storage/v1/object/public/{bucket}/{userId}/{filename}
    const match = url.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)/);
    if (!match) {
      return NextResponse.json(
        { error: { message: 'Invalid file URL', code: 'INVALID_URL' } },
        { status: 400 }
      );
    }

    const [, bucket, path] = match;

    // Verify the file belongs to the current user
    if (!path.startsWith(session.user.id + '/')) {
      return NextResponse.json(
        { error: { message: 'Not authorized to delete this file', code: 'FORBIDDEN' } },
        { status: 403 }
      );
    }

    const { error: deleteError } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (deleteError) {
      console.error('Delete error:', deleteError);
      return NextResponse.json(
        { error: { message: 'Delete failed', code: 'DELETE_FAILED' } },
        { status: 500 }
      );
    }

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error('DELETE /api/upload error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Clean build, 0 errors

**Step 3: Commit**

```bash
git add src/app/api/upload/route.ts
git commit -m "feat: add image upload and delete API endpoints"
```

---

### Task 7: Create useImageUpload Hook

**Files:**
- Create: `src/lib/hooks/useImageUpload.ts`

**Step 1: Create the hook**

Create `src/lib/hooks/useImageUpload.ts`:

```typescript
'use client';

import { useState, useCallback } from 'react';
import { BucketName } from '@/lib/storage/supabase';

interface UploadState {
  isUploading: boolean;
  error: string | null;
  progress: number; // 0-100 (simplified: 0 or 100)
}

export function useImageUpload(bucket: BucketName) {
  const [state, setState] = useState<UploadState>({
    isUploading: false,
    error: null,
    progress: 0,
  });

  const upload = useCallback(async (file: File): Promise<string | null> => {
    setState({ isUploading: true, error: null, progress: 0 });

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`/api/upload?bucket=${bucket}`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        const message = data.error?.message || 'Upload failed';
        setState({ isUploading: false, error: message, progress: 0 });
        return null;
      }

      setState({ isUploading: false, error: null, progress: 100 });
      return data.url as string;
    } catch {
      setState({ isUploading: false, error: 'Upload failed', progress: 0 });
      return null;
    }
  }, [bucket]);

  const deleteFile = useCallback(async (url: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ isUploading: false, error: null, progress: 0 });
  }, []);

  return { ...state, upload, deleteFile, reset };
}
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Clean build, 0 errors

**Step 3: Commit**

```bash
git add src/lib/hooks/useImageUpload.ts
git commit -m "feat: add useImageUpload hook for client-side upload flow"
```

---

## Stream 3: Feed Enrichment + CreatePost + QuickAdd

### Task 8: Expand Feed API to Include Reviews, Follows, and Posts

**Files:**
- Modify: `src/app/api/feed/route.ts`

**Step 1: Rewrite the feed API**

Replace the entire contents of `src/app/api/feed/route.ts` with:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth/options';
import { prisma } from '@/lib/db/prisma';
import { FeedItem, GetFeedResponse } from '@/types/api';

const querySchema = z.object({
  page: z.coerce.number().default(1),
  pageSize: z.coerce.number().max(50).default(20),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: { message: 'Not authenticated', code: 'UNAUTHORIZED' } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: { message: 'User not found', code: 'NOT_FOUND' } },
        { status: 404 }
      );
    }

    const following = await prisma.follow.findMany({
      where: { followerId: currentUser.id },
      select: { followingId: true },
    });

    const followingIds = following.map(f => f.followingId);

    if (followingIds.length === 0) {
      return NextResponse.json({
        items: [],
        total: 0,
        page: query.page,
        pageSize: query.pageSize,
        hasMore: false,
      } satisfies GetFeedResponse);
    }

    const userSelect = {
      id: true,
      name: true,
      username: true,
      avatarUrl: true,
      tripCount: true,
      followerCount: true,
    };

    // Fetch all activity types in parallel
    const [trips, reviews, follows, posts] = await Promise.all([
      prisma.trip.findMany({
        where: { userId: { in: followingIds }, isPublic: true },
        include: {
          user: { select: userSelect },
          city: { include: { country: true } },
          _count: { select: { stops: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: query.pageSize * 2, // Fetch extra so we have enough after merging
      }),
      prisma.review.findMany({
        where: { userId: { in: followingIds } },
        include: {
          user: { select: userSelect },
          place: {
            include: { city: { include: { country: true } } },
          },
          _count: { select: { photos: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: query.pageSize * 2,
      }),
      prisma.follow.findMany({
        where: { followerId: { in: followingIds } },
        include: {
          follower: { select: userSelect },
          following: { select: userSelect },
        },
        orderBy: { createdAt: 'desc' },
        take: query.pageSize,
      }),
      prisma.post.findMany({
        where: { userId: { in: followingIds } },
        include: {
          user: { select: userSelect },
        },
        orderBy: { createdAt: 'desc' },
        take: query.pageSize * 2,
      }),
    ]);

    // Build unified feed items
    const feedItems: FeedItem[] = [];

    for (const trip of trips) {
      feedItems.push({
        id: `trip-${trip.id}`,
        type: 'trip',
        createdAt: trip.createdAt.toISOString(),
        trip: {
          id: trip.id,
          title: trip.title,
          coverImageUrl: trip.coverImageUrl,
          startDate: trip.startDate,
          endDate: trip.endDate,
          likeCount: trip.likeCount,
          status: trip.status,
          user: trip.user,
          city: { name: trip.city.name, country: { name: trip.city.country.name } },
          stopCount: trip._count.stops,
          isLiked: false, // Will be enriched below
        },
      });
    }

    for (const review of reviews) {
      feedItems.push({
        id: `review-${review.id}`,
        type: 'review',
        createdAt: review.createdAt.toISOString(),
        review: {
          id: review.id,
          user: review.user,
          place: {
            id: review.place.id,
            name: review.place.name,
            cityName: review.place.city.name,
            countryName: review.place.city.country.name,
          },
          overallRating: review.overallRating,
          title: review.title,
          content: review.content,
          photoCount: review._count.photos,
          likeCount: review.likeCount,
          isLiked: false,
          createdAt: review.createdAt,
        },
      });
    }

    for (const follow of follows) {
      feedItems.push({
        id: `follow-${follow.id}`,
        type: 'follow',
        createdAt: follow.createdAt.toISOString(),
        follow: {
          follower: follow.follower,
          following: follow.following,
        },
      });
    }

    for (const post of posts) {
      feedItems.push({
        id: `post-${post.id}`,
        type: 'post',
        createdAt: post.createdAt.toISOString(),
        post: {
          id: post.id,
          content: post.content,
          imageUrl: post.imageUrl,
          likeCount: post.likeCount,
          user: post.user,
          createdAt: post.createdAt.toISOString(),
        },
      });
    }

    // Sort by date descending and paginate
    feedItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const total = feedItems.length;
    const start = (query.page - 1) * query.pageSize;
    const paged = feedItems.slice(start, start + query.pageSize);

    // Enrich with like status for trips
    const tripIds = paged.filter(i => i.type === 'trip').map(i => i.trip!.id);
    if (tripIds.length > 0) {
      const tripLikes = await prisma.tripLike.findMany({
        where: { userId: currentUser.id, tripId: { in: tripIds } },
        select: { tripId: true },
      });
      const likedTripIds = new Set(tripLikes.map(l => l.tripId));
      for (const item of paged) {
        if (item.type === 'trip' && item.trip) {
          item.trip.isLiked = likedTripIds.has(item.trip.id);
        }
      }
    }

    return NextResponse.json({
      items: paged,
      total,
      page: query.page,
      pageSize: query.pageSize,
      hasMore: start + query.pageSize < total,
    } satisfies GetFeedResponse);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { message: 'Invalid request parameters', code: 'VALIDATION_ERROR' } },
        { status: 400 }
      );
    }
    console.error('GET /api/feed error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Clean build, 0 errors

**Step 3: Commit**

```bash
git add src/app/api/feed/route.ts
git commit -m "feat: expand feed API to include reviews, follows, and posts"
```

---

### Task 9: Create Posts API Route

**Files:**
- Create: `src/app/api/posts/route.ts`

**Step 1: Create the endpoint**

Create `src/app/api/posts/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth/options';
import { prisma } from '@/lib/db/prisma';

const createPostSchema = z.object({
  content: z.string().min(1, 'Post content is required').max(2000),
  imageUrl: z.string().url().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: { message: 'Not authenticated', code: 'UNAUTHORIZED' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const data = createPostSchema.parse(body);

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

    const post = await prisma.post.create({
      data: {
        userId: user.id,
        content: data.content,
        imageUrl: data.imageUrl || null,
      },
    });

    return NextResponse.json({
      post: {
        id: post.id,
        content: post.content,
        imageUrl: post.imageUrl,
        likeCount: post.likeCount,
        createdAt: post.createdAt.toISOString(),
      },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { message: error.issues[0].message, code: 'VALIDATION_ERROR' } },
        { status: 400 }
      );
    }
    console.error('POST /api/posts error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
```

**Step 2: Verify build**

Run: `npm run build`

**Step 3: Commit**

```bash
git add src/app/api/posts/route.ts
git commit -m "feat: add create post API endpoint"
```

---

### Task 10: Create Places API Route (POST)

**Files:**
- Modify: `src/app/api/places/route.ts` (add POST handler)

**Step 1: Add POST handler to existing places route**

The file already has a GET handler. Add a POST handler after it:

```typescript
// Add these imports at the top if not present:
import { z } from 'zod';

// Add after the GET function:
const createPlaceSchema = z.object({
  name: z.string().min(1, 'Place name is required').max(200),
  category: z.string(),
  cityId: z.string().min(1, 'City is required'),
  address: z.string().min(1, 'Address is required'),
  description: z.string().max(2000).optional(),
  priceLevel: z.enum(['FREE', 'BUDGET', 'MODERATE', 'EXPENSIVE', 'LUXURY']).optional(),
  latitude: z.number().optional().default(0),
  longitude: z.number().optional().default(0),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: { message: 'Not authenticated', code: 'UNAUTHORIZED' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const data = createPlaceSchema.parse(body);

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

    // Verify city exists
    const city = await prisma.city.findUnique({ where: { id: data.cityId } });
    if (!city) {
      return NextResponse.json(
        { error: { message: 'City not found', code: 'NOT_FOUND' } },
        { status: 404 }
      );
    }

    const place = await prisma.place.create({
      data: {
        name: data.name,
        category: data.category as any,
        cityId: data.cityId,
        createdById: user.id,
        address: data.address,
        description: data.description || null,
        priceLevel: data.priceLevel as any || null,
        latitude: data.latitude,
        longitude: data.longitude,
      },
      include: {
        city: { include: { country: true } },
      },
    });

    return NextResponse.json({ place }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { message: error.issues[0].message, code: 'VALIDATION_ERROR' } },
        { status: 400 }
      );
    }
    console.error('POST /api/places error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
```

**Step 2: Verify build**

Run: `npm run build`

**Step 3: Commit**

```bash
git add src/app/api/places/route.ts
git commit -m "feat: add create place API endpoint"
```

---

### Task 11: Update Feed Page and FeedCard for Polymorphic Feed

**Files:**
- Modify: `src/app/(authenticated)/feed/page.tsx`
- Modify: `src/components/feed/FeedCard.tsx`
- Modify: `src/components/feed/FeedList.tsx`
- Modify: `src/lib/mock-data.ts` (update FeedActivity type)

**Step 1: Update FeedActivity type in mock-data.ts**

In `src/lib/mock-data.ts`, update the `FeedActivityType` and `FeedActivity` types to include the new types:

```typescript
export type FeedActivityType =
  | 'trip_completed'
  | 'trip_started'
  | 'review_posted'
  | 'photos_uploaded'
  | 'place_saved'
  | 'follow'      // NEW
  | 'post';       // NEW

export interface FeedActivity {
  id: string;
  type: FeedActivityType;
  user: UserPreview;
  timestamp: Date;
  trip?: TripCard;
  place?: PlaceCard;
  review?: ReviewCard;
  photoCount?: number;
  rating?: number;
  follow?: { follower: UserPreview; following: UserPreview };  // NEW
  post?: { id: string; content: string; imageUrl: string | null; likeCount: number; user: UserPreview; createdAt: string };  // NEW
}
```

**Step 2: Update feed page to convert new FeedItem types**

In `src/app/(authenticated)/feed/page.tsx`, update the activity mapping:

```typescript
// Replace the activities mapping (around lines 17-21):
import { FeedItem, GetFeedResponse } from '@/types/api';

// Convert FeedItem to FeedActivity for FeedCard
const activities: FeedActivity[] = (data?.items || []).map((item: FeedItem) => {
  const base = {
    id: item.id,
    timestamp: new Date(item.createdAt),
  };

  if (item.type === 'trip' && item.trip) {
    return {
      ...base,
      type: (item.trip.status === 'COMPLETED' ? 'trip_completed' : 'trip_started') as FeedActivityType,
      user: item.trip.user,
      trip: item.trip,
    };
  }

  if (item.type === 'review' && item.review) {
    return {
      ...base,
      type: 'review_posted' as FeedActivityType,
      user: item.review.user,
      review: item.review,
      rating: item.review.overallRating,
    };
  }

  if (item.type === 'follow' && item.follow) {
    return {
      ...base,
      type: 'follow' as FeedActivityType,
      user: item.follow.follower,
      follow: item.follow,
    };
  }

  if (item.type === 'post' && item.post) {
    return {
      ...base,
      type: 'post' as FeedActivityType,
      user: item.post.user,
      post: item.post,
    };
  }

  // Fallback
  return {
    ...base,
    type: 'trip_started' as FeedActivityType,
    user: { id: '', name: null, username: null, avatarUrl: null, tripCount: 0, followerCount: 0 },
  };
});
```

**Step 3: Add follow and post rendering to FeedCard**

In `src/components/feed/FeedCard.tsx`, add cases to `getDescription()`:

```typescript
// Add inside getDescription():
if (activity.type === 'follow' && activity.follow) {
  return `Started following ${activity.follow.following.name || activity.follow.following.username}`;
}
if (activity.type === 'post' && activity.post) {
  return activity.post.content;
}
```

Add post image handling in `getImage()`:

```typescript
// Add inside getImage():
if (activity.post?.imageUrl) return activity.post.imageUrl;
```

**Step 4: Verify build**

Run: `npm run build`

**Step 5: Commit**

```bash
git add src/app/(authenticated)/feed/page.tsx src/components/feed/FeedCard.tsx src/components/feed/FeedList.tsx src/lib/mock-data.ts
git commit -m "feat: update feed UI for polymorphic feed items (reviews, follows, posts)"
```

---

### Task 12: Make CreatePost Functional

**Files:**
- Modify: `src/components/feed/CreatePost.tsx`

**Step 1: Rewrite CreatePost with real functionality**

Replace the entire contents of `src/components/feed/CreatePost.tsx`:

```typescript
'use client';

import { useState, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { useImageUpload } from '@/lib/hooks/useImageUpload';
import { apiFetch } from '@/lib/api/fetcher';
import { X, Image as ImageIcon, Loader2 } from 'lucide-react';

export function CreatePost() {
  const { user } = useCurrentUser();
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { upload, isUploading } = useImageUpload('posts');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      let imageUrl: string | undefined;

      if (selectedFile) {
        const url = await upload(selectedFile);
        if (!url) {
          setError('Failed to upload image');
          setIsSubmitting(false);
          return;
        }
        imageUrl = url;
      }

      await apiFetch('/api/posts', {
        method: 'POST',
        body: JSON.stringify({ content: content.trim(), imageUrl }),
      });

      setContent('');
      removeImage();
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDisabled = !content.trim() || isSubmitting || isUploading;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-start gap-4 mb-4">
        <img
          src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=667eea&color=fff&size=48`}
          alt={user?.name || 'User'}
          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your latest discovery..."
          className="flex-1 bg-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none min-h-[80px]"
          maxLength={2000}
        />
      </div>

      {/* Image preview */}
      {previewUrl && (
        <div className="relative mb-4 ml-16">
          <img src={previewUrl} alt="Preview" className="max-h-64 rounded-xl object-cover" />
          <button
            onClick={removeImage}
            className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && <p className="text-red-500 text-sm mb-3 ml-16">{error}</p>}

      <div className="flex items-center justify-between ml-16">
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-4 py-2 rounded-xl font-semibold hover:shadow-lg transition-all text-sm flex items-center gap-2"
          >
            <ImageIcon className="w-4 h-4" />
            Add Photo
          </button>
        </div>
        <button
          onClick={handleSubmit}
          disabled={isDisabled}
          className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-2 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {(isSubmitting || isUploading) && <Loader2 className="w-4 h-4 animate-spin" />}
          Post
        </button>
      </div>
    </div>
  );
}
```

**Step 2: Verify build**

Run: `npm run build`

**Step 3: Commit**

```bash
git add src/components/feed/CreatePost.tsx
git commit -m "feat: make CreatePost functional with text and image support"
```

---

### Task 13: Make QuickAdd Functional

**Files:**
- Modify: `src/components/trips/QuickAdd.tsx`

**Step 1: Rewrite QuickAdd with place creation**

Replace the entire contents of `src/components/trips/QuickAdd.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/fetcher';
import { Loader2, Check, MapPin } from 'lucide-react';

const CATEGORIES = [
  'RESTAURANT', 'CAFE', 'BAR', 'MUSEUM', 'PARK', 'BEACH',
  'VIEWPOINT', 'MARKET', 'HOTEL', 'HIDDEN_GEM', 'OTHER',
] as const;

interface CityResult {
  id: string;
  name: string;
  country: { name: string };
}

export function QuickAdd() {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>('RESTAURANT');
  const [address, setAddress] = useState('');
  const [cityQuery, setCityQuery] = useState('');
  const [cityId, setCityId] = useState('');
  const [cityResults, setCityResults] = useState<CityResult[]>([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchCities = async (query: string) => {
    setCityQuery(query);
    setCityId('');
    if (query.length < 2) {
      setCityResults([]);
      setShowCityDropdown(false);
      return;
    }
    try {
      const data = await apiFetch<{ cities: CityResult[] }>(`/api/cities?search=${encodeURIComponent(query)}`);
      setCityResults(data.cities || []);
      setShowCityDropdown(true);
    } catch {
      setCityResults([]);
    }
  };

  const selectCity = (city: CityResult) => {
    setCityId(city.id);
    setCityQuery(`${city.name}, ${city.country.name}`);
    setShowCityDropdown(false);
  };

  const handleSubmit = async () => {
    if (!name.trim() || !cityId || !address.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await apiFetch('/api/places', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          category,
          cityId,
          address: address.trim(),
        }),
      });

      setSuccess(true);
      setName('');
      setAddress('');
      setCityQuery('');
      setCityId('');
      queryClient.invalidateQueries({ queryKey: ['places'] });

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add place');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDisabled = !name.trim() || !cityId || !address.trim() || isSubmitting;

  return (
    <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl shadow-lg p-6">
      <h3 className="font-bold text-lg mb-4 gradient-text-135">✨ Quick Add Place</h3>

      <div className="space-y-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Place name"
          className="w-full px-4 py-2.5 rounded-xl border-2 border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border-2 border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm bg-white"
        >
          {CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat.replace('_', ' ')}</option>
          ))}
        </select>

        <div className="relative">
          <input
            type="text"
            value={cityQuery}
            onChange={(e) => searchCities(e.target.value)}
            onFocus={() => cityResults.length > 0 && setShowCityDropdown(true)}
            placeholder="Search city..."
            className="w-full px-4 py-2.5 rounded-xl border-2 border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          />
          {showCityDropdown && cityResults.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-xl shadow-lg max-h-40 overflow-y-auto">
              {cityResults.map(city => (
                <button
                  key={city.id}
                  onClick={() => selectCity(city)}
                  className="w-full text-left px-4 py-2 hover:bg-purple-50 text-sm flex items-center gap-2"
                >
                  <MapPin className="w-3 h-3 text-purple-500" />
                  {city.name}, {city.country.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Address"
          className="w-full px-4 py-2.5 rounded-xl border-2 border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
        />

        {error && <p className="text-red-500 text-xs">{error}</p>}

        {success ? (
          <div className="w-full bg-green-500 text-white py-2.5 rounded-xl font-semibold text-center flex items-center justify-center gap-2 text-sm">
            <Check className="w-4 h-4" /> Place Added!
          </div>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isDisabled}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white py-2.5 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Add Place
          </button>
        )}
      </div>
    </div>
  );
}
```

**Step 2: Verify build**

Run: `npm run build`

**Step 3: Commit**

```bash
git add src/components/trips/QuickAdd.tsx
git commit -m "feat: make QuickAdd functional with place creation"
```

---

## Stream 4: Full Settings Hub

### Task 14: Create Settings Layout and Profile Settings Page

**Files:**
- Create: `src/app/(authenticated)/settings/layout.tsx`
- Create: `src/app/(authenticated)/settings/page.tsx` (redirects to /settings/profile)
- Create: `src/app/(authenticated)/settings/profile/page.tsx`

**Step 1: Create the settings layout**

Create `src/app/(authenticated)/settings/layout.tsx`:

```typescript
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Shield, Bell, Eye, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

const settingsNav = [
  { href: '/settings/profile', label: 'Profile', icon: User },
  { href: '/settings/account', label: 'Account', icon: Shield },
  { href: '/settings/notifications', label: 'Notifications', icon: Bell },
  { href: '/settings/privacy', label: 'Privacy', icon: Eye },
  { href: '/settings/danger', label: 'Danger Zone', icon: AlertTriangle },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar nav */}
        <nav className="bg-white rounded-2xl shadow-lg p-4 h-fit">
          <ul className="space-y-1">
            {settingsNav.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium',
                      isActive
                        ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white'
                        : 'text-gray-600 hover:bg-gray-100',
                      href === '/settings/danger' && !isActive && 'text-red-500 hover:bg-red-50'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Content */}
        <div className="lg:col-span-3">
          {children}
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Create settings index redirect**

Create `src/app/(authenticated)/settings/page.tsx`:

```typescript
import { redirect } from 'next/navigation';

export default function SettingsPage() {
  redirect('/settings/profile');
}
```

**Step 3: Create profile settings page**

Create `src/app/(authenticated)/settings/profile/page.tsx`:

```typescript
'use client';

import { useState, useRef } from 'react';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { useImageUpload } from '@/lib/hooks/useImageUpload';
import { apiFetch } from '@/lib/api/fetcher';
import { useQueryClient } from '@tanstack/react-query';
import { Camera, Loader2, Check } from 'lucide-react';

export default function ProfileSettingsPage() {
  const { user, isLoading } = useCurrentUser();
  const queryClient = useQueryClient();
  const avatarUpload = useImageUpload('avatars');
  const coverUpload = useImageUpload('covers');
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Initialize form with user data once loaded
  if (user && !initialized) {
    setName(user.name || '');
    setUsername(user.username || '');
    setBio(user.bio || '');
    setAvatarUrl(user.avatarUrl);
    setCoverImageUrl(user.coverImageUrl);
    setInitialized(true);
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    const url = await avatarUpload.upload(file);
    if (url) setAvatarUrl(url);
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverPreview(URL.createObjectURL(file));
    const url = await coverUpload.upload(file);
    if (url) setCoverImageUrl(url);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSaved(false);

    try {
      await apiFetch('/api/users/me', {
        method: 'PATCH',
        body: JSON.stringify({
          name: name.trim() || undefined,
          username: username.trim() || undefined,
          bio: bio.trim(),
          avatarUrl,
          coverImageUrl,
        }),
      });

      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="bg-white rounded-2xl shadow-lg p-8 animate-pulse"><div className="h-64 bg-gray-200 rounded-xl" /></div>;
  }

  const displayAvatar = avatarPreview || avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'U')}&background=667eea&color=fff&size=128`;
  const displayCover = coverPreview || coverImageUrl;

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Cover photo */}
      <div className="relative h-32 md:h-44 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400">
        {displayCover && (
          <img src={displayCover} alt="Cover" className="w-full h-full object-cover" />
        )}
        <button
          onClick={() => coverInputRef.current?.click()}
          className="absolute bottom-3 right-3 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
        >
          <Camera className="w-5 h-5" />
        </button>
        <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
        {coverUpload.isUploading && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        )}
      </div>

      <div className="p-6">
        {/* Avatar */}
        <div className="flex items-end gap-4 -mt-16 mb-6">
          <div className="relative">
            <img src={displayAvatar} alt="Avatar" className="w-24 h-24 rounded-full border-4 border-white shadow-xl object-cover" />
            <button
              onClick={() => avatarInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-purple-600 text-white rounded-full p-1.5 hover:bg-purple-700 transition-colors"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
          </div>
          {avatarUpload.isUploading && <span className="text-sm text-gray-500">Uploading...</span>}
        </div>

        {/* Form */}
        <div className="space-y-5 max-w-lg">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors"
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Username</label>
            <div className="flex items-center">
              <span className="text-gray-400 mr-1">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors"
                maxLength={30}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors resize-none"
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-gray-400 mt-1">{bio.length}/500</p>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saved && <Check className="w-4 h-4" />}
            {saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Step 4: Verify build**

Run: `npm run build`

**Step 5: Commit**

```bash
git add src/app/(authenticated)/settings/
git commit -m "feat: add settings layout and profile settings page"
```

---

### Task 15: Create Account Settings Page

**Files:**
- Create: `src/app/(authenticated)/settings/account/page.tsx`
- Create: `src/app/api/users/me/password/route.ts`
- Create: `src/app/api/users/me/email/route.ts`

**Step 1: Create password change API**

Create `src/app/api/users/me/password/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth/options';
import { prisma } from '@/lib/db/prisma';
import { verifyPassword, hashPassword, validatePasswordStrength } from '@/lib/auth/password';

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: { message: 'Not authenticated', code: 'UNAUTHORIZED' } }, { status: 401 });
    }

    const body = await request.json();
    const data = schema.parse(body);

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: { message: 'User not found', code: 'NOT_FOUND' } }, { status: 404 });
    }

    const isValid = await verifyPassword(data.currentPassword, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: { message: 'Current password is incorrect', code: 'INVALID_PASSWORD' } }, { status: 400 });
    }

    const strength = validatePasswordStrength(data.newPassword);
    if (!strength.valid) {
      return NextResponse.json({ error: { message: strength.message!, code: 'WEAK_PASSWORD' } }, { status: 400 });
    }

    const newHash = await hashPassword(data.newPassword);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash: newHash } });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: { message: error.issues[0].message, code: 'VALIDATION_ERROR' } }, { status: 400 });
    }
    console.error('PATCH /api/users/me/password error:', error);
    return NextResponse.json({ error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}
```

**Step 2: Create email change API**

Create `src/app/api/users/me/email/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth/options';
import { prisma } from '@/lib/db/prisma';
import { verifyPassword } from '@/lib/auth/password';

const schema = z.object({
  newEmail: z.string().email(),
  currentPassword: z.string().min(1),
});

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: { message: 'Not authenticated', code: 'UNAUTHORIZED' } }, { status: 401 });
    }

    const body = await request.json();
    const data = schema.parse(body);

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: { message: 'User not found', code: 'NOT_FOUND' } }, { status: 404 });
    }

    const isValid = await verifyPassword(data.currentPassword, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: { message: 'Password is incorrect', code: 'INVALID_PASSWORD' } }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email: data.newEmail } });
    if (existing) {
      return NextResponse.json({ error: { message: 'Email already in use', code: 'EMAIL_EXISTS' } }, { status: 400 });
    }

    await prisma.user.update({ where: { id: user.id }, data: { email: data.newEmail } });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: { message: error.issues[0].message, code: 'VALIDATION_ERROR' } }, { status: 400 });
    }
    console.error('PATCH /api/users/me/email error:', error);
    return NextResponse.json({ error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}
```

**Step 3: Create account settings page**

Create `src/app/(authenticated)/settings/account/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { apiFetch } from '@/lib/api/fetcher';
import { Loader2, Check, Mail, Lock } from 'lucide-react';

export default function AccountSettingsPage() {
  const { user } = useCurrentUser();

  // Email change
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailSaved, setEmailSaved] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleEmailChange = async () => {
    setEmailSaving(true);
    setEmailError(null);
    try {
      await apiFetch('/api/users/me/email', {
        method: 'PATCH',
        body: JSON.stringify({ newEmail, currentPassword: emailPassword }),
      });
      setEmailSaved(true);
      setNewEmail('');
      setEmailPassword('');
      setTimeout(() => setEmailSaved(false), 3000);
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setEmailSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    setPasswordSaving(true);
    setPasswordError(null);
    try {
      await apiFetch('/api/users/me/password', {
        method: 'PATCH',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setPasswordSaved(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSaved(false), 3000);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Email */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-1 flex items-center gap-2"><Mail className="w-5 h-5" /> Change Email</h2>
        <p className="text-sm text-gray-500 mb-4">Current: {user?.email}</p>
        <div className="space-y-3 max-w-md">
          <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="New email" className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none" />
          <input type="password" value={emailPassword} onChange={e => setEmailPassword(e.target.value)} placeholder="Current password" className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none" />
          {emailError && <p className="text-red-500 text-sm">{emailError}</p>}
          <button onClick={handleEmailChange} disabled={!newEmail || !emailPassword || emailSaving} className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold disabled:opacity-50 flex items-center gap-2">
            {emailSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            {emailSaved && <Check className="w-4 h-4" />}
            {emailSaved ? 'Updated!' : 'Update Email'}
          </button>
        </div>
      </div>

      {/* Password */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Lock className="w-5 h-5" /> Change Password</h2>
        <div className="space-y-3 max-w-md">
          <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Current password" className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none" />
          <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New password" className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none" />
          <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm new password" className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none" />
          {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
          <button onClick={handlePasswordChange} disabled={!currentPassword || !newPassword || !confirmPassword || passwordSaving} className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold disabled:opacity-50 flex items-center gap-2">
            {passwordSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            {passwordSaved && <Check className="w-4 h-4" />}
            {passwordSaved ? 'Updated!' : 'Update Password'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Step 4: Verify build**

Run: `npm run build`

**Step 5: Commit**

```bash
git add src/app/(authenticated)/settings/account/ src/app/api/users/me/password/ src/app/api/users/me/email/
git commit -m "feat: add account settings page with email and password change"
```

---

### Task 16: Create Notifications and Privacy Settings Pages

**Files:**
- Create: `src/app/(authenticated)/settings/notifications/page.tsx`
- Create: `src/app/(authenticated)/settings/privacy/page.tsx`

**Step 1: Create notifications settings page**

Create `src/app/(authenticated)/settings/notifications/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { apiFetch } from '@/lib/api/fetcher';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, Check, Bell } from 'lucide-react';

interface NotificationPrefs {
  emailOnFollow: boolean;
  emailOnReviewLike: boolean;
  emailOnTripLike: boolean;
  emailOnForumReply: boolean;
}

const DEFAULT_PREFS: NotificationPrefs = {
  emailOnFollow: true,
  emailOnReviewLike: true,
  emailOnTripLike: true,
  emailOnForumReply: true,
};

const PREF_LABELS: Record<keyof NotificationPrefs, { label: string; description: string }> = {
  emailOnFollow: { label: 'New follower', description: 'When someone follows you' },
  emailOnReviewLike: { label: 'Review liked', description: 'When someone likes your review' },
  emailOnTripLike: { label: 'Trip liked', description: 'When someone likes your trip' },
  emailOnForumReply: { label: 'Forum reply', description: 'When someone replies to your forum post' },
};

export default function NotificationSettingsPage() {
  const { user } = useCurrentUser();
  const queryClient = useQueryClient();
  const [prefs, setPrefs] = useState<NotificationPrefs>(
    (user?.notificationPrefs as NotificationPrefs) || DEFAULT_PREFS
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggle = (key: keyof NotificationPrefs) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await apiFetch('/api/users/me', {
        method: 'PATCH',
        body: JSON.stringify({ notificationPrefs: prefs }),
      });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      // Silently handle
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-bold mb-1 flex items-center gap-2"><Bell className="w-5 h-5" /> Email Notifications</h2>
      <p className="text-sm text-gray-500 mb-6">Choose which email notifications you'd like to receive.</p>

      <div className="space-y-4 max-w-md">
        {(Object.keys(PREF_LABELS) as (keyof NotificationPrefs)[]).map(key => (
          <label key={key} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 cursor-pointer">
            <div>
              <p className="font-medium text-sm">{PREF_LABELS[key].label}</p>
              <p className="text-xs text-gray-500">{PREF_LABELS[key].description}</p>
            </div>
            <button
              onClick={() => toggle(key)}
              className={`w-11 h-6 rounded-full transition-colors ${prefs[key] ? 'bg-purple-600' : 'bg-gray-300'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${prefs[key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </label>
        ))}

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-8 py-3 rounded-xl font-semibold disabled:opacity-50 flex items-center gap-2 mt-4"
        >
          {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
          {saved && <Check className="w-4 h-4" />}
          {saved ? 'Saved!' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
}
```

**Step 2: Create privacy settings page**

Create `src/app/(authenticated)/settings/privacy/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { apiFetch } from '@/lib/api/fetcher';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, Check, Eye } from 'lucide-react';

export default function PrivacySettingsPage() {
  const { user } = useCurrentUser();
  const queryClient = useQueryClient();
  const [defaultTripPublic, setDefaultTripPublic] = useState(user?.defaultTripPublic ?? true);
  const [discoverable, setDiscoverable] = useState(user?.discoverable ?? true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await apiFetch('/api/users/me', {
        method: 'PATCH',
        body: JSON.stringify({ defaultTripPublic, discoverable }),
      });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      // Silently handle
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-bold mb-1 flex items-center gap-2"><Eye className="w-5 h-5" /> Privacy</h2>
      <p className="text-sm text-gray-500 mb-6">Control who can see your content and find you.</p>

      <div className="space-y-4 max-w-md">
        <label className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 cursor-pointer">
          <div>
            <p className="font-medium text-sm">Default trip visibility</p>
            <p className="text-xs text-gray-500">New trips are public by default</p>
          </div>
          <button
            onClick={() => setDefaultTripPublic(!defaultTripPublic)}
            className={`w-11 h-6 rounded-full transition-colors ${defaultTripPublic ? 'bg-purple-600' : 'bg-gray-300'}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${defaultTripPublic ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </label>

        <label className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 cursor-pointer">
          <div>
            <p className="font-medium text-sm">Discoverable</p>
            <p className="text-xs text-gray-500">Appear in suggested users for other travelers</p>
          </div>
          <button
            onClick={() => setDiscoverable(!discoverable)}
            className={`w-11 h-6 rounded-full transition-colors ${discoverable ? 'bg-purple-600' : 'bg-gray-300'}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${discoverable ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </label>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-8 py-3 rounded-xl font-semibold disabled:opacity-50 flex items-center gap-2 mt-4"
        >
          {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
          {saved && <Check className="w-4 h-4" />}
          {saved ? 'Saved!' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
}
```

**Step 3: Update the PATCH /api/users/me route to accept the new fields**

In `src/app/api/users/me/route.ts`, update the `updateUserSchema` to include the new fields:

```typescript
const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores').optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional().nullable(),
  coverImageUrl: z.string().url().optional().nullable(),
  defaultTripPublic: z.boolean().optional(),
  discoverable: z.boolean().optional(),
  notificationPrefs: z.object({
    emailOnFollow: z.boolean(),
    emailOnReviewLike: z.boolean(),
    emailOnTripLike: z.boolean(),
    emailOnForumReply: z.boolean(),
  }).optional(),
});
```

And update the `data` spread in the `prisma.user.update` call to include:

```typescript
...(data.defaultTripPublic !== undefined && { defaultTripPublic: data.defaultTripPublic }),
...(data.discoverable !== undefined && { discoverable: data.discoverable }),
...(data.notificationPrefs !== undefined && { notificationPrefs: data.notificationPrefs }),
```

**Step 4: Verify build**

Run: `npm run build`

**Step 5: Commit**

```bash
git add src/app/(authenticated)/settings/notifications/ src/app/(authenticated)/settings/privacy/ src/app/api/users/me/route.ts
git commit -m "feat: add notification and privacy settings pages"
```

---

### Task 17: Create Danger Zone (Delete Account) Page

**Files:**
- Create: `src/app/(authenticated)/settings/danger/page.tsx`
- Create: `src/app/api/users/me/delete/route.ts`

**Step 1: Create delete account API**

Create `src/app/api/users/me/delete/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth/options';
import { prisma } from '@/lib/db/prisma';

const schema = z.object({
  confirmUsername: z.string().min(1),
});

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: { message: 'Not authenticated', code: 'UNAUTHORIZED' } }, { status: 401 });
    }

    const body = await request.json();
    const data = schema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, username: true },
    });

    if (!user) {
      return NextResponse.json({ error: { message: 'User not found', code: 'NOT_FOUND' } }, { status: 404 });
    }

    if (data.confirmUsername !== user.username) {
      return NextResponse.json({ error: { message: 'Username does not match', code: 'CONFIRMATION_FAILED' } }, { status: 400 });
    }

    // Cascade delete handles all related records
    await prisma.user.delete({ where: { id: user.id } });

    return NextResponse.json({ deleted: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: { message: error.issues[0].message, code: 'VALIDATION_ERROR' } }, { status: 400 });
    }
    console.error('DELETE /api/users/me/delete error:', error);
    return NextResponse.json({ error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}
```

**Step 2: Create danger zone page**

Create `src/app/(authenticated)/settings/danger/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { signOut } from 'next-auth/react';
import { apiFetch } from '@/lib/api/fetcher';
import { Loader2, AlertTriangle } from 'lucide-react';

export default function DangerSettingsPage() {
  const { user } = useCurrentUser();
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmInput, setConfirmInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (confirmInput !== user?.username) return;

    setIsDeleting(true);
    setError(null);

    try {
      await apiFetch('/api/users/me/delete', {
        method: 'DELETE',
        body: JSON.stringify({ confirmUsername: confirmInput }),
      });
      await signOut({ callbackUrl: '/' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account');
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-red-200">
      <h2 className="text-xl font-bold text-red-600 mb-1 flex items-center gap-2">
        <AlertTriangle className="w-5 h-5" /> Danger Zone
      </h2>
      <p className="text-sm text-gray-500 mb-6">These actions are permanent and cannot be undone.</p>

      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          className="bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors"
        >
          Delete My Account
        </button>
      ) : (
        <div className="border-2 border-red-300 rounded-xl p-6 bg-red-50 max-w-md">
          <p className="text-sm font-medium text-red-800 mb-3">
            This will permanently delete your account and all associated data: trips, reviews, posts, follows, and saved places.
          </p>
          <p className="text-sm text-red-700 mb-4">
            Type <strong>@{user?.username}</strong> to confirm:
          </p>
          <input
            type="text"
            value={confirmInput}
            onChange={e => setConfirmInput(e.target.value)}
            placeholder={user?.username || ''}
            className="w-full px-4 py-3 rounded-xl border-2 border-red-300 focus:border-red-500 focus:outline-none mb-3"
          />
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          <div className="flex gap-3">
            <button
              onClick={() => { setShowConfirm(false); setConfirmInput(''); }}
              className="flex-1 bg-gray-200 text-gray-700 px-4 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={confirmInput !== user?.username || isDeleting}
              className="flex-1 bg-red-600 text-white px-4 py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
              Delete Forever
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

**Step 3: Update middleware to protect settings routes**

In `src/middleware.ts`, add `/settings` to the `protectedRoutes` array:

```typescript
const protectedRoutes = ['/feed', '/explore', '/planner', '/forums', '/profile', '/reviews', '/settings'];
```

And add to the matcher:

```typescript
'/settings/:path*',
```

**Step 4: Verify build**

Run: `npm run build`

**Step 5: Commit**

```bash
git add src/app/(authenticated)/settings/danger/ src/app/api/users/me/delete/ src/middleware.ts
git commit -m "feat: add danger zone page with account deletion"
```

---

## Final Integration

### Task 18: Final Build Verification and Cleanup

**Step 1: Run full build**

```bash
npm run build
```

Expected: Clean build with all new routes generated.

**Step 2: Check for any TypeScript errors**

```bash
npx tsc --noEmit
```

Expected: No errors.

**Step 3: Run linter**

```bash
npm run lint
```

Expected: No lint errors (fix any that appear).

**Step 4: Final commit**

```bash
git add -A
git commit -m "chore: final build verification and cleanup"
```
