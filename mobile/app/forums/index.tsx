import React from 'react';
import {
  View,
  Text,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { ArrowLeft, MessageSquare, ChevronRight } from 'lucide-react-native';
import { api } from '../../lib/api';
import type { Forum } from '../../../shared/types';

export default function ForumsIndexScreen() {
  const { data: forums, isLoading, error } = useQuery({
    queryKey: ['forums'],
    queryFn: () => api.get<Forum[]>('/api/forums'),
  });

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-950">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={24} color="#6B7280" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900 dark:text-white ml-4">
          Forums
        </Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#7C3AED" />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-gray-500 dark:text-gray-400 text-center">
            Could not load forums.
          </Text>
        </View>
      ) : (
        <FlatList
          data={forums || []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingVertical: 8 }}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-16">
              <MessageSquare size={40} color="#D1D5DB" />
              <Text className="text-gray-400 dark:text-gray-500 text-base mt-3">
                No forums yet
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              className="flex-row items-center px-4 py-4 border-b border-gray-100 dark:border-gray-800"
              onPress={() => router.push(`/forums/${item.slug}`)}
              activeOpacity={0.7}
            >
              <View className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 items-center justify-center">
                <MessageSquare size={20} color="#7C3AED" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-base font-semibold text-gray-900 dark:text-white">
                  {item.name}
                </Text>
                {item.description && (
                  <Text
                    className="text-sm text-gray-500 dark:text-gray-400 mt-0.5"
                    numberOfLines={2}
                  >
                    {item.description}
                  </Text>
                )}
                <Text className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {item.postCount} {item.postCount === 1 ? 'post' : 'posts'}
                </Text>
              </View>
              <ChevronRight size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}
