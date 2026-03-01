# Pioneer React Native Mobile App — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a React Native (Expo) mobile app in `/mobile` that mirrors the Pioneer web app, sharing the same API backend, deployable via TestFlight and Google Play.

**Architecture:** Expo SDK 52 with Expo Router (file-based navigation), NativeWind v4 (Tailwind CSS), React Query v5 for data fetching. Mobile authenticates via Bearer JWT tokens stored in SecureStore. Shared TypeScript types live in `/shared/types/`. The app calls the same Next.js API routes as the web app.

**Tech Stack:** Expo 52, React Native 0.76+, Expo Router v4, NativeWind v4, React Query v5, Expo SecureStore, Expo Image, Expo ImagePicker, TypeScript

---

## Track 1: Foundation & Scaffold

### Task 1.1: Initialize Expo Project

**Files:**
- Create: `mobile/` directory with Expo scaffold
- Create: `mobile/package.json`
- Create: `mobile/app.json`
- Create: `mobile/tsconfig.json`

**Step 1: Create Expo project**

Run from repo root:
```bash
npx create-expo-app@latest mobile --template tabs
cd mobile
```

**Step 2: Install core dependencies**

```bash
npx expo install expo-secure-store expo-image expo-image-picker expo-status-bar expo-constants
npm install @tanstack/react-query zod
npm install nativewind tailwindcss @tailwindcss/postcss --save-dev
```

**Step 3: Configure app.json**

Update `mobile/app.json`:
```json
{
  "expo": {
    "name": "Pioneer",
    "slug": "pioneer",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "pioneer",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "com.pioneer.app",
      "infoPlist": {
        "NSPhotoLibraryUsageDescription": "Pioneer needs access to your photos to share travel moments.",
        "NSCameraUsageDescription": "Pioneer needs camera access to capture travel moments."
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#7C3AED"
      },
      "package": "com.pioneer.app"
    },
    "plugins": ["expo-secure-store", "expo-image-picker", "expo-router"],
    "experiments": {
      "typedRoutes": true
    }
  }
}
```

**Step 4: Verify Expo project runs**

```bash
cd mobile
npx expo start
```
Expected: Expo dev server starts, QR code displayed.

**Step 5: Commit**

```bash
git add mobile/
git commit -m "feat(mobile): initialize Expo project with core dependencies"
```

---

### Task 1.2: Configure NativeWind (Tailwind for React Native)

**Files:**
- Create: `mobile/tailwind.config.ts`
- Create: `mobile/global.css`
- Modify: `mobile/app/_layout.tsx`
- Modify: `mobile/metro.config.js`

**Step 1: Create tailwind.config.ts**

```typescript
// mobile/tailwind.config.ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        pioneer: {
          purple: '#7C3AED',
          pink: '#EC4899',
          blue: '#3B82F6',
        },
      },
      fontFamily: {
        sora: ['Sora'],
        'dm-sans': ['DMSans'],
      },
    },
  },
  plugins: [],
} satisfies Config;
```

**Step 2: Create global.css**

```css
/* mobile/global.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Step 3: Update metro.config.js for NativeWind**

```javascript
// mobile/metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: './global.css' });
```

**Step 4: Import global.css in root layout**

Add to top of `mobile/app/_layout.tsx`:
```typescript
import '../global.css';
```

**Step 5: Verify NativeWind works**

Create a test screen with Tailwind classes, run `npx expo start`, verify styles render.

**Step 6: Commit**

```bash
git add mobile/tailwind.config.ts mobile/global.css mobile/metro.config.js mobile/app/_layout.tsx
git commit -m "feat(mobile): configure NativeWind v4 with Pioneer theme"
```

---

### Task 1.3: Extract Shared Types

**Files:**
- Create: `shared/types/user.ts`
- Create: `shared/types/moment.ts`
- Create: `shared/types/trip.ts`
- Create: `shared/types/place.ts`
- Create: `shared/types/review.ts`
- Create: `shared/types/forum.ts`
- Create: `shared/types/feed.ts`
- Create: `shared/types/api.ts`
- Create: `shared/types/index.ts`

**Step 1: Create shared/types/ directory structure**

Copy and consolidate types from `src/types/*.ts` into `shared/types/`. Each file should export the interfaces that both web and mobile need.

**`shared/types/user.ts`:**
```typescript
export type SubscriptionTier = 'FREE' | 'PREMIUM';

export type InterestCategory =
  | 'FOOD_DRINK' | 'ART_CULTURE' | 'OUTDOORS_NATURE' | 'NIGHTLIFE'
  | 'SHOPPING' | 'HISTORY' | 'ADVENTURE' | 'RELAXATION' | 'PHOTOGRAPHY'
  | 'LOCAL_EXPERIENCES' | 'ARCHITECTURE' | 'MUSIC' | 'SPORTS' | 'WELLNESS';

export interface UserPreview {
  id: string;
  name: string | null;
  username: string | null;
  avatarUrl: string | null;
  tripCount: number;
  followerCount: number;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  username: string | null;
  bio: string | null;
  avatarUrl: string | null;
  coverImageUrl: string | null;
  onboardingComplete: boolean;
  subscriptionTier: SubscriptionTier;
  tripCount: number;
  reviewCount: number;
  followerCount: number;
  followingCount: number;
  createdAt: string;
}

export interface UserInterest {
  id: string;
  userId: string;
  category: InterestCategory;
  weight: number;
}

export interface UserProfile extends User {
  interests: UserInterest[];
  isFollowing?: boolean;
}
```

**`shared/types/moment.ts`:**
```typescript
import { UserPreview } from './user';

export interface Moment {
  id: string;
  content: string;
  imageUrl: string | null;
  imageUrl2: string | null;
  imageUrl3: string | null;
  overallRating: number | null;
  valueRating: number | null;
  authenticityRating: number | null;
  crowdRating: number | null;
  compositeScore: number | null;
  rank: number | null;
  likeCount: number;
  viewCount: number;
  createdAt: string;
  isSaved: boolean;
  user: UserPreview;
  place: MomentPlace | null;
}

export interface MomentPlace {
  id: string;
  name: string;
  category: string;
  imageUrl: string | null;
  cityName?: string;
  countryName?: string;
}

export interface CreateMomentRequest {
  content: string;
  imageUrl?: string;
  imageUrl2?: string;
  imageUrl3?: string;
  overallRating?: number;
  valueRating?: number;
  authenticityRating?: number;
  crowdRating?: number;
  placeId?: string;
}
```

**`shared/types/trip.ts`:**
```typescript
import { UserPreview } from './user';

export type TripStatus = 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED';

export interface TripCard {
  id: string;
  title: string;
  coverImageUrl: string | null;
  startDate: string | null;
  endDate: string | null;
  likeCount: number;
  status: TripStatus;
  user: UserPreview;
  city: { name: string; country: { name: string } };
  stopCount: number;
  isLiked: boolean;
}

export interface CreateTripInput {
  cityId: string;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  isPublic?: boolean;
}
```

**`shared/types/place.ts`:**
```typescript
export type PlaceCategory =
  | 'RESTAURANT' | 'CAFE' | 'BAR' | 'NIGHTCLUB' | 'MUSEUM' | 'GALLERY'
  | 'MONUMENT' | 'LANDMARK' | 'PARK' | 'BEACH' | 'VIEWPOINT' | 'MARKET'
  | 'SHOP' | 'HOTEL' | 'HOSTEL' | 'TOUR' | 'ACTIVITY' | 'HIDDEN_GEM' | 'OTHER';

export type PriceLevel = 'FREE' | 'BUDGET' | 'MODERATE' | 'EXPENSIVE' | 'LUXURY';

export interface PlaceCard {
  id: string;
  name: string;
  category: PlaceCategory;
  imageUrl: string | null;
  neighborhood: string | null;
  avgOverallRating: number | null;
  totalReviewCount: number;
  priceLevel: PriceLevel | null;
  cityName?: string;
  countryName?: string;
  isSaved: boolean;
}
```

**`shared/types/forum.ts`:**
```typescript
import { UserPreview } from './user';

export interface Forum {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  postCount: number;
}

export interface ForumPostItem {
  id: string;
  title: string;
  content: string;
  user: UserPreview;
  commentCount: number;
  viewCount: number;
  isPinned: boolean;
  createdAt: string;
  forumName: string;
  forumSlug: string;
}

export interface ForumComment {
  id: string;
  content: string;
  user: UserPreview;
  parentId: string | null;
  createdAt: string;
}
```

**`shared/types/feed.ts`:**
```typescript
import { UserPreview } from './user';
import { TripCard } from './trip';

export type FeedItemType = 'trip' | 'review' | 'follow' | 'post';

export interface FeedItem {
  id: string;
  type: FeedItemType;
  createdAt: string;
  trip?: TripCard;
  review?: {
    id: string;
    overallRating: number;
    content: string;
    likeCount: number;
    createdAt: string;
    user: UserPreview;
    place?: { id: string; name: string; category: string };
  };
  follow?: { follower: UserPreview; following: UserPreview };
  post?: {
    id: string;
    content: string;
    imageUrl: string | null;
    imageUrl2: string | null;
    imageUrl3: string | null;
    compositeScore: number | null;
    likeCount: number;
    user: UserPreview;
    createdAt: string;
    place?: { id: string; name: string; category: string; cityName?: string; countryName?: string } | null;
  };
}
```

**`shared/types/api.ts`:**
```typescript
export interface ApiError {
  message: string;
  code: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
```

**`shared/types/index.ts`:**
```typescript
export * from './user';
export * from './moment';
export * from './trip';
export * from './place';
export * from './review';
export * from './forum';
export * from './feed';
export * from './api';
```

**Step 2: Commit**

```bash
git add shared/
git commit -m "feat: extract shared TypeScript types for web + mobile"
```

---

### Task 1.4: Build API Client

**Files:**
- Create: `mobile/lib/api.ts`
- Create: `mobile/lib/auth.ts`

**Step 1: Create auth token manager**

```typescript
// mobile/lib/auth.ts
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'pioneer_jwt';
const USER_KEY = 'pioneer_user';

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(USER_KEY);
}

export async function getStoredUser(): Promise<any | null> {
  const raw = await SecureStore.getItemAsync(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function setStoredUser(user: any): Promise<void> {
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
}
```

**Step 2: Create typed API client**

```typescript
// mobile/lib/api.ts
import { getToken } from './auth';
import type { PaginatedResponse, ApiError } from '../../shared/types';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

class ApiClient {
  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const error = body.error as ApiError | undefined;
      throw new Error(error?.message || `Request failed: ${res.status}`);
    }

    return res.json();
  }

  get<T>(path: string): Promise<T> {
    return this.request<T>(path);
  }

  post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  patch<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: 'DELETE' });
  }

  async upload(uri: string): Promise<{ url: string }> {
    const token = await getToken();
    const formData = new FormData();
    const filename = uri.split('/').pop() || 'photo.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('file', { uri, name: filename, type } as any);

    const res = await fetch(`${API_BASE}/api/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    if (!res.ok) throw new Error('Upload failed');
    return res.json();
  }
}

export const api = new ApiClient();
```

**Step 3: Commit**

```bash
git add mobile/lib/
git commit -m "feat(mobile): API client with SecureStore auth token management"
```

---

### Task 1.5: React Query Provider & Auth Context

**Files:**
- Create: `mobile/lib/query.ts`
- Create: `mobile/contexts/AuthContext.tsx`
- Modify: `mobile/app/_layout.tsx`

**Step 1: Create React Query config**

```typescript
// mobile/lib/query.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

**Step 2: Create AuthContext**

```typescript
// mobile/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { getToken, setToken, clearToken, setStoredUser, getStoredUser } from '../lib/auth';
import type { UserProfile } from '../../shared/types';

interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const refreshUser = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) {
        setState({ user: null, isLoading: false, isAuthenticated: false });
        return;
      }
      const data = await api.get<{ user: UserProfile }>('/api/users/me');
      await setStoredUser(data.user);
      setState({ user: data.user, isLoading: false, isAuthenticated: true });
    } catch {
      await clearToken();
      setState({ user: null, isLoading: false, isAuthenticated: false });
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const data = await api.post<{ token: string; user: UserProfile }>(
      '/api/auth/mobile-login',
      { email, password }
    );
    await setToken(data.token);
    await setStoredUser(data.user);
    setState({ user: data.user, isLoading: false, isAuthenticated: true });
  };

  const signup = async (name: string, email: string, username: string, password: string) => {
    await api.post('/api/auth/signup', { name, email, username, password });
    await login(email, password);
  };

  const logout = async () => {
    await clearToken();
    setState({ user: null, isLoading: false, isAuthenticated: false });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
```

**Step 3: Wire up root layout**

```typescript
// mobile/app/_layout.tsx
import '../global.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../lib/query';
import { AuthProvider } from '../contexts/AuthContext';

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }} />
      </AuthProvider>
    </QueryClientProvider>
  );
}
```

**Step 4: Commit**

```bash
git add mobile/lib/query.ts mobile/contexts/AuthContext.tsx mobile/app/_layout.tsx
git commit -m "feat(mobile): React Query provider + AuthContext with SecureStore"
```

---

## Track 2: Backend Changes

### Task 2.1: Mobile Login Endpoint (Returns JWT)

**Files:**
- Create: `src/app/api/auth/mobile-login/route.ts`

**Step 1: Create mobile login endpoint**

```typescript
// src/app/api/auth/mobile-login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { verifyPassword } from '@/lib/auth/password';
import { rateLimit } from '@/lib/security/rate-limiter';
import jwt from 'jsonwebtoken';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, { maxRequests: 10, windowMs: 60000 });
  if (limited) return limited;

  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { message: 'Invalid credentials', code: 'VALIDATION_ERROR' } },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({
      where: { email },
      include: { interests: true },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: { message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' } },
        { status: 401 }
      );
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: { message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' } },
        { status: 401 }
      );
    }

    const secret = process.env.NEXTAUTH_SECRET || 'dev-secret';
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        username: user.username,
        onboardingComplete: user.onboardingComplete,
      },
      secret,
      { expiresIn: '30d' }
    );

    const { passwordHash: _, ...safeUser } = user;

    return NextResponse.json({ token, user: safeUser });
  } catch (error) {
    console.error('Mobile login error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
```

**Step 2: Install jsonwebtoken**

```bash
npm install jsonwebtoken
npm install -D @types/jsonwebtoken
```

**Step 3: Commit**

```bash
git add src/app/api/auth/mobile-login/ package.json package-lock.json
git commit -m "feat: add /api/auth/mobile-login endpoint for mobile JWT auth"
```

---

### Task 2.2: Bearer Token Middleware

**Files:**
- Create: `src/lib/auth/mobile-auth.ts`
- Modify: API routes that need mobile auth support

**Step 1: Create mobile auth helper**

```typescript
// src/lib/auth/mobile-auth.ts
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from './options';
import { prisma } from '@/lib/db/prisma';
import jwt from 'jsonwebtoken';

interface MobileToken {
  id: string;
  email: string;
  username: string | null;
  onboardingComplete: boolean;
}

/**
 * Get the current user from either NextAuth session (web) or Bearer token (mobile).
 * Returns the user record or null if not authenticated.
 */
export async function getCurrentUser(request?: NextRequest) {
  // Try NextAuth session first (web)
  const session = await getServerSession(authOptions);
  if (session?.user?.email) {
    return prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, username: true, name: true, avatarUrl: true, onboardingComplete: true },
    });
  }

  // Try Bearer token (mobile)
  if (request) {
    const auth = request.headers.get('authorization');
    if (auth?.startsWith('Bearer ')) {
      try {
        const secret = process.env.NEXTAUTH_SECRET || 'dev-secret';
        const decoded = jwt.verify(auth.slice(7), secret) as MobileToken;
        return prisma.user.findUnique({
          where: { email: decoded.email },
          select: { id: true, email: true, username: true, name: true, avatarUrl: true, onboardingComplete: true },
        });
      } catch {
        return null;
      }
    }
  }

  return null;
}
```

**Step 2: Commit**

```bash
git add src/lib/auth/mobile-auth.ts
git commit -m "feat: add getCurrentUser helper supporting both session and Bearer token auth"
```

**Note:** Existing API routes can be gradually migrated from `getServerSession` to `getCurrentUser` to support mobile. This can be done incrementally — each route that mobile needs to call should be updated to use `getCurrentUser(request)` instead of `getServerSession(authOptions)`.

---

## Track 3: Auth Screens

### Task 3.1: Login Screen

**Files:**
- Create: `mobile/app/(auth)/login.tsx`
- Create: `mobile/app/(auth)/_layout.tsx`

**Step 1: Create auth layout**

```typescript
// mobile/app/(auth)/_layout.tsx
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
```

**Step 2: Create login screen**

```typescript
// mobile/app/(auth)/login.tsx
import { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.replace('/(tabs)/feed');
    } catch (e: any) {
      setError(e.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white dark:bg-gray-950"
    >
      <View className="flex-1 justify-center px-6">
        {/* Logo */}
        <Text className="text-3xl font-bold text-center mb-2 text-purple-600">Pioneer</Text>
        <Text className="text-gray-500 dark:text-gray-400 text-center mb-8">Discover Together</Text>

        {error ? (
          <View className="bg-red-50 dark:bg-red-900/20 p-3 rounded-xl mb-4">
            <Text className="text-red-600 dark:text-red-400 text-sm text-center">{error}</Text>
          </View>
        ) : null}

        <TextInput
          className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl px-4 py-3.5 mb-3 text-base"
          placeholder="Email"
          placeholderTextColor="#9CA3AF"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />

        <TextInput
          className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl px-4 py-3.5 mb-6 text-base"
          placeholder="Password"
          placeholderTextColor="#9CA3AF"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
        />

        <Pressable
          onPress={handleLogin}
          disabled={loading}
          className="bg-purple-600 rounded-xl py-3.5 items-center mb-4"
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold text-base">Log In</Text>
          )}
        </Pressable>

        <View className="flex-row justify-center">
          <Text className="text-gray-500 dark:text-gray-400">Don't have an account? </Text>
          <Link href="/(auth)/signup" asChild>
            <Pressable>
              <Text className="text-purple-600 font-semibold">Sign Up</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
```

**Step 3: Commit**

```bash
git add mobile/app/\(auth\)/
git commit -m "feat(mobile): login screen with auth context integration"
```

---

### Task 3.2: Signup Screen

**Files:**
- Create: `mobile/app/(auth)/signup.tsx`

**Step 1: Create signup screen**

Build signup screen matching the web's validation rules:
- Name: required
- Email: valid email
- Username: 3+ chars, alphanumeric + underscore
- Password: 8+ chars, uppercase, lowercase, digit

Follow the same pattern as login screen. On success, call `signup()` from AuthContext which auto-logs in, then `router.replace('/onboarding')`.

**Step 2: Commit**

```bash
git add mobile/app/\(auth\)/signup.tsx
git commit -m "feat(mobile): signup screen with validation"
```

---

### Task 3.3: Auth Navigation Guard

**Files:**
- Modify: `mobile/app/_layout.tsx`

**Step 1: Add auth-based routing**

Update root layout to redirect based on auth state:
- Not authenticated → `/(auth)/login`
- Authenticated + not onboarded → `/onboarding`
- Authenticated + onboarded → `/(tabs)/feed`

Use `useAuth()` hook's `isLoading`, `isAuthenticated`, and `user.onboardingComplete` to control routing with `router.replace()` in a `useEffect`.

**Step 2: Commit**

```bash
git add mobile/app/_layout.tsx
git commit -m "feat(mobile): auth navigation guard with onboarding redirect"
```

---

## Track 4: Onboarding

### Task 4.1: Onboarding Flow

**Files:**
- Create: `mobile/app/onboarding.tsx`
- Create: `mobile/components/onboarding/StepIndicator.tsx`

**Step 1: Build 6-step onboarding**

Replicate the web's onboarding flow (`src/components/onboarding/OnboardingSteps.tsx`):
1. Welcome
2. Traveler Type (solo/couple/group/family)
3. Interests (select 3+ from 14 categories)
4. Budget Level (budget/moderate/luxury)
5. Travel Pace (packed/balanced/slow)
6. Social Connections (optional Instagram/TikTok)

Use `useState` for step tracking, horizontal swipe or button navigation.

On complete:
```typescript
await api.post('/api/users/me/interests', { interests });
await api.patch('/api/users/me', { bio: JSON.stringify(preferences) });
await api.post('/api/users/me/onboarding');
await refreshUser();
router.replace('/(tabs)/feed');
```

**Step 2: Commit**

```bash
git add mobile/app/onboarding.tsx mobile/components/onboarding/
git commit -m "feat(mobile): 6-step onboarding flow with interest selection"
```

---

## Track 5: Core Tab Screens

### Task 5.1: Tab Layout & Bottom Navigation

**Files:**
- Create: `mobile/app/(tabs)/_layout.tsx`
- Create: `mobile/app/(tabs)/feed.tsx` (placeholder)
- Create: `mobile/app/(tabs)/explore.tsx` (placeholder)
- Create: `mobile/app/(tabs)/create.tsx` (placeholder)
- Create: `mobile/app/(tabs)/trips.tsx` (placeholder)
- Create: `mobile/app/(tabs)/profile.tsx` (placeholder)

**Step 1: Create tab layout**

```typescript
// mobile/app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Home, Search, PlusCircle, Plane, User } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#7C3AED',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0.5,
          borderTopColor: '#E5E7EB',
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen name="feed" options={{ title: 'Feed', tabBarIcon: ({ color, size }) => <Home size={size} color={color} /> }} />
      <Tabs.Screen name="explore" options={{ title: 'Explore', tabBarIcon: ({ color, size }) => <Search size={size} color={color} /> }} />
      <Tabs.Screen name="create" options={{ title: 'Create', tabBarIcon: ({ color, size }) => <PlusCircle size={size} color={color} /> }} />
      <Tabs.Screen name="trips" options={{ title: 'Trips', tabBarIcon: ({ color, size }) => <Plane size={size} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color, size }) => <User size={size} color={color} /> }} />
    </Tabs>
  );
}
```

**Step 2: Install lucide-react-native**

```bash
cd mobile && npm install lucide-react-native react-native-svg
```

**Step 3: Create placeholder screens**

Each tab gets a simple placeholder:
```typescript
// mobile/app/(tabs)/feed.tsx
import { View, Text } from 'react-native';

export default function FeedScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-gray-950">
      <Text className="text-lg font-semibold text-gray-900 dark:text-white">Feed</Text>
    </View>
  );
}
```

**Step 4: Commit**

```bash
git add mobile/app/\(tabs\)/
git commit -m "feat(mobile): tab layout with 5-tab bottom navigation"
```

---

### Task 5.2: Feed Screen

**Files:**
- Modify: `mobile/app/(tabs)/feed.tsx`
- Create: `mobile/components/feed/FeedCard.tsx`

**Step 1: Build FeedCard component**

Native version of web's `FeedCard.tsx`. Uses `<Image>` from expo-image, `<Pressable>` for interactions. Displays:
- User avatar + name + timestamp
- Content text
- Image(s) if present
- Composite score badge
- Like/comment/save action bar

**Step 2: Build Feed screen**

```typescript
// Key structure for feed screen:
import { useQuery } from '@tanstack/react-query';
import { FlatList, RefreshControl } from 'react-native';

// Fetch feed
const { data, isLoading, refetch } = useQuery({
  queryKey: ['feed', page],
  queryFn: () => api.get(`/api/feed?page=${page}&pageSize=20`),
});

// FlatList with pull-to-refresh
<FlatList
  data={data?.items}
  renderItem={({ item }) => <FeedCard activity={item} />}
  keyExtractor={(item) => item.id}
  refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
  onEndReached={loadMore}
  onEndReachedThreshold={0.5}
/>
```

**Step 3: Commit**

```bash
git add mobile/app/\(tabs\)/feed.tsx mobile/components/feed/
git commit -m "feat(mobile): feed screen with FeedCard and pull-to-refresh"
```

---

### Task 5.3: Explore Screen

**Files:**
- Modify: `mobile/app/(tabs)/explore.tsx`
- Create: `mobile/components/moments/MomentCard.tsx`

**Step 1: Build MomentCard component**

Grid card showing: image, composite score badge, user info, place name, save button.

**Step 2: Build Explore screen**

- Search bar at top (debounced 300ms)
- 3 filter tabs: Recommended, Most Viewed, Top Rated
- 2-column grid of MomentCards using `FlatList` with `numColumns={2}`
- Pull-to-refresh + infinite scroll

Query: `api.get('/api/moments?filter=${filter}&search=${search}&page=${page}')`

**Step 3: Commit**

```bash
git add mobile/app/\(tabs\)/explore.tsx mobile/components/moments/
git commit -m "feat(mobile): explore screen with search, filters, and moment grid"
```

---

### Task 5.4: Create Moment Screen

**Files:**
- Modify: `mobile/app/(tabs)/create.tsx`
- Create: `mobile/components/moments/CreateMomentForm.tsx`
- Create: `mobile/components/shared/StarRating.tsx`

**Step 1: Build StarRating component**

Interactive 5-star rating with half-star support. Uses Pressable + SVG stars.

**Step 2: Build CreateMomentForm**

- Text input (max 2000 chars)
- Image picker (Expo ImagePicker — up to 3 photos)
- Place search (calls `/api/places?search=...`)
- Rating inputs: Overall (required), Value, Authenticity, Crowd (optional)
- Submit: uploads images to `/api/upload`, then posts to `/api/posts`

**Step 3: Commit**

```bash
git add mobile/app/\(tabs\)/create.tsx mobile/components/moments/ mobile/components/shared/
git commit -m "feat(mobile): create moment screen with image picker and star ratings"
```

---

### Task 5.5: Profile Screen

**Files:**
- Modify: `mobile/app/(tabs)/profile.tsx`
- Create: `mobile/components/profile/ProfileHeader.tsx`
- Create: `mobile/components/profile/MomentGrid.tsx`

**Step 1: Build ProfileHeader**

- Cover image (gradient fallback)
- Avatar
- Name, username, bio
- 5-stat row: Reviews, Moments, Followers, Following, Avg Rating
- Achievement badges
- Edit Profile button (navigates to settings)

**Step 2: Build MomentGrid**

User's moments in a grid. Query: `api.get('/api/posts?userId=me')`

**Step 3: Build Profile screen**

Combines ProfileHeader + MomentGrid in a ScrollView.

**Step 4: Commit**

```bash
git add mobile/app/\(tabs\)/profile.tsx mobile/components/profile/
git commit -m "feat(mobile): profile screen with header, stats, and moment grid"
```

---

### Task 5.6: Trips Screen

**Files:**
- Modify: `mobile/app/(tabs)/trips.tsx`
- Create: `mobile/components/trips/TripCard.tsx`
- Create: `mobile/app/trips/[id].tsx`

**Step 1: Build TripCard**

Native version showing: cover image, title, city/country, date range, status badge, stop count, like count.

**Step 2: Build Trips list**

FlatList of TripCards. Query: `api.get('/api/trips?userId=me')`
Add FAB button to create new trip.

**Step 3: Build Trip detail screen**

Route: `mobile/app/trips/[id].tsx`
Shows full trip with stops list. Query: `api.get('/api/trips/${id}')` + `api.get('/api/trips/${id}/stops')`

**Step 4: Commit**

```bash
git add mobile/app/\(tabs\)/trips.tsx mobile/components/trips/ mobile/app/trips/
git commit -m "feat(mobile): trips list, trip detail, and TripCard component"
```

---

## Track 6: Secondary Screens

### Task 6.1: Moment Detail Screen

**Files:**
- Create: `mobile/app/moments/[id].tsx`

Shows full moment with all images, ratings, place info, user info. Includes save/like actions.

**Commit:** `feat(mobile): moment detail screen`

---

### Task 6.2: Forums Screens

**Files:**
- Create: `mobile/app/forums/index.tsx` (forum list)
- Create: `mobile/app/forums/[slug].tsx` (forum thread with posts)
- Create: `mobile/components/forums/ForumPostCard.tsx`

Forum list → forum posts → comments. Matches web forum layout.

**Commit:** `feat(mobile): forums list and thread screens`

---

### Task 6.3: User Profile Screen

**Files:**
- Create: `mobile/app/users/[username].tsx`

Public user profile with follow/unfollow button. Reuses ProfileHeader component.

**Commit:** `feat(mobile): public user profile screen with follow/unfollow`

---

### Task 6.4: Settings Screens

**Files:**
- Create: `mobile/app/settings/index.tsx` (settings menu)
- Create: `mobile/app/settings/profile.tsx` (edit profile)
- Create: `mobile/app/settings/account.tsx` (email, password)
- Create: `mobile/app/settings/notifications.tsx`

Settings menu with navigation to sub-screens. Profile edit includes avatar/cover image picker.

**Commit:** `feat(mobile): settings screens (profile, account, notifications)`

---

## Track 7: Polish & Distribution

### Task 7.1: App Icons & Splash Screen

**Files:**
- Create: `mobile/assets/images/icon.png` (1024x1024)
- Create: `mobile/assets/images/adaptive-icon.png` (1024x1024)
- Create: `mobile/assets/images/splash-icon.png` (512x512)

Generate Pioneer-branded app icons (purple gradient with "P" logo).

**Commit:** `feat(mobile): app icons and splash screen`

---

### Task 7.2: Dark Mode Support

**Files:**
- Modify: `mobile/app/_layout.tsx`
- Modify: Tab layout and all screens

Ensure all screens use `dark:` NativeWind variants. Configure `useColorScheme()` from React Native and wire to app theme.

**Commit:** `feat(mobile): dark mode support across all screens`

---

### Task 7.3: Loading & Error States

**Files:**
- Create: `mobile/components/shared/LoadingSkeleton.tsx`
- Create: `mobile/components/shared/ErrorState.tsx`
- Create: `mobile/components/shared/EmptyState.tsx`

Add consistent loading skeletons, error retry states, and empty list messaging across all screens.

**Commit:** `feat(mobile): loading skeletons, error states, and empty states`

---

### Task 7.4: EAS Build Configuration

**Files:**
- Create: `mobile/eas.json`
- Modify: `mobile/app.json`

**Step 1: Install EAS CLI**

```bash
npm install -g eas-cli
```

**Step 2: Create eas.json**

```json
{
  "cli": { "version": ">= 12.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": { "simulator": false }
    },
    "production": {}
  },
  "submit": {
    "production": {
      "ios": { "appleId": "PARTNER_APPLE_ID", "ascAppId": "APP_STORE_CONNECT_APP_ID" }
    }
  }
}
```

**Step 3: Configure EAS project**

```bash
cd mobile
eas login
eas build:configure
```

**Step 4: Build for TestFlight**

```bash
eas build --platform ios --profile preview
eas submit --platform ios
```

**Step 5: Commit**

```bash
git add mobile/eas.json
git commit -m "feat(mobile): EAS Build configuration for TestFlight and production"
```

---

## Task Dependencies

```
Track 1 (Foundation): 1.1 → 1.2 → 1.3 → 1.4 → 1.5
Track 2 (Backend):     2.1 → 2.2 (can run parallel with Track 1)
Track 3 (Auth):        3.1 → 3.2 → 3.3 (depends on Track 1 + Track 2)
Track 4 (Onboarding):  4.1 (depends on Track 3)
Track 5 (Core):        5.1 → 5.2, 5.3, 5.4, 5.5, 5.6 (parallel, depend on 5.1)
Track 6 (Secondary):   6.1, 6.2, 6.3, 6.4 (all parallel, depend on Track 5)
Track 7 (Polish):      7.1, 7.2, 7.3 (parallel) → 7.4 (last)
```

**Parallelizable groups:**
- Tracks 1 + 2 (foundation + backend) can run simultaneously
- Tasks 5.2-5.6 (all core screens) can run in parallel after 5.1
- Tasks 6.1-6.4 (all secondary screens) can run in parallel
- Tasks 7.1-7.3 (polish) can run in parallel
