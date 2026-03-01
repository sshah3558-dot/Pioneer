import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import {
  Award,
  Globe,
  BookOpen,
  Users,
  UserPlus,
  UserCheck,
  Settings,
} from 'lucide-react-native';
import type { UserProfile } from '../../../shared/types';

interface ProfileHeaderProps {
  user: UserProfile;
  momentCount?: number;
  avgRating?: number | null;
  isOwnProfile?: boolean;
  isFollowing?: boolean;
  onFollow?: () => void;
  onEditProfile?: () => void;
}

interface Badge {
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

function getBadges(user: UserProfile, momentCount: number): Badge[] {
  const badges: Badge[] = [];

  if (user.reviewCount >= 10) {
    badges.push({
      label: 'Top Reviewer',
      icon: <Award size={12} color="#F59E0B" />,
      color: '#F59E0B',
      bgColor: 'rgba(245, 158, 11, 0.1)',
    });
  }

  if (user.tripCount >= 5) {
    badges.push({
      label: 'Globe Trotter',
      icon: <Globe size={12} color="#3B82F6" />,
      color: '#3B82F6',
      bgColor: 'rgba(59, 130, 246, 0.1)',
    });
  }

  if (momentCount >= 10) {
    badges.push({
      label: 'Storyteller',
      icon: <BookOpen size={12} color="#8B5CF6" />,
      color: '#8B5CF6',
      bgColor: 'rgba(139, 92, 246, 0.1)',
    });
  }

  if (user.followerCount >= 100) {
    badges.push({
      label: 'Influencer',
      icon: <Users size={12} color="#EC4899" />,
      color: '#EC4899',
      bgColor: 'rgba(236, 72, 153, 0.1)',
    });
  }

  return badges;
}

export default function ProfileHeader({
  user,
  momentCount = 0,
  avgRating,
  isOwnProfile = false,
  isFollowing = false,
  onFollow,
  onEditProfile,
}: ProfileHeaderProps) {
  const badges = getBadges(user, momentCount);

  return (
    <View>
      {/* Cover Image */}
      <View className="h-[140px] w-full">
        {user.coverImageUrl ? (
          <Image
            source={{ uri: user.coverImageUrl }}
            style={{ width: '100%', height: 140 }}
            contentFit="cover"
          />
        ) : (
          <View className="flex-1 bg-purple-600" />
        )}
      </View>

      {/* Avatar */}
      <View className="items-center -mt-12">
        <View className="rounded-full border-4 border-white dark:border-gray-950 overflow-hidden">
          {user.avatarUrl ? (
            <Image
              source={{ uri: user.avatarUrl }}
              style={{ width: 88, height: 88, borderRadius: 44 }}
              contentFit="cover"
            />
          ) : (
            <View className="w-[88px] h-[88px] rounded-full bg-purple-200 dark:bg-purple-800 items-center justify-center">
              <Text className="text-3xl font-bold text-purple-600 dark:text-purple-300">
                {(user.name || user.username || '?')[0].toUpperCase()}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Name & Username */}
      <View className="items-center mt-2 px-4">
        <Text className="text-xl font-bold text-gray-900 dark:text-white">
          {user.name || 'Unnamed User'}
        </Text>
        {user.username ? (
          <Text className="text-sm text-gray-500 dark:text-gray-400">
            @{user.username}
          </Text>
        ) : null}
      </View>

      {/* Bio */}
      {user.bio ? (
        <Text className="text-sm text-gray-600 dark:text-gray-400 text-center px-8 mt-2">
          {user.bio}
        </Text>
      ) : null}

      {/* Stats Row */}
      <View className="flex-row justify-center gap-6 mt-4 px-4">
        <StatItem value={user.reviewCount} label="Reviews" />
        <StatItem value={momentCount} label="Moments" />
        <StatItem value={user.followerCount} label="Followers" />
        <StatItem value={user.followingCount} label="Following" />
        {avgRating != null ? (
          <StatItem value={avgRating.toFixed(1)} label="Avg Rating" />
        ) : null}
      </View>

      {/* Action Button */}
      <View className="px-4 mt-4">
        {isOwnProfile ? (
          <TouchableOpacity
            className="border border-gray-300 dark:border-gray-600 rounded-xl py-2.5 items-center flex-row justify-center gap-2"
            onPress={onEditProfile}
            activeOpacity={0.7}
          >
            <Settings size={16} color="#6B7280" />
            <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Edit Profile
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            className={`rounded-xl py-2.5 items-center flex-row justify-center gap-2 ${
              isFollowing
                ? 'border border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/30'
                : 'bg-purple-600'
            }`}
            onPress={onFollow}
            activeOpacity={0.7}
          >
            {isFollowing ? (
              <>
                <UserCheck size={16} color="#7C3AED" />
                <Text className="text-sm font-semibold text-purple-600 dark:text-purple-300">
                  Following
                </Text>
              </>
            ) : (
              <>
                <UserPlus size={16} color="#fff" />
                <Text className="text-sm font-semibold text-white">Follow</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Achievement Badges */}
      {badges.length > 0 ? (
        <View className="flex-row flex-wrap justify-center gap-2 mt-4 px-4">
          {badges.map((badge) => (
            <View
              key={badge.label}
              className="flex-row items-center gap-1 px-2.5 py-1.5 rounded-full"
              style={{ backgroundColor: badge.bgColor }}
            >
              {badge.icon}
              <Text className="text-xs font-medium" style={{ color: badge.color }}>
                {badge.label}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {/* Divider */}
      <View className="h-px bg-gray-200 dark:bg-gray-800 mt-4" />
    </View>
  );
}

function StatItem({ value, label }: { value: number | string; label: string }) {
  return (
    <View className="items-center">
      <Text className="text-base font-bold text-gray-900 dark:text-white">
        {typeof value === 'number' && value >= 1000
          ? `${(value / 1000).toFixed(1)}k`
          : value}
      </Text>
      <Text className="text-xs text-gray-500 dark:text-gray-400">{label}</Text>
    </View>
  );
}
