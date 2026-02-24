'use client';

import { useQuery } from '@tanstack/react-query';
import { FeedList } from '@/components/feed/FeedList';
import { ProfileSummary } from '@/components/feed/ProfileSummary';
import { SuggestedUsers } from '@/components/feed/SuggestedUsers';
import { CreatePost } from '@/components/feed/CreatePost';
import { apiFetch } from '@/lib/api/fetcher';
import { GetFeedResponse } from '@/types/api';
import { FeedActivity } from '@/lib/mock-data';

export default function FeedPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['feed'],
    queryFn: () => apiFetch<GetFeedResponse>('/api/feed'),
  });

  // Convert FeedItem items from API into FeedActivity format for FeedCard
  const activities: FeedActivity[] = (data?.items || [])
    .filter((item) => item.type === 'trip' && item.trip)
    .map((item) => ({
      id: item.id,
      type: item.trip!.status === 'COMPLETED' ? 'trip_completed' as const : 'trip_started' as const,
      user: item.trip!.user,
      timestamp: new Date(item.createdAt),
      trip: item.trip!,
    }));

  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Sidebar - Profile Summary & Suggested Users */}
        <div className="hidden lg:block space-y-6">
          <ProfileSummary />
          <SuggestedUsers />
        </div>

        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-6">
          <CreatePost />
          <FeedList activities={activities} isLoading={isLoading} />

          {!isLoading && activities.length > 0 && (
            <div className="text-center py-4">
              <p className="text-gray-500 text-sm">
                You&apos;re all caught up! Check back later for more updates.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
