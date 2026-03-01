import { View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { MapPin, Heart, Calendar, Navigation } from 'lucide-react-native';
import { router } from 'expo-router';
import type { TripCard as TripCardType } from '../../../shared/types';
import UserAvatar from '../shared/UserAvatar';

function formatDateRange(start: string | null, end: string | null): string {
  if (!start) return 'Dates TBD';
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  if (!end) return fmt(start);
  const s = new Date(start);
  const e = new Date(end);
  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
    return `${fmt(start)} - ${e.getDate()}, ${e.getFullYear()}`;
  }
  return `${fmt(start)} - ${fmt(end)}, ${e.getFullYear()}`;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  PLANNING: { bg: 'bg-blue-500', text: 'text-white', label: 'Planning' },
  IN_PROGRESS: { bg: 'bg-green-500', text: 'text-white', label: 'In Progress' },
  COMPLETED: { bg: 'bg-gray-500', text: 'text-white', label: 'Completed' },
};

interface TripCardProps {
  trip: TripCardType;
}

export default function TripCard({ trip }: TripCardProps) {
  const status = STATUS_STYLES[trip.status] || STATUS_STYLES.PLANNING;

  return (
    <Pressable
      onPress={() => router.push(`/trips/${trip.id}`)}
      className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800"
    >
      {/* Cover image */}
      <View className="w-full aspect-[16/9] relative">
        {trip.coverImageUrl ? (
          <Image
            source={{ uri: trip.coverImageUrl }}
            className="w-full h-full bg-gray-100 dark:bg-gray-800"
            contentFit="cover"
          />
        ) : (
          <View className="w-full h-full bg-purple-600 dark:bg-purple-800 items-center justify-center">
            <Navigation size={32} color="#FFFFFF" />
          </View>
        )}

        {/* Status badge - top right */}
        <View className={`absolute top-3 right-3 ${status.bg} rounded-full px-3 py-1`}>
          <Text className={`${status.text} text-xs font-semibold`}>{status.label}</Text>
        </View>
      </View>

      {/* Content */}
      <View className="px-4 pt-3 pb-2">
        {/* Title */}
        <Text className="text-lg font-bold text-gray-900 dark:text-white" numberOfLines={1}>
          {trip.title}
        </Text>

        {/* Location */}
        <View className="flex-row items-center mt-1">
          <MapPin size={14} color="#9CA3AF" />
          <Text className="text-gray-500 dark:text-gray-400 text-sm ml-1" numberOfLines={1}>
            {trip.city.name}, {trip.city.country.name}
          </Text>
        </View>

        {/* Date range */}
        <View className="flex-row items-center mt-1">
          <Calendar size={14} color="#9CA3AF" />
          <Text className="text-gray-500 dark:text-gray-400 text-sm ml-1">
            {formatDateRange(trip.startDate, trip.endDate)}
          </Text>
        </View>
      </View>

      {/* Footer: stats + user */}
      <View className="flex-row items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800">
        {/* Stats */}
        <View className="flex-row items-center gap-4">
          <View className="flex-row items-center">
            <Navigation size={14} color="#7C3AED" />
            <Text className="text-gray-600 dark:text-gray-300 text-xs ml-1">
              {trip.stopCount} stop{trip.stopCount !== 1 ? 's' : ''}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Heart
              size={14}
              color={trip.isLiked ? '#EF4444' : '#9CA3AF'}
              fill={trip.isLiked ? '#EF4444' : 'none'}
            />
            <Text className="text-gray-600 dark:text-gray-300 text-xs ml-1">
              {trip.likeCount}
            </Text>
          </View>
        </View>

        {/* User */}
        <View className="flex-row items-center">
          <UserAvatar avatarUrl={trip.user.avatarUrl} name={trip.user.name} size={28} fontSize="text-[10px]" />
          <Text
            className="text-gray-700 dark:text-gray-300 text-xs font-medium ml-1.5"
            numberOfLines={1}
          >
            {trip.user.name || trip.user.username}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
