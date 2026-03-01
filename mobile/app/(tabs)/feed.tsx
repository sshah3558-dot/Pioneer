import { View, Text, SafeAreaView } from 'react-native';

export default function FeedScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-950">
      <View className="flex-1 items-center justify-center">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white">Feed</Text>
        <Text className="text-gray-500 dark:text-gray-400 mt-2">Coming soon</Text>
      </View>
    </SafeAreaView>
  );
}
