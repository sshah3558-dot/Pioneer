'use client';

import { useQuery } from '@tanstack/react-query';
import { FeedList } from '@/components/feed/FeedList';
import { ProfileSummary } from '@/components/feed/ProfileSummary';
import { SuggestedUsers } from '@/components/feed/SuggestedUsers';
import { CreatePost } from '@/components/feed/CreatePost';
import { apiFetch } from '@/lib/api/fetcher';
import { GetFeedResponse, FeedItem } from '@/types/api';
import { FeedActivity } from '@/lib/mock-data';

function feedItemToActivity(item: FeedItem): FeedActivity | null {
  if (item.type === 'trip' && item.trip) {
    return {
      id: item.id,
      type: item.trip.status === 'COMPLETED' ? 'trip_completed' : 'trip_started',
      user: item.trip.user,
      timestamp: new Date(item.createdAt),
      trip: item.trip,
    };
  }
  if (item.type === 'review' && item.review) {
    return {
      id: item.id,
      type: 'review_posted',
      user: item.review.user,
      timestamp: new Date(item.createdAt),
      rating: item.review.overallRating,
      review: item.review,
    };
  }
  if (item.type === 'follow' && item.follow) {
    return {
      id: item.id,
      type: 'follow',
      user: item.follow.follower,
      timestamp: new Date(item.createdAt),
      follow: item.follow,
    };
  }
  if (item.type === 'post' && item.post) {
    return {
      id: item.id,
      type: 'post',
      user: item.post.user,
      timestamp: new Date(item.createdAt),
      post: item.post,
    };
  }
  return null;
}

export default function FeedPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['feed'],
    queryFn: () => apiFetch<GetFeedResponse>('/api/feed'),
  });

  // Convert FeedItem items from API into FeedActivity format for FeedCard
  const activities: FeedActivity[] = (data?.items || [])
    .map(feedItemToActivity)
    .filter((a): a is FeedActivity => a !== null);

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
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                You&apos;re all caught up! Check back later for more updates.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
