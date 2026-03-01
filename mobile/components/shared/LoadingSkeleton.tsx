import { useEffect, useRef } from 'react';
import { View, Animated, useColorScheme } from 'react-native';

function ShimmerBlock({ width, height, borderRadius = 8 }: { width: number | string; height: number; borderRadius?: number }) {
  const opacity = useRef(new Animated.Value(0.3)).current;
  const colorScheme = useColorScheme();
  const bgColor = colorScheme === 'dark' ? '#374151' : '#E5E7EB';

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={{
        backgroundColor: bgColor,
        width: width as number,
        height,
        borderRadius,
        opacity,
      }}
    />
  );
}

export function FeedCardSkeleton() {
  return (
    <View className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 p-4 mb-4">
      {/* Header */}
      <View className="flex-row items-center mb-3">
        <ShimmerBlock width={40} height={40} borderRadius={20} />
        <View className="ml-3 flex-1">
          <ShimmerBlock width={120} height={14} />
          <View className="mt-1.5">
            <ShimmerBlock width={80} height={10} />
          </View>
        </View>
        <ShimmerBlock width={40} height={10} />
      </View>

      {/* Content lines */}
      <View className="mb-3">
        <ShimmerBlock width="100%" height={12} />
        <View className="mt-2">
          <ShimmerBlock width="80%" height={12} />
        </View>
      </View>

      {/* Image placeholder */}
      <ShimmerBlock width="100%" height={180} borderRadius={12} />

      {/* Footer */}
      <View className="flex-row items-center mt-3">
        <ShimmerBlock width={36} height={20} borderRadius={10} />
        <View className="ml-3">
          <ShimmerBlock width={40} height={14} />
        </View>
      </View>
    </View>
  );
}

export function ProfileSkeleton() {
  return (
    <View className="bg-white dark:bg-gray-900 p-4">
      {/* Cover image */}
      <ShimmerBlock width="100%" height={160} borderRadius={12} />

      {/* Avatar */}
      <View className="items-center -mt-12 mb-4">
        <ShimmerBlock width={80} height={80} borderRadius={40} />
      </View>

      {/* Name */}
      <View className="items-center mb-2">
        <ShimmerBlock width={160} height={20} />
      </View>
      <View className="items-center mb-4">
        <ShimmerBlock width={100} height={14} />
      </View>

      {/* Stats row */}
      <View className="flex-row justify-around mb-4">
        <ShimmerBlock width={60} height={40} />
        <ShimmerBlock width={60} height={40} />
        <ShimmerBlock width={60} height={40} />
      </View>
    </View>
  );
}

export function ExploreSkeleton() {
  return (
    <View className="flex-row flex-wrap p-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <View key={i} className="w-1/2 p-2">
          <ShimmerBlock width="100%" height={140} borderRadius={12} />
          <View className="mt-2">
            <ShimmerBlock width="70%" height={14} />
          </View>
          <View className="mt-1">
            <ShimmerBlock width="50%" height={10} />
          </View>
        </View>
      ))}
    </View>
  );
}

export function ListItemSkeleton() {
  return (
    <View className="flex-row items-center px-4 py-3 border-b border-gray-100 dark:border-gray-800">
      <ShimmerBlock width={48} height={48} borderRadius={8} />
      <View className="ml-3 flex-1">
        <ShimmerBlock width="60%" height={14} />
        <View className="mt-1.5">
          <ShimmerBlock width="40%" height={10} />
        </View>
      </View>
    </View>
  );
}

export function FeedListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <View className="p-4">
      {Array.from({ length: count }).map((_, i) => (
        <FeedCardSkeleton key={i} />
      ))}
    </View>
  );
}

