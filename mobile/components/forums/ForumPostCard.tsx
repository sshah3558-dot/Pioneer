import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { MessageCircle, Eye, Pin } from 'lucide-react-native';
import type { ForumPostItem } from '../../../shared/types';

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

interface ForumPostCardProps {
  post: ForumPostItem;
  onPress?: () => void;
}

export default function ForumPostCard({ post, onPress }: ForumPostCardProps) {
  return (
    <TouchableOpacity
      className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-3.5"
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Pinned indicator */}
      {post.isPinned && (
        <View className="flex-row items-center mb-1.5">
          <Pin size={12} color="#7C3AED" />
          <Text className="text-xs font-medium text-purple-600 dark:text-purple-400 ml-1">
            Pinned
          </Text>
        </View>
      )}

      {/* Title */}
      <Text
        className="text-base font-semibold text-gray-900 dark:text-white leading-5"
        numberOfLines={2}
      >
        {post.title}
      </Text>

      {/* User + time */}
      <View className="flex-row items-center mt-2">
        {post.user.avatarUrl ? (
          <Image
            source={{ uri: post.user.avatarUrl }}
            className="w-5 h-5 rounded-full bg-gray-200"
            contentFit="cover"
          />
        ) : (
          <View className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900 items-center justify-center">
            <Text className="text-purple-600 dark:text-purple-300 font-bold text-[9px]">
              {(post.user.name || '?')[0].toUpperCase()}
            </Text>
          </View>
        )}
        <Text className="text-xs text-gray-500 dark:text-gray-400 ml-1.5">
          {post.user.name || post.user.username}
        </Text>
        <Text className="text-xs text-gray-400 dark:text-gray-500 mx-1">·</Text>
        <Text className="text-xs text-gray-400 dark:text-gray-500">
          {timeAgo(post.createdAt)}
        </Text>
      </View>

      {/* Content preview */}
      <Text
        className="text-sm text-gray-600 dark:text-gray-400 mt-2 leading-5"
        numberOfLines={3}
      >
        {post.content}
      </Text>

      {/* Meta stats */}
      <View className="flex-row items-center gap-4 mt-2.5">
        <View className="flex-row items-center">
          <MessageCircle size={14} color="#9CA3AF" />
          <Text className="text-xs text-gray-500 dark:text-gray-400 ml-1">
            {post.commentCount}
          </Text>
        </View>
        <View className="flex-row items-center">
          <Eye size={14} color="#9CA3AF" />
          <Text className="text-xs text-gray-500 dark:text-gray-400 ml-1">
            {post.viewCount}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
