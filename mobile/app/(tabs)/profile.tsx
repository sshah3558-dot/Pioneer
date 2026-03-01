import React, { useMemo } from 'react';
import { ScrollView, SafeAreaView, View, Text, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';
import ProfileHeader from '../../components/profile/ProfileHeader';
import MomentGrid from '../../components/profile/MomentGrid';
import { router } from 'expo-router';
import type { Moment, PaginatedResponse } from '../../../shared/types';

export default function ProfileScreen() {
  const { user } = useAuth();

  // Fetch user's posts for moment count + avg rating
  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ['myPosts'],
    queryFn: () =>
      api.get<PaginatedResponse<Moment>>('/api/posts?userId=me&pageSize=50'),
    enabled: !!user,
  });

  const momentCount = postsData?.total || 0;

  const avgRating = useMemo(() => {
    if (!postsData?.items) return null;
    const rated = postsData.items.filter(
      (m) => m.compositeScore != null
    );
    if (rated.length === 0) return null;
    const sum = rated.reduce((acc, m) => acc + (m.compositeScore || 0), 0);
    return sum / rated.length;
  }, [postsData]);

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-950">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#7C3AED" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-950">
      <ScrollView>
        <ProfileHeader
          user={user}
          momentCount={momentCount}
          avgRating={avgRating}
          isOwnProfile={true}
          onEditProfile={() => {
            router.push('/settings');
          }}
        />
        <MomentGrid userId="me" />
      </ScrollView>
    </SafeAreaView>
  );
}
