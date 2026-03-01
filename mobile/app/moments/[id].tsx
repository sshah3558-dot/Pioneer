import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Heart,
  Eye,
  Bookmark,
  MapPin,
  Star,
} from 'lucide-react-native';
import { api } from '../../lib/api';
import type { Moment } from '../../../shared/types';

const SCREEN_WIDTH = Dimensions.get('window').width;

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function scoreBadgeColor(score: number): string {
  if (score >= 8) return 'bg-green-500';
  if (score >= 6) return 'bg-lime-500';
  if (score >= 4) return 'bg-amber-500';
  return 'bg-red-500';
}

function RatingRow({ label, rating }: { label: string; rating: number | null }) {
  if (rating == null) return null;
  return (
    <View className="flex-row items-center justify-between py-2">
      <Text className="text-sm text-gray-600 dark:text-gray-400">{label}</Text>
      <View className="flex-row items-center gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={14}
            color={i <= rating ? '#FBBF24' : '#D1D5DB'}
            fill={i <= rating ? '#FBBF24' : 'transparent'}
          />
        ))}
        <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
          {rating.toFixed(1)}
        </Text>
      </View>
    </View>
  );
}

function ImageCarousel({ images }: { images: string[] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offset = event.nativeEvent.contentOffset.x;
      const index = Math.round(offset / SCREEN_WIDTH);
      setActiveIndex(index);
    },
    []
  );

  if (images.length === 0) return null;

  if (images.length === 1) {
    return (
      <Image
        source={{ uri: images[0] }}
        style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH }}
        contentFit="cover"
      />
    );
  }

  return (
    <View>
      <FlatList
        data={images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => (
          <Image
            source={{ uri: item }}
            style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH }}
            contentFit="cover"
          />
        )}
      />
      {/* Page indicators */}
      <View className="flex-row justify-center gap-1.5 mt-3">
        {images.map((_, i) => (
          <View
            key={i}
            className={`w-2 h-2 rounded-full ${
              i === activeIndex ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          />
        ))}
      </View>
    </View>
  );
}

export default function MomentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: moment, isLoading, error } = useQuery({
    queryKey: ['moment', id],
    queryFn: () => api.get<Moment>(`/api/posts/${id}`),
    enabled: !!id,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!moment) return;
      if (moment.isSaved) {
        await api.delete(`/api/posts/${id}/save`);
      } else {
        await api.post(`/api/posts/${id}/save`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moment', id] });
    },
  });

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-950">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#7C3AED" />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !moment) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-950">
        <View className="flex-row items-center px-4 py-3">
          <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
            <ArrowLeft size={24} color="#111827" />
          </TouchableOpacity>
        </View>
        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-gray-500 dark:text-gray-400 text-center">
            Could not load this moment.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const images = [moment.imageUrl, moment.imageUrl2, moment.imageUrl3].filter(
    (url): url is string => !!url
  );

  const hasRatings =
    moment.overallRating != null ||
    moment.valueRating != null ||
    moment.authenticityRating != null ||
    moment.crowdRating != null;

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-950">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={24} color="#6B7280" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900 dark:text-white ml-4 flex-1">
          Moment
        </Text>
        <TouchableOpacity
          onPress={() => saveMutation.mutate()}
          hitSlop={8}
          disabled={saveMutation.isPending}
        >
          <Bookmark
            size={22}
            color={moment.isSaved ? '#7C3AED' : '#6B7280'}
            fill={moment.isSaved ? '#7C3AED' : 'transparent'}
          />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1">
        {/* User Info */}
        <View className="flex-row items-center px-4 py-3">
          <TouchableOpacity
            className="flex-row items-center flex-1"
            onPress={() => {
              if (moment.user.username) {
                router.push(`/users/${moment.user.username}`);
              }
            }}
            activeOpacity={0.7}
          >
            {moment.user.avatarUrl ? (
              <Image
                source={{ uri: moment.user.avatarUrl }}
                className="w-11 h-11 rounded-full bg-gray-200"
                contentFit="cover"
              />
            ) : (
              <View className="w-11 h-11 rounded-full bg-purple-100 dark:bg-purple-900 items-center justify-center">
                <Text className="text-purple-600 dark:text-purple-300 font-bold text-base">
                  {(moment.user.name || '?')[0].toUpperCase()}
                </Text>
              </View>
            )}
            <View className="ml-3 flex-1">
              <Text className="font-semibold text-gray-900 dark:text-white text-sm">
                {moment.user.name || moment.user.username}
              </Text>
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                {timeAgo(moment.createdAt)}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Composite score badge */}
          {moment.compositeScore != null && (
            <View
              className={`${scoreBadgeColor(moment.compositeScore)} rounded-full px-3 py-1.5`}
            >
              <Text className="text-white text-sm font-bold">
                {moment.compositeScore.toFixed(1)}
              </Text>
            </View>
          )}
        </View>

        {/* Images */}
        {images.length > 0 && <ImageCarousel images={images} />}

        {/* Content */}
        {moment.content ? (
          <Text className="px-4 pt-4 pb-2 text-base text-gray-800 dark:text-gray-200 leading-6">
            {moment.content}
          </Text>
        ) : null}

        {/* Place Info */}
        {moment.place && (
          <View className="flex-row items-center px-4 py-3">
            <MapPin size={16} color="#7C3AED" />
            <Text className="text-sm text-purple-600 dark:text-purple-400 font-medium ml-1.5">
              {moment.place.name}
            </Text>
            {(moment.place.cityName || moment.place.countryName) && (
              <Text className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                {[moment.place.cityName, moment.place.countryName].filter(Boolean).join(', ')}
              </Text>
            )}
          </View>
        )}

        {/* Stats Row */}
        <View className="flex-row items-center gap-5 px-4 py-2">
          <View className="flex-row items-center">
            <Heart size={16} color="#9CA3AF" />
            <Text className="text-sm text-gray-500 dark:text-gray-400 ml-1.5">
              {moment.likeCount} {moment.likeCount === 1 ? 'like' : 'likes'}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Eye size={16} color="#9CA3AF" />
            <Text className="text-sm text-gray-500 dark:text-gray-400 ml-1.5">
              {moment.viewCount} {moment.viewCount === 1 ? 'view' : 'views'}
            </Text>
          </View>
        </View>

        {/* Ratings Section */}
        {hasRatings && (
          <View className="mx-4 mt-3 mb-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
            <Text className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Ratings
            </Text>
            <RatingRow label="Overall" rating={moment.overallRating} />
            <RatingRow label="Value" rating={moment.valueRating} />
            <RatingRow label="Authenticity" rating={moment.authenticityRating} />
            <RatingRow label="Crowd Level" rating={moment.crowdRating} />
          </View>
        )}

        {/* Bottom spacing */}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
