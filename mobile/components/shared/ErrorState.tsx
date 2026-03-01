import { View, Text, Pressable } from 'react-native';
import { AlertCircle, RefreshCw } from 'lucide-react-native';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({
  message = 'Something went wrong. Please try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <View className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 items-center justify-center mb-4">
        <AlertCircle size={32} color="#EF4444" />
      </View>

      <Text className="text-gray-900 dark:text-white text-lg font-semibold text-center mb-2">
        Oops!
      </Text>

      <Text className="text-gray-500 dark:text-gray-400 text-sm text-center leading-5 mb-6">
        {message}
      </Text>

      {onRetry && (
        <Pressable
          onPress={onRetry}
          className="flex-row items-center bg-purple-600 active:bg-purple-700 rounded-full px-6 py-3"
        >
          <RefreshCw size={16} color="#FFFFFF" />
          <Text className="text-white font-semibold text-sm ml-2">
            Try Again
          </Text>
        </Pressable>
      )}
    </View>
  );
}
