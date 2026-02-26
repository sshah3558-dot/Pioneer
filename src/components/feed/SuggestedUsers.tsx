'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/fetcher';

interface SuggestedUser {
  id: string;
  name: string | null;
  username: string | null;
  avatarUrl: string | null;
  tripCount: number;
  reviewCount: number;
  followerCount: number;
}

export function SuggestedUsers() {
  const queryClient = useQueryClient();
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());

  const { data, isLoading } = useQuery({
    queryKey: ['suggestedUsers'],
    queryFn: () => apiFetch<{ users: SuggestedUser[] }>('/api/users/suggested'),
  });

  const toggleFollow = async (userId: string) => {
    const isCurrentlyFollowing = following.has(userId);
    setLoadingIds((prev) => new Set(prev).add(userId));

    try {
      if (isCurrentlyFollowing) {
        await fetch('/api/follow', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        });
        setFollowing((prev) => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
      } else {
        await fetch('/api/follow', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        });
        setFollowing((prev) => new Set(prev).add(userId));
      }
      // Invalidate feed so it refreshes with new followed user's content
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    } catch (err) {
      console.error('Follow toggle failed:', err);
    } finally {
      setLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 animate-pulse">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-4" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div className="flex-1">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-1" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const users = data?.users || [];

  if (users.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6">
      <h3 className="font-bold text-lg mb-4 gradient-text-135">Suggested Pioneers</h3>
      <div className="space-y-4">
        {users.map((user) => {
          const isFollowing = following.has(user.id);
          const isLoadingFollow = loadingIds.has(user.id);
          return (
            <div key={user.id} className="flex items-center gap-3">
              <img
                src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}&background=667eea&color=fff`}
                alt={user.name || 'User'}
                className="w-12 h-12 rounded-full border-2 border-gray-200 dark:border-gray-700 object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate dark:text-gray-100">{user.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {user.tripCount} trips &middot; {user.reviewCount} reviews
                </div>
              </div>
              <button
                onClick={() => toggleFollow(user.id)}
                disabled={isLoadingFollow}
                className={`follow-btn px-3 sm:px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                  isFollowing
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    : 'bg-purple-600 text-white'
                } ${isLoadingFollow ? 'opacity-50' : ''}`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
