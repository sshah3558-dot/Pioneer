import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import {
  ScrollView,
  View,
  Text,
  Pressable,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Image } from 'expo-image';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Navigation,
  Heart,
  Globe,
  Lock,
} from 'lucide-react-native';
import { api } from '../../lib/api';
import type { TripCard as TripCardType } from '../../../shared/types';

interface TripStop {
  id: string;
  dayNumber: number | null;
  notes: string | null;
  place: {
    id: string;
    name: string;
    imageUrl: string | null;
  };
}

interface TripDetail extends TripCardType {
  description: string | null;
  isPublic: boolean;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'TBD';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDateRange(start: string | null, end: string | null): string {
  if (!start) return 'Dates TBD';
  if (!end) return formatDate(start);
  return `${formatDate(start)} - ${formatDate(end)}`;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  PLANNING: { bg: 'bg-blue-500', text: 'text-white', label: 'Planning' },
  IN_PROGRESS: { bg: 'bg-green-500', text: 'text-white', label: 'In Progress' },
  COMPLETED: { bg: 'bg-gray-500', text: 'text-white', label: 'Completed' },
};

function StopItem({ stop, isLast }: { stop: TripStop; isLast: boolean }) {
  return (
    <View className="flex-row">
      {/* Timeline indicator */}
      <View className="items-center mr-3">
        <View className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 items-center justify-center">
          <Text className="text-purple-600 dark:text-purple-400 text-xs font-bold">
            {stop.dayNumber ?? '-'}
          </Text>
        </View>
        {!isLast && (
          <View className="w-0.5 flex-1 bg-purple-200 dark:bg-purple-800 my-1" />
        )}
      </View>

      {/* Stop content */}
      <View className={`flex-1 bg-white dark:bg-gray-900 rounded-xl p-3 border border-gray-100 dark:border-gray-800 ${isLast ? '' : 'mb-3'}`}>
        <View className="flex-row items-center">
          {stop.place.imageUrl ? (
            <Image
              source={{ uri: stop.place.imageUrl }}
              className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700"
              contentFit="cover"
            />
          ) : (
            <View className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 items-center justify-center">
              <MapPin size={16} color="#9CA3AF" />
            </View>
          )}
          <View className="ml-3 flex-1">
            <Text className="text-sm font-semibold text-gray-900 dark:text-white" numberOfLines={1}>
              {stop.place.name}
            </Text>
            {stop.dayNumber != null && (
              <Text className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Day {stop.dayNumber}
              </Text>
            )}
          </View>
        </View>
        {stop.notes && (
          <Text className="text-sm text-gray-600 dark:text-gray-300 mt-2 leading-5">
            {stop.notes}
          </Text>
        )}
      </View>
    </View>
  );
}

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const {
    data: trip,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ['trip', id],
    queryFn: () => api.get<TripDetail>(`/api/trips/${id}`),
    enabled: !!id,
  });

  const { data: stopsData, isLoading: stopsLoading } = useQuery({
    queryKey: ['tripStops', id],
    queryFn: () => api.get<{ items: TripStop[] }>(`/api/trips/${id}/stops`),
    enabled: !!id,
  });

  const stops = stopsData?.items || [];
  const status = trip ? (STATUS_STYLES[trip.status] || STATUS_STYLES.PLANNING) : STATUS_STYLES.PLANNING;

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <Pressable onPress={() => router.back()} hitSlop={8} className="mr-3">
          <ArrowLeft size={24} color="#374151" />
        </Pressable>
        <Text
          className="text-lg font-bold text-gray-900 dark:text-white flex-1"
          numberOfLines={1}
        >
          {trip?.title || 'Trip Details'}
        </Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#7C3AED" />
          <Text className="text-gray-500 dark:text-gray-400 mt-3 text-sm">Loading trip...</Text>
        </View>
      ) : !trip ? (
        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-gray-500 dark:text-gray-400 text-lg">Trip not found</Text>
          <Pressable onPress={() => router.back()} className="mt-4">
            <Text className="text-purple-600 font-semibold">Go Back</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor="#7C3AED"
              colors={['#7C3AED']}
            />
          }
        >
          {/* Cover image */}
          <View className="w-full aspect-[16/9]">
            {trip.coverImageUrl ? (
              <Image
                source={{ uri: trip.coverImageUrl }}
                className="w-full h-full bg-gray-200 dark:bg-gray-800"
                contentFit="cover"
              />
            ) : (
              <View className="w-full h-full bg-purple-600 dark:bg-purple-800 items-center justify-center">
                <Navigation size={48} color="#FFFFFF" />
              </View>
            )}
          </View>

          {/* Trip info */}
          <View className="px-4 pt-4 pb-3">
            {/* Status + visibility */}
            <View className="flex-row items-center gap-2 mb-2">
              <View className={`${status.bg} rounded-full px-3 py-1`}>
                <Text className={`${status.text} text-xs font-semibold`}>{status.label}</Text>
              </View>
              <View className="flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1">
                {trip.isPublic ? (
                  <Globe size={12} color="#6B7280" />
                ) : (
                  <Lock size={12} color="#6B7280" />
                )}
                <Text className="text-gray-600 dark:text-gray-400 text-xs ml-1">
                  {trip.isPublic ? 'Public' : 'Private'}
                </Text>
              </View>
            </View>

            {/* Title */}
            <Text className="text-2xl font-bold text-gray-900 dark:text-white">
              {trip.title}
            </Text>

            {/* Location */}
            <View className="flex-row items-center mt-2">
              <MapPin size={16} color="#7C3AED" />
              <Text className="text-purple-600 dark:text-purple-400 text-sm font-medium ml-1.5">
                {trip.city.name}, {trip.city.country.name}
              </Text>
            </View>

            {/* Dates */}
            <View className="flex-row items-center mt-1.5">
              <Calendar size={16} color="#9CA3AF" />
              <Text className="text-gray-500 dark:text-gray-400 text-sm ml-1.5">
                {formatDateRange(trip.startDate, trip.endDate)}
              </Text>
            </View>

            {/* Stats row */}
            <View className="flex-row items-center gap-4 mt-3">
              <View className="flex-row items-center">
                <Navigation size={14} color="#7C3AED" />
                <Text className="text-gray-600 dark:text-gray-300 text-sm ml-1">
                  {trip.stopCount} stop{trip.stopCount !== 1 ? 's' : ''}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Heart
                  size={14}
                  color={trip.isLiked ? '#EF4444' : '#9CA3AF'}
                  fill={trip.isLiked ? '#EF4444' : 'none'}
                />
                <Text className="text-gray-600 dark:text-gray-300 text-sm ml-1">
                  {trip.likeCount} like{trip.likeCount !== 1 ? 's' : ''}
                </Text>
              </View>
            </View>

            {/* Description */}
            {trip.description && (
              <Text className="text-gray-700 dark:text-gray-300 text-sm leading-5 mt-4">
                {trip.description}
              </Text>
            )}

            {/* User */}
            <View className="flex-row items-center mt-4 pt-3 border-t border-gray-200 dark:border-gray-800">
              {trip.user.avatarUrl ? (
                <Image
                  source={{ uri: trip.user.avatarUrl }}
                  className="w-8 h-8 rounded-full bg-gray-200"
                  contentFit="cover"
                />
              ) : (
                <View className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 items-center justify-center">
                  <Text className="text-purple-600 dark:text-purple-300 font-bold text-xs">
                    {(trip.user.name || '?')[0].toUpperCase()}
                  </Text>
                </View>
              )}
              <View className="ml-2">
                <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                  {trip.user.name || trip.user.username}
                </Text>
                {trip.user.username && (
                  <Text className="text-xs text-gray-500 dark:text-gray-400">
                    @{trip.user.username}
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Stops section */}
          <View className="px-4 pb-8 mt-2">
            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Stops ({stops.length})
            </Text>

            {stopsLoading ? (
              <View className="items-center py-8">
                <ActivityIndicator size="small" color="#7C3AED" />
                <Text className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                  Loading stops...
                </Text>
              </View>
            ) : stops.length === 0 ? (
              <View className="items-center py-8 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                <MapPin size={24} color="#9CA3AF" />
                <Text className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                  No stops added yet
                </Text>
              </View>
            ) : (
              stops.map((stop, index) => (
                <StopItem
                  key={stop.id}
                  stop={stop}
                  isLast={index === stops.length - 1}
                />
              ))
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
