import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Star } from 'lucide-react-native';

interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  size?: number;
  label?: string;
}

export default function StarRating({
  rating,
  onRatingChange,
  size = 28,
  label,
}: StarRatingProps) {
  return (
    <View>
      {label ? (
        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {label}
        </Text>
      ) : null}
      <View className="flex-row gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => onRatingChange(star === rating ? 0 : star)}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
          >
            <Star
              size={size}
              color={star <= rating ? '#FBBF24' : '#D1D5DB'}
              fill={star <= rating ? '#FBBF24' : 'transparent'}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
