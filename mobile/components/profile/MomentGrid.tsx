import React from 'react';
import { View, Text, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { useQuery } from '@tanstack/react-query';
import { Camera } from 'lucide-react-native';
import { api } from '../../lib/api';
import type { Moment, PaginatedResponse } from '../../../shared/types';

interface MomentGridProps {
  userId: string;
}

const COLUMNS = 3;
const GAP = 2;

export default function MomentGrid({ userId }: MomentGridProps) {
  const screenWidth = Dimensions.get('window').width;
  const itemSize = (screenWidth - GAP * (COLUMNS - 1)) / COLUMNS;

  const { data, isLoading, error } = useQuery({
    queryKey: ['moments', userId],
    queryFn: () =>
      api.get<PaginatedResponse<Moment>>(
        `/api/posts?userId=${encodeURIComponent(userId)}&pageSize=50`
      ),
  });

  if (isLoading) {
    return (
      <View className="py-12 items-center">
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="py-12 items-center px-4">
        <Text className="text-sm text-gray-500 dark:text-gray-400 text-center">
          Could not load moments.
        </Text>
      </View>
    );
  }

  const moments = data?.items || [];

  if (moments.length === 0) {
    return (
      <View className="py-16 items-center px-4">
        <Camera size={40} color="#D1D5DB" />
        <Text className="text-base font-semibold text-gray-400 dark:text-gray-500 mt-3">
          No moments yet
        </Text>
        <Text className="text-sm text-gray-400 dark:text-gray-500 mt-1 text-center">
          Share your travel experiences and they will appear here.
        </Text>
      </View>
    );
  }

  return (
    <View>
      {/* Section header */}
      <View className="px-4 py-3">
        <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Moments
        </Text>
      </View>

      {/* Grid */}
      <View className="flex-row flex-wrap">
        {moments.map((moment, index) => {
          const imageUri = moment.imageUrl || moment.imageUrl2 || moment.imageUrl3;
          const marginRight = (index + 1) % COLUMNS !== 0 ? GAP : 0;

          return (
            <TouchableOpacity
              key={moment.id}
              style={{
                width: itemSize,
                height: itemSize,
                marginRight,
                marginBottom: GAP,
              }}
              activeOpacity={0.8}
            >
              {imageUri ? (
                <View style={{ width: itemSize, height: itemSize }}>
                  <Image
                    source={{ uri: imageUri }}
                    style={{ width: itemSize, height: itemSize }}
                    contentFit="cover"
                  />
                  {/* Composite score badge */}
                  {moment.compositeScore != null ? (
                    <View className="absolute bottom-1 right-1 bg-black/70 rounded-md px-1.5 py-0.5">
                      <Text className="text-xs font-bold text-white">
                        {moment.compositeScore.toFixed(1)}
                      </Text>
                    </View>
                  ) : null}
                </View>
              ) : (
                <View
                  style={{ width: itemSize, height: itemSize }}
                  className="bg-gray-100 dark:bg-gray-800 items-center justify-center"
                >
                  <Text
                    className="text-xs text-gray-500 dark:text-gray-400 px-2"
                    numberOfLines={3}
                  >
                    {moment.content}
                  </Text>
                  {moment.compositeScore != null ? (
                    <View className="absolute bottom-1 right-1 bg-black/70 rounded-md px-1.5 py-0.5">
                      <Text className="text-xs font-bold text-white">
                        {moment.compositeScore.toFixed(1)}
                      </Text>
                    </View>
                  ) : null}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
