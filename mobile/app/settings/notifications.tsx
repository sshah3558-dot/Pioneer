import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Switch,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

interface NotificationToggleProps {
  label: string;
  description: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
}

function NotificationToggle({ label, description, value, onValueChange }: NotificationToggleProps) {
  return (
    <View className="flex-row items-center px-4 py-4 border-b border-gray-100 dark:border-gray-800">
      <View className="flex-1 mr-4">
        <Text className="text-base font-medium text-gray-900 dark:text-white">
          {label}
        </Text>
        <Text className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          {description}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#D1D5DB', true: '#C4B5FD' }}
        thumbColor={value ? '#7C3AED' : '#F3F4F6'}
      />
    </View>
  );
}

export default function NotificationsSettingsScreen() {
  const [likes, setLikes] = useState(true);
  const [comments, setComments] = useState(true);
  const [followers, setFollowers] = useState(true);
  const [tripUpdates, setTripUpdates] = useState(true);
  const [forumReplies, setForumReplies] = useState(true);
  const [recommendations, setRecommendations] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-950">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={24} color="#6B7280" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900 dark:text-white ml-4">
          Notifications
        </Text>
      </View>

      <ScrollView>
        <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 mt-4 mb-2">
          Activity
        </Text>

        <NotificationToggle
          label="Likes"
          description="When someone likes your moment"
          value={likes}
          onValueChange={setLikes}
        />
        <NotificationToggle
          label="Comments"
          description="When someone comments on your moment"
          value={comments}
          onValueChange={setComments}
        />
        <NotificationToggle
          label="New Followers"
          description="When someone starts following you"
          value={followers}
          onValueChange={setFollowers}
        />

        <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 mt-6 mb-2">
          Updates
        </Text>

        <NotificationToggle
          label="Trip Updates"
          description="Changes to trips you're part of"
          value={tripUpdates}
          onValueChange={setTripUpdates}
        />
        <NotificationToggle
          label="Forum Replies"
          description="Replies to your forum posts"
          value={forumReplies}
          onValueChange={setForumReplies}
        />
        <NotificationToggle
          label="Recommendations"
          description="Personalized place suggestions"
          value={recommendations}
          onValueChange={setRecommendations}
        />

        <Text className="text-xs text-gray-400 dark:text-gray-500 px-4 mt-4 mb-8">
          Notification preferences are stored locally. Push notification support coming soon.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
