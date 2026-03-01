import { useQuery } from '@tanstack/react-query';
import { FlatList, RefreshControl, View, Text, SafeAreaView, ActivityIndicator } from 'react-native';
import { api } from '../../lib/api';
import FeedCard from '../../components/feed/FeedCard';
import type { FeedItem, PaginatedResponse } from '../../../shared/types';

export default function FeedScreen() {
  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['feed'],
    queryFn: () => api.get<PaginatedResponse<FeedItem>>('/api/feed?page=1&pageSize=20'),
  });

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <View className="px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <Text className="text-2xl font-bold text-purple-600">Pioneer</Text>
      </View>

      {isLoading && !data ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#7C3AED" />
          <Text className="text-gray-500 dark:text-gray-400 mt-3 text-sm">Loading feed...</Text>
        </View>
      ) : (
        <FlatList
          data={data?.items || []}
          renderItem={({ item }) => <FeedCard item={item} />}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor="#7C3AED"
              colors={['#7C3AED']}
            />
          }
          contentContainerStyle={{ padding: 16, gap: 12 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center py-20">
              <Text className="text-gray-500 dark:text-gray-400 text-lg">No activity yet</Text>
              <Text className="text-gray-400 dark:text-gray-500 mt-1 text-sm">
                Follow people to see their updates
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
