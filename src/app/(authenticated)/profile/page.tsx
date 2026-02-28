'use client';

import { useQuery } from '@tanstack/react-query';
import { ProfileHeader } from '@/components/users/ProfileHeader';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { apiFetch } from '@/lib/api/fetcher';
import Link from 'next/link';
import { MapPin, Star } from 'lucide-react';

export default function ProfilePage() {
  const { user, isLoading: userLoading } = useCurrentUser();

  const { data: postsData } = useQuery({
    queryKey: ['myPosts'],
    queryFn: () => apiFetch<{ items: Array<{
      id: string;
      content: string;
      imageUrl: string | null;
      imageUrl2: string | null;
      imageUrl3: string | null;
      likeCount: number;
      compositeScore: number | null;
      rank: number | null;
      createdAt: string;
      place: {
        id: string;
        name: string;
        category: string;
        imageUrl: string | null;
        cityName: string;
        countryName: string;
      } | null;
    }>, total: number, hasMore: boolean }>('/api/posts?userId=me&pageSize=3'),
    enabled: !!user,
  });

  if (userLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden">
          <div className="h-64 bg-gray-200 dark:bg-gray-700 animate-pulse" />
          <div className="p-6 space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const posts = postsData?.items || [];

  // Compute average composite rating from all scored moments
  const ratedPosts = posts.filter((p) => p.compositeScore != null);
  const avgRating = ratedPosts.length > 0
    ? ratedPosts.reduce((sum, p) => sum + p.compositeScore!, 0) / ratedPosts.length
    : undefined;

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`;
    return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <ProfileHeader user={user} isOwnProfile momentCount={postsData?.total} avgRating={avgRating} />

      {/* My Moments */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-2xl gradient-text-135">My Moments</h3>
        {posts.length > 0 && (
          <Link href="/profile/posts" className="text-sm font-medium text-purple-600 hover:text-purple-800 transition-colors">
            View All Moments &rarr;
          </Link>
        )}
      </div>
      {posts.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-lg">No moments yet.</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Create your first moment to start sharing experiences!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div key={post.id} className="card-hover bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden">
              {post.imageUrl && (
                <div className="relative">
                  <img src={post.imageUrl} alt="" className="w-full h-48 object-cover" />
                  {post.compositeScore != null && (
                    <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1">
                      <Star className="w-3 h-3 fill-white" />
                      {post.compositeScore.toFixed(1)}
                    </div>
                  )}
                </div>
              )}
              {!post.imageUrl && post.compositeScore != null && (
                <div className="px-5 pt-4">
                  <span className="bg-gradient-to-r from-purple-600 to-pink-500 text-white text-xs font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                    <Star className="w-3 h-3 fill-white" />
                    {post.compositeScore.toFixed(1)}
                  </span>
                </div>
              )}
              <div className="p-5">
                {post.place && (
                  <p className="text-xs text-purple-600 dark:text-purple-400 font-medium flex items-center gap-1 mb-1.5">
                    <MapPin className="w-3 h-3" />
                    {post.place.name}{post.place.cityName ? `, ${post.place.cityName}` : ''}
                  </p>
                )}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">{timeAgo(post.createdAt)}</span>
                  {post.likeCount > 0 && (
                    <span className="bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-300 px-2 py-1 rounded-full text-xs font-bold">
                      {post.likeCount} likes
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">{post.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
