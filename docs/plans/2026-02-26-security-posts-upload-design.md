# Design: Security Fixes, Profile My Posts, Auto-Compress Uploads

**Date:** 2026-02-26
**Status:** Approved

## Task 1: Security Assessment & Fixes

### Gaps Identified
1. SVG uploads allowed — XSS vector via `<script>` tags in SVG files
2. No rate limiting on login/signup/upload — brute force risk
3. No security headers (CSP, X-Frame-Options, X-Content-Type-Options)
4. Forum post content has no max length validation
5. User email exposed in public profile API responses

### Fixes
- Remove `image/svg+xml` and `svg` from allowed upload types
- Add in-memory rate limiter middleware for auth and upload endpoints
- Add security headers via Next.js config
- Add max length (10000 chars) to forum post content validation
- Strip email from public user profile responses (keep in /api/users/me only)

## Task 2: Profile "My Posts" — Show 3 + "View All"

### Current State
Shows ALL posts in a grid with no limit.

### Changes
- Limit profile page query to `pageSize=3`
- Add flex header row: "My Posts" left, "View All Posts" link right
- Create `/profile/posts` page showing all posts with pagination
- Only show "View All Posts" when there are more than 3 posts (use `hasMore` from API)

## Task 3: Auto-Compress Images Before Upload

### Root Cause
Photos > 2MB rejected by upload API with internal server error.

### Solution
- Add `compressImage()` utility using Canvas API (zero dependencies)
- Compress flow: load image → draw to canvas → export as JPEG with quality reduction
- Iteratively reduce quality (0.8 → 0.6 → 0.4) until under bucket max size
- Max dimension cap: 2048px for avatars, 3840px for covers/posts
- Integrate into `useImageUpload` hook — compress before upload
- Show "Compressing..." state in UI
- HEIC files auto-converted to JPEG via canvas rendering
