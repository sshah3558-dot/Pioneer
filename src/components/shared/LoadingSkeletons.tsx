'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// Trip Card Skeleton
export function TripCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-2xl overflow-hidden bg-white shadow-lg', className)}>
      <Skeleton className="w-full h-48" />
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <Skeleton className="h-5 w-3/4" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
}

// Place Card Skeleton
export function PlaceCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-2xl overflow-hidden bg-white shadow-lg', className)}>
      <Skeleton className="w-full h-40" />
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <Skeleton className="h-3 w-1/2" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  );
}

// User Preview Skeleton
export function UserPreviewSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Skeleton className="w-10 h-10 rounded-full" />
      <div className="space-y-1.5">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

// Feed Card Skeleton
export function FeedCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('p-6 bg-white rounded-2xl shadow-lg space-y-4', className)}>
      <div className="flex items-center gap-3">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="w-full h-80 rounded-xl" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      <div className="flex items-center gap-6 pt-4 border-t">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  );
}

// Profile Header Skeleton
export function ProfileHeaderSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('bg-white rounded-2xl shadow-lg overflow-hidden', className)}>
      <Skeleton className="w-full h-64" />
      <div className="grid grid-cols-5 gap-4 p-6 border-b">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="text-center space-y-2">
            <Skeleton className="h-8 w-16 mx-auto" />
            <Skeleton className="h-3 w-20 mx-auto" />
          </div>
        ))}
      </div>
      <div className="p-6 flex gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-10 w-32 rounded-full" />
        ))}
      </div>
    </div>
  );
}

// Review Card Skeleton
export function ReviewCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('p-4 bg-white rounded-2xl shadow-lg space-y-3', className)}>
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
    </div>
  );
}

// Forum Post Skeleton
export function ForumPostSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('p-6 bg-white rounded-2xl shadow-lg', className)}>
      <div className="flex items-start gap-4">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="flex gap-6">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Trip Planner Card Skeleton
export function TripPlannerCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('p-6 bg-white rounded-2xl shadow-lg space-y-4', className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
      <div className="flex -space-x-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="w-8 h-8 rounded-full" />
        ))}
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-7 w-20 rounded-full" />
        <Skeleton className="h-7 w-24 rounded-full" />
        <Skeleton className="h-7 w-16 rounded-full" />
      </div>
      <div>
        <Skeleton className="h-3 w-full rounded-full" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-12 w-full rounded-xl" />
    </div>
  );
}

// Profile Summary Skeleton
export function ProfileSummarySkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('p-6 bg-white rounded-2xl shadow-lg space-y-4', className)}>
      <div className="flex flex-col items-center space-y-3">
        <Skeleton className="w-24 h-24 rounded-full" />
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-12 w-full rounded-xl" />
    </div>
  );
}
