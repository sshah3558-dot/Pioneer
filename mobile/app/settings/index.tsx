import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import {
  ArrowLeft,
  User,
  Mail,
  Bell,
  LogOut,
  ChevronRight,
} from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';

interface SettingsItemProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  destructive?: boolean;
}

function SettingsItem({ icon, label, onPress, destructive }: SettingsItemProps) {
  return (
    <TouchableOpacity
      className="flex-row items-center px-4 py-4 border-b border-gray-100 dark:border-gray-800"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 items-center justify-center">
        {icon}
      </View>
      <Text
        className={`text-base ml-3 flex-1 ${
          destructive
            ? 'text-red-500 font-semibold'
            : 'text-gray-900 dark:text-white font-medium'
        }`}
      >
        {label}
      </Text>
      {!destructive && <ChevronRight size={18} color="#9CA3AF" />}
    </TouchableOpacity>
  );
}

export default function SettingsIndexScreen() {
  const { logout, user } = useAuth();

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-950">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={24} color="#6B7280" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900 dark:text-white ml-4">
          Settings
        </Text>
      </View>

      {/* User info summary */}
      {user && (
        <View className="px-4 py-4 border-b border-gray-100 dark:border-gray-800">
          <Text className="text-base font-semibold text-gray-900 dark:text-white">
            {user.name || 'Unnamed User'}
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {user.email}
          </Text>
        </View>
      )}

      {/* Settings Items */}
      <View className="mt-2">
        <SettingsItem
          icon={<User size={18} color="#7C3AED" />}
          label="Edit Profile"
          onPress={() => router.push('/settings/profile')}
        />
        <SettingsItem
          icon={<Mail size={18} color="#3B82F6" />}
          label="Account"
          onPress={() => router.push('/settings/account')}
        />
        <SettingsItem
          icon={<Bell size={18} color="#F59E0B" />}
          label="Notifications"
          onPress={() => router.push('/settings/notifications')}
        />
      </View>

      <View className="mt-6">
        <SettingsItem
          icon={<LogOut size={18} color="#EF4444" />}
          label="Log Out"
          onPress={handleLogout}
          destructive
        />
      </View>
    </SafeAreaView>
  );
}
