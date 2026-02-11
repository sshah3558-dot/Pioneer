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

  const joinYear = new Date(user.createdAt).getFullYear();

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Cover Photo */}
      <div className="h-36 sm:h-48 md:h-64 relative">
        {user.coverImageUrl ? (
          <img
            src={user.coverImageUrl}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400" />
        )}
      </div>

      {/* Profile info below cover */}
      <div className="px-4 sm:px-6 pb-4">
        {/* Avatar + Action button row */}
        <div className="flex items-end justify-between -mt-12 sm:-mt-16 mb-3">
          <img
            src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}&background=667eea&color=fff&size=128`}
            alt={user.name || 'User'}
            className="w-20 h-20 sm:w-28 sm:h-28 rounded-full border-4 border-white shadow-xl object-cover"
          />
          <div className="mb-1">
            {isOwnProfile ? (
              <Link href="/settings/profile">
                <button className="bg-white text-purple-600 px-4 py-2 sm:px-6 sm:py-3 rounded-full text-sm sm:text-base font-bold border-2 border-purple-200 hover:shadow-lg transition-all">
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

        {/* Name & Bio */}
        <div className="mb-4">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">{user.name}</h1>
          <p className="text-sm sm:text-base text-gray-500">@{user.username} &middot; Pioneer since {joinYear}</p>
          {user.bio && (
            <p className="mt-2 text-sm sm:text-base text-gray-700">{user.bio}</p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 md:grid-cols-5 gap-2 sm:gap-4 px-4 sm:px-6 pb-4 border-b">
        <div className="stat-card rounded-xl p-2 sm:p-4 text-center">
          <div className="text-xl sm:text-2xl md:text-3xl font-bold gradient-text-135">{user.reviewCount}</div>
          <div className="text-xs sm:text-sm text-gray-600 mt-1">Reviews</div>
        </div>
        <div className="stat-card rounded-xl p-2 sm:p-4 text-center">
          <div className="text-xl sm:text-2xl md:text-3xl font-bold gradient-text-135">{user.tripCount}</div>
          <div className="text-xs sm:text-sm text-gray-600 mt-1">Trips</div>
        </div>
        <div className="stat-card rounded-xl p-2 sm:p-4 text-center">
          <div className="text-xl sm:text-2xl md:text-3xl font-bold gradient-text-135">
            {user.followerCount >= 1000
              ? `${(user.followerCount / 1000).toFixed(1)}k`
              : user.followerCount}
          </div>
          <div className="text-xs sm:text-sm text-gray-600 mt-1">Followers</div>
        </div>
        <div className="stat-card rounded-xl p-2 sm:p-4 text-center hidden md:block">
          <div className="text-xl sm:text-2xl md:text-3xl font-bold gradient-text-135">{user.followingCount}</div>
          <div className="text-xs sm:text-sm text-gray-600 mt-1">Following</div>
        </div>
        <div className="stat-card rounded-xl p-2 sm:p-4 text-center hidden md:block">
          <div className="text-xl sm:text-2xl md:text-3xl font-bold gradient-text-135">{avgRating}</div>
          <div className="text-xs sm:text-sm text-gray-600 mt-1">Avg Rating</div>
        </div>
      </div>

      {/* Achievement Badges */}
      <div className="px-4 sm:px-6 py-4">
        <h3 className="font-bold text-lg sm:text-xl mb-3 gradient-text-135">Achievements</h3>
        <div className="flex gap-2 sm:gap-3 flex-wrap">
          {achievementBadges.map((badge) => (
            <div
              key={badge.label}
              className={`animate-float bg-gradient-to-br ${badge.gradient} text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold shadow-lg`}
            >
              {badge.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
