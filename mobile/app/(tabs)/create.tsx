import React from 'react';
import { SafeAreaView, View, Text, ScrollView, Alert } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import CreateMomentForm from '../../components/moments/CreateMomentForm';

export default function CreateScreen() {
  const queryClient = useQueryClient();

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['feed'] });
    queryClient.invalidateQueries({ queryKey: ['moments'] });
    queryClient.invalidateQueries({ queryKey: ['myPosts'] });
    Alert.alert('Success', 'Your moment has been shared!');
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-950">
      <View className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <Text className="text-xl font-bold text-gray-900 dark:text-white">
          New Moment
        </Text>
      </View>
      <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
        <CreateMomentForm onSuccess={handleSuccess} />
      </ScrollView>
    </SafeAreaView>
  );
}
