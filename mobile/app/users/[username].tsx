import React, { useMemo, useState, useCallback } from 'react';
import {
  ScrollView,
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';
import ProfileHeader from '../../components/profile/ProfileHeader';
import MomentGrid from '../../components/profile/MomentGrid';
import type { UserProfile, Moment, PaginatedResponse } from '../../../shared/types';

export default function UserProfileScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  const isOwnProfile = currentUser?.username === username;

  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['userProfile', username],
    queryFn: () => api.get<UserProfile>(`/api/users/${username}`),
    enabled: !!username,
  });

  // Fetch user's moments for count + avg rating
  const { data: postsData } = useQuery({
    queryKey: ['userMoments', user?.id],
    queryFn: () =>
      api.get<PaginatedResponse<Moment>>(
        `/api/posts?userId=${encodeURIComponent(user!.id)}&pageSize=50`
      ),
    enabled: !!user?.id,
  });

  const momentCount = postsData?.total || 0;

  const avgRating = useMemo(() => {
    if (!postsData?.items) return null;
    const rated = postsData.items.filter((m) => m.compositeScore != null);
    if (rated.length === 0) return null;
    const sum = rated.reduce((acc, m) => acc + (m.compositeScore || 0), 0);
    return sum / rated.length;
  }, [postsData]);

  const [isFollowing, setIsFollowing] = useState<boolean | undefined>(undefined);

  // Derive effective following state: local override or server value
  const effectiveFollowing = isFollowing ?? user?.isFollowing ?? false;

  const followMutation = useMutation({
    mutationFn: async () => {
      if (!user) return;
      if (effectiveFollowing) {
        await api.delete(`/api/follow?targetUserId=${user.id}`);
      } else {
        await api.post('/api/follow', { targetUserId: user.id });
      }
    },
    onMutate: () => {
      const previous = effectiveFollowing;
      setIsFollowing(!effectiveFollowing);
      return { previous };
    },
    onError: (_err: unknown, _vars: void, context: { previous: boolean } | undefined) => {
      if (context?.previous !== undefined) {
        setIsFollowing(context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile', username] });
    },
  });

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-950">
        <View className="flex-row items-center px-4 py-3">
          <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
            <ArrowLeft size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#7C3AED" />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !user) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-950">
        <View className="flex-row items-center px-4 py-3">
          <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
            <ArrowLeft size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>
        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-gray-500 dark:text-gray-400 text-center">
            Could not load this profile.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // If it's own profile, redirect to the tabs profile
  if (isOwnProfile) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-950">
        <View className="flex-row items-center px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
            <ArrowLeft size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-gray-900 dark:text-white ml-4">
            @{user.username}
          </Text>
        </View>
        <ScrollView>
          <ProfileHeader
            user={user}
            momentCount={momentCount}
            avgRating={avgRating}
            isOwnProfile={true}
            onEditProfile={() => router.push('/settings/profile')}
          />
          <MomentGrid userId={user.id} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-950">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={24} color="#6B7280" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900 dark:text-white ml-4">
          @{user.username}
        </Text>
      </View>

      <ScrollView>
        <ProfileHeader
          user={user}
          momentCount={momentCount}
          avgRating={avgRating}
          isOwnProfile={false}
          isFollowing={effectiveFollowing}
          onFollow={() => followMutation.mutate()}
        />
        <MomentGrid userId={user.id} />
      </ScrollView>
    </SafeAreaView>
  );
}
