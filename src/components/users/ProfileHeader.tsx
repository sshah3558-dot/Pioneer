'use client';

import { UserProfile } from '@/types/user';
import { GradientButton } from '@/components/shared/GradientButton';
import Link from 'next/link';

interface ProfileHeaderProps {
  user: UserProfile;
  isOwnProfile?: boolean;
  onFollow?: () => void;
  isFollowing?: boolean;
}

const achievementBadges = [
  { label: '🌟 Top Reviewer', gradient: 'from-yellow-400 to-orange-500' },
  { label: '🗺️ Globe Trotter', gradient: 'from-blue-400 to-purple-500' },
  { label: '💎 Hidden Gem Hunter', gradient: 'from-green-400 to-emerald-500' },
  { label: '📸 Photography Pro', gradient: 'from-pink-400 to-red-500' },
];

export function ProfileHeader({
  user,
  isOwnProfile = false,
  onFollow,
  isFollowing = false,
}: ProfileHeaderProps) {
  const avgRating = 4.8; // Mock

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Cover Photo */}
      <div className="h-64 relative">
        {user.coverImageUrl ? (
          <img
            src={user.coverImageUrl}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400" />
        )}

        {/* Bottom overlay with user info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
          <div className="flex items-end gap-6">
            {/* Avatar */}
            <img
              src={user.avatarUrl || ''}
              alt={user.name || 'User'}
              className="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover"
            />

            {/* Name & Bio */}
            <div className="flex-1 text-white mb-4">
              <h1 className="text-3xl font-bold mb-1">{user.name}</h1>
              <p className="text-lg opacity-90">@{user.username} • Pioneer since 2023</p>
              {user.bio && (
                <p className="mt-2">{user.bio}</p>
              )}
            </div>

            {/* Action button */}
            <div className="mb-4">
              {isOwnProfile ? (
                <Link href="/settings/profile">
                  <button className="bg-white text-purple-600 px-6 py-3 rounded-full font-bold hover:shadow-lg transition-all">
                    Edit Profile
                  </button>
                </Link>
              ) : (
                <GradientButton
                  onClick={onFollow}
                  variant={isFollowing ? 'outline' : 'primary'}
                  size="sm"
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </GradientButton>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 md:grid-cols-5 gap-4 p-6 border-b">
        <div className="stat-card rounded-xl p-4 text-center">
          <div className="text-3xl font-bold gradient-text-135">{user.reviewCount}</div>
          <div className="text-sm text-gray-600 mt-1">Reviews</div>
        </div>
        <div className="stat-card rounded-xl p-4 text-center">
          <div className="text-3xl font-bold gradient-text-135">{user.tripCount}</div>
          <div className="text-sm text-gray-600 mt-1">Trips</div>
        </div>
        <div className="stat-card rounded-xl p-4 text-center">
          <div className="text-3xl font-bold gradient-text-135">
            {user.followerCount >= 1000
              ? `${(user.followerCount / 1000).toFixed(1)}k`
              : user.followerCount}
          </div>
          <div className="text-sm text-gray-600 mt-1">Followers</div>
        </div>
        <div className="stat-card rounded-xl p-4 text-center hidden md:block">
          <div className="text-3xl font-bold gradient-text-135">{user.followingCount}</div>
          <div className="text-sm text-gray-600 mt-1">Following</div>
        </div>
        <div className="stat-card rounded-xl p-4 text-center hidden md:block">
          <div className="text-3xl font-bold gradient-text-135">{avgRating}</div>
          <div className="text-sm text-gray-600 mt-1">Avg Rating</div>
        </div>
      </div>

      {/* Achievement Badges */}
      <div className="p-6">
        <h3 className="font-bold text-xl mb-4 gradient-text-135">🏆 Achievements</h3>
        <div className="flex gap-4 flex-wrap">
          {achievementBadges.map((badge) => (
            <div
              key={badge.label}
              className={`animate-float bg-gradient-to-br ${badge.gradient} text-white px-4 py-2 rounded-full font-semibold shadow-lg`}
            >
              {badge.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
