import type { ReactNode } from 'react';
import { View, Text } from 'react-native';
import { Inbox } from 'lucide-react-native';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
}

export default function EmptyState({
  icon,
  title,
  subtitle,
}: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <View className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mb-4">
        {icon || <Inbox size={32} color="#9CA3AF" />}
      </View>

      <Text className="text-gray-900 dark:text-white text-lg font-semibold text-center mb-2">
        {title}
      </Text>

      {subtitle && (
        <Text className="text-gray-500 dark:text-gray-400 text-sm text-center leading-5">
          {subtitle}
        </Text>
      )}
    </View>
  );
}
