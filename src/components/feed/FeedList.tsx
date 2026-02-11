'use client';

import { FeedCard } from './FeedCard';
import { FeedActivity } from '@/lib/mock-data';
import { FeedCardSkeleton } from '@/components/shared/LoadingSkeletons';
import { EmptyState } from '@/components/shared/EmptyState';

interface FeedListProps {
  activities: FeedActivity[];
  isLoading?: boolean;
  isEmpty?: boolean;
}

export function FeedList({ activities, isLoading = false, isEmpty = false }: FeedListProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <FeedCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isEmpty || activities.length === 0) {
    return (
      <EmptyState
        type="feed"
        actionLabel="Explore travelers"
        onAction={() => {
          // Navigate to explore/discover users
          window.location.href = '/explore';
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {activities.map((activity) => (
        <FeedCard key={activity.id} activity={activity} />
      ))}
    </div>
  );
}
