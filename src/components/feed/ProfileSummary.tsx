'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';

export function ProfileSummary() {
  const { user, isLoading } = useCurrentUser();

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 animate-pulse">
        <div className="text-center mb-4">
          <div className="w-24 h-24 rounded-full mx-auto mb-3 bg-gray-200 dark:bg-gray-700" />
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32 mx-auto mb-2" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mx-auto" />
        </div>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl p-3 bg-gray-100 dark:bg-gray-800 h-16" />
          ))}
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6">
      <div className="text-center mb-4">
        <Image
          src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}&background=667eea&color=fff`}
          alt={user.name || 'User'}
          width={96}
          height={96}
          className="w-24 h-24 rounded-full mx-auto mb-3 border-4 border-purple-500 shadow-lg object-cover"
        />
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{user.name}</h3>
        <p className="text-gray-500 dark:text-gray-400">@{user.username}</p>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="stat-card dark:bg-gray-800 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold gradient-text-135">{user.reviewCount}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Reviews</div>
        </div>
        <div className="stat-card dark:bg-gray-800 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold gradient-text-135">{user.tripCount}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Trips</div>
        </div>
        <div className="stat-card dark:bg-gray-800 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold gradient-text-135">
            {user.followerCount >= 1000
              ? `${(user.followerCount / 1000).toFixed(1)}k`
              : user.followerCount}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Followers</div>
        </div>
      </div>
      <Link
        href="/profile"
        className="block w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all text-center"
      >
        View Full Profile
      </Link>
    </div>
  );
}
