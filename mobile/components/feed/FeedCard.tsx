import { View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Heart, Star, MapPin, UserPlus, Plane } from 'lucide-react-native';
import type { FeedItem } from '../../../shared/types';

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

function UserAvatar({ avatarUrl, name }: { avatarUrl: string | null; name: string | null }) {
  if (avatarUrl) {
    return (
      <Image
        source={{ uri: avatarUrl }}
        className="w-10 h-10 rounded-full bg-gray-200"
        contentFit="cover"
      />
    );
  }
  return (
    <View className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 items-center justify-center">
      <Text className="text-purple-600 dark:text-purple-300 font-bold text-sm">
        {(name || '?')[0].toUpperCase()}
      </Text>
    </View>
  );
}

function PostCard({ item }: { item: FeedItem }) {
  const post = item.post;
  if (!post) return null;

  return (
    <View className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800">
      {/* Header */}
      <View className="flex-row items-center px-4 pt-4 pb-2">
        <UserAvatar avatarUrl={post.user.avatarUrl} name={post.user.name} />
        <View className="ml-3 flex-1">
          <Text className="font-semibold text-gray-900 dark:text-white text-sm">
            {post.user.name || post.user.username}
          </Text>
          {post.place && (
            <View className="flex-row items-center mt-0.5">
              <MapPin size={12} color="#9CA3AF" />
              <Text className="text-gray-500 dark:text-gray-400 text-xs ml-1">
                {post.place.name}{post.place.cityName ? `, ${post.place.cityName}` : ''}
              </Text>
            </View>
          )}
        </View>
        <Text className="text-gray-400 dark:text-gray-500 text-xs">{timeAgo(post.createdAt)}</Text>
      </View>

      {/* Content */}
      {post.content ? (
        <Text
          className="px-4 pb-3 text-gray-800 dark:text-gray-200 text-sm leading-5"
          numberOfLines={4}
        >
          {post.content}
        </Text>
      ) : null}

      {/* Image */}
      {post.imageUrl && (
        <Image
          source={{ uri: post.imageUrl }}
          className="w-full aspect-[4/3] bg-gray-100 dark:bg-gray-800"
          contentFit="cover"
        />
      )}

      {/* Footer */}
      <View className="flex-row items-center px-4 py-3">
        {post.compositeScore != null && (
          <View className={`${scoreBadgeColor(post.compositeScore)} rounded-full px-2 py-0.5 mr-3`}>
            <Text className="text-white text-xs font-bold">{post.compositeScore.toFixed(1)}</Text>
          </View>
        )}
        <View className="flex-row items-center">
          <Heart size={16} color="#9CA3AF" />
          <Text className="text-gray-500 dark:text-gray-400 text-xs ml-1">{post.likeCount}</Text>
        </View>
      </View>
    </View>
  );
}

function TripCard({ item }: { item: FeedItem }) {
  const trip = item.trip;
  if (!trip) return null;

  const statusText =
    trip.status === 'COMPLETED'
      ? 'completed a trip'
      : trip.status === 'IN_PROGRESS'
        ? 'is traveling in'
        : 'is planning a trip to';

  return (
    <View className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800">
      <View className="flex-row items-center px-4 pt-4 pb-3">
        <UserAvatar avatarUrl={trip.user.avatarUrl} name={trip.user.name} />
        <View className="ml-3 flex-1">
          <Text className="text-gray-800 dark:text-gray-200 text-sm">
            <Text className="font-semibold text-gray-900 dark:text-white">
              {trip.user.name || trip.user.username}
            </Text>
            {' '}{statusText}{' '}
            <Text className="font-semibold text-purple-600 dark:text-purple-400">
              {trip.city.name}
            </Text>
          </Text>
        </View>
        <Text className="text-gray-400 dark:text-gray-500 text-xs">{timeAgo(item.createdAt)}</Text>
      </View>

      {trip.coverImageUrl && (
        <Image
          source={{ uri: trip.coverImageUrl }}
          className="w-full aspect-[16/9] bg-gray-100 dark:bg-gray-800"
          contentFit="cover"
        />
      )}

      <View className="px-4 py-3">
        <View className="flex-row items-center">
          <Plane size={14} color="#7C3AED" />
          <Text className="font-semibold text-gray-900 dark:text-white text-sm ml-2">
            {trip.title}
          </Text>
        </View>
        <Text className="text-gray-500 dark:text-gray-400 text-xs mt-1">
          {trip.stopCount} stops {trip.city.country?.name ? `in ${trip.city.country.name}` : ''}
        </Text>
      </View>
    </View>
  );
}

function FollowCard({ item }: { item: FeedItem }) {
  const follow = item.follow;
  if (!follow) return null;

  return (
    <View className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 px-4 py-4">
      <View className="flex-row items-center">
        <UserPlus size={16} color="#7C3AED" />
        <View className="flex-row items-center ml-3 flex-1">
          <UserAvatar avatarUrl={follow.follower.avatarUrl} name={follow.follower.name} />
          <View className="ml-2 flex-1">
            <Text className="text-gray-800 dark:text-gray-200 text-sm">
              <Text className="font-semibold text-gray-900 dark:text-white">
                {follow.follower.name || follow.follower.username}
              </Text>
              {' '}started following{' '}
              <Text className="font-semibold text-gray-900 dark:text-white">
                {follow.following.name || follow.following.username}
              </Text>
            </Text>
          </View>
        </View>
        <Text className="text-gray-400 dark:text-gray-500 text-xs">{timeAgo(item.createdAt)}</Text>
      </View>
    </View>
  );
}

function ReviewCardComponent({ item }: { item: FeedItem }) {
  const review = item.review;
  if (!review) return null;

  return (
    <View className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800">
      <View className="flex-row items-center px-4 pt-4 pb-2">
        <UserAvatar avatarUrl={review.user.avatarUrl} name={review.user.name} />
        <View className="ml-3 flex-1">
          <Text className="text-gray-800 dark:text-gray-200 text-sm">
            <Text className="font-semibold text-gray-900 dark:text-white">
              {review.user.name || review.user.username}
            </Text>
            {review.place ? (
              <>
                {' '}reviewed{' '}
                <Text className="font-semibold text-purple-600 dark:text-purple-400">
                  {review.place.name}
                </Text>
              </>
            ) : (
              ' wrote a review'
            )}
          </Text>
        </View>
        <Text className="text-gray-400 dark:text-gray-500 text-xs">{timeAgo(review.createdAt)}</Text>
      </View>

      {/* Star rating */}
      <View className="flex-row items-center px-4 pb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={14}
            color={i < review.overallRating ? '#F59E0B' : '#D1D5DB'}
            fill={i < review.overallRating ? '#F59E0B' : 'none'}
          />
        ))}
        {review.title && (
          <Text className="text-gray-900 dark:text-white text-sm font-medium ml-2" numberOfLines={1}>
            {review.title}
          </Text>
        )}
      </View>

      {/* Content snippet */}
      {review.content ? (
        <Text
          className="px-4 pb-3 text-gray-700 dark:text-gray-300 text-sm leading-5"
          numberOfLines={3}
        >
          {review.content}
        </Text>
      ) : null}

      {/* Footer */}
      <View className="flex-row items-center px-4 py-3 border-t border-gray-100 dark:border-gray-800">
        <Heart size={14} color="#9CA3AF" />
        <Text className="text-gray-500 dark:text-gray-400 text-xs ml-1">{review.likeCount}</Text>
        {review.photoCount > 0 && (
          <Text className="text-gray-400 dark:text-gray-500 text-xs ml-3">
            {review.photoCount} photo{review.photoCount > 1 ? 's' : ''}
          </Text>
        )}
      </View>
    </View>
  );
}

export default function FeedCard({ item }: { item: FeedItem }) {
  switch (item.type) {
    case 'post':
      return <PostCard item={item} />;
    case 'trip':
      return <TripCard item={item} />;
    case 'follow':
      return <FollowCard item={item} />;
    case 'review':
      return <ReviewCardComponent item={item} />;
    default:
      return null;
  }
}
