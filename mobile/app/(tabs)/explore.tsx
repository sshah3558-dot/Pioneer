import { useState, useRef, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  FlatList,
  RefreshControl,
  View,
  Text,
  TextInput,
  Pressable,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Search, X } from 'lucide-react-native';
import { api } from '../../lib/api';
import { useDebounce } from '../../lib/hooks/useDebounce';
import MomentCard from '../../components/moments/MomentCard';
import type { Moment, PaginatedResponse } from '../../../shared/types';

type FilterTab = 'recommended' | 'mostViewed' | 'topRated';

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'recommended', label: 'Recommended' },
  { key: 'mostViewed', label: 'Most Viewed' },
  { key: 'topRated', label: 'Top Rated' },
];

function SkeletonCard() {
  return (
    <View className="flex-1 rounded-2xl overflow-hidden bg-gray-200 dark:bg-gray-800 mx-1.5">
      <View className="aspect-[3/4] bg-gray-300 dark:bg-gray-700" />
      <View className="px-2.5 py-2">
        <View className="w-12 h-3 bg-gray-300 dark:bg-gray-700 rounded" />
      </View>
    </View>
  );
}

export default function ExploreScreen() {
  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterTab>('recommended');
  const debouncedSearch = useDebounce(searchText, 300);
  const queryClient = useQueryClient();
  const inputRef = useRef<TextInput>(null);

  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['moments', activeFilter, debouncedSearch],
    queryFn: () =>
      api.get<PaginatedResponse<Moment>>(
        `/api/moments?filter=${activeFilter}&search=${encodeURIComponent(debouncedSearch)}&page=1&pageSize=20`
      ),
  });

  const handleToggleSave = useCallback(
    async (momentId: string, currentlySaved: boolean) => {
      try {
        if (currentlySaved) {
          await api.delete(`/api/moments/${momentId}/save`);
        } else {
          await api.post(`/api/moments/${momentId}/save`);
        }
        queryClient.invalidateQueries({ queryKey: ['moments'] });
      } catch {
        // Silently fail -- could add toast later
      }
    },
    [queryClient]
  );

  const clearSearch = () => {
    setSearchText('');
    inputRef.current?.blur();
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-950">
      {/* Search bar */}
      <View className="px-4 pt-3 pb-2 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <View className="flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2.5">
          <Search size={18} color="#9CA3AF" />
          <TextInput
            ref={inputRef}
            className="flex-1 ml-2 text-sm text-gray-900 dark:text-white"
            placeholder="Search moments, places..."
            placeholderTextColor="#9CA3AF"
            value={searchText}
            onChangeText={setSearchText}
            returnKeyType="search"
            autoCorrect={false}
          />
          {searchText.length > 0 && (
            <Pressable onPress={clearSearch} hitSlop={8}>
              <X size={16} color="#9CA3AF" />
            </Pressable>
          )}
        </View>

        {/* Filter tabs */}
        <View className="flex-row mt-3 mb-1 gap-2">
          {FILTER_TABS.map((tab) => (
            <Pressable
              key={tab.key}
              onPress={() => setActiveFilter(tab.key)}
              className={`px-4 py-1.5 rounded-full ${
                activeFilter === tab.key
                  ? 'bg-purple-600'
                  : 'bg-gray-100 dark:bg-gray-800'
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  activeFilter === tab.key
                    ? 'text-white'
                    : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Content */}
      {isLoading && !data ? (
        <View className="flex-row flex-wrap px-2.5 pt-4 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </View>
      ) : (
        <FlatList
          data={data?.items || []}
          renderItem={({ item }) => (
            <View className="px-1.5 mb-3">
              <MomentCard moment={item} onToggleSave={handleToggleSave} />
            </View>
          )}
          keyExtractor={(item) => item.id}
          numColumns={2}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor="#7C3AED"
              colors={['#7C3AED']}
            />
          }
          contentContainerStyle={{ paddingHorizontal: 10, paddingTop: 16 }}
          columnWrapperStyle={{ gap: 0 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center py-20">
              <Text className="text-gray-500 dark:text-gray-400 text-lg">No moments found</Text>
              <Text className="text-gray-400 dark:text-gray-500 mt-1 text-sm">
                {debouncedSearch ? 'Try a different search' : 'Check back later for new content'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
