'use client';

import { FeedList } from '@/components/feed/FeedList';
import { ProfileSummary } from '@/components/feed/ProfileSummary';
import { SuggestedUsers } from '@/components/feed/SuggestedUsers';
import { CreatePost } from '@/components/feed/CreatePost';
import { mockFeedActivities } from '@/lib/mock-data';

export default function FeedPage() {
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
          <FeedList activities={mockFeedActivities} />

          {/* Load more indicator */}
          <div className="text-center py-4">
            <p className="text-gray-500 text-sm">
              You&apos;re all caught up! Check back later for more updates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
