import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';

function SectionHeader({ title }: { title: string }) {
  return (
    <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 mt-6 mb-3">
      {title}
    </Text>
  );
}

export default function AccountSettingsScreen() {
  const { user, refreshUser } = useAuth();

  // Email form
  const [email, setEmail] = useState(user?.email || '');

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const emailMutation = useMutation({
    mutationFn: () =>
      api.patch('/api/users/me/email', { email: email.trim() }),
    onSuccess: async () => {
      await refreshUser();
      Alert.alert('Email Updated', 'Your email address has been changed.');
    },
    onError: (err: Error) => {
      Alert.alert('Error', err.message || 'Could not update email.');
    },
  });

  const passwordMutation = useMutation({
    mutationFn: () =>
      api.post('/api/users/me/password', {
        currentPassword,
        newPassword,
      }),
    onSuccess: () => {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('Password Changed', 'Your password has been updated.');
    },
    onError: (err: Error) => {
      Alert.alert('Error', err.message || 'Could not change password.');
    },
  });

  const handleChangeEmail = () => {
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    emailMutation.mutate();
  };

  const handleChangePassword = () => {
    if (!currentPassword) {
      Alert.alert('Missing Field', 'Please enter your current password.');
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert('Weak Password', 'New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Mismatch', 'New password and confirmation do not match.');
      return;
    }
    passwordMutation.mutate();
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-950">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
            <ArrowLeft size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-gray-900 dark:text-white ml-4">
            Account
          </Text>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Email Section */}
          <SectionHeader title="Email Address" />
          <View className="px-4 gap-3">
            <TextInput
              className="border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-base text-gray-900 dark:text-white bg-white dark:bg-gray-900"
              placeholder="your@email.com"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              className={`rounded-xl py-3 items-center ${
                emailMutation.isPending ? 'bg-purple-300' : 'bg-purple-600'
              }`}
              onPress={handleChangeEmail}
              disabled={emailMutation.isPending}
            >
              {emailMutation.isPending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text className="text-sm font-semibold text-white">Update Email</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Password Section */}
          <SectionHeader title="Change Password" />
          <View className="px-4 gap-3">
            <TextInput
              className="border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-base text-gray-900 dark:text-white bg-white dark:bg-gray-900"
              placeholder="Current password"
              placeholderTextColor="#9CA3AF"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
            />
            <TextInput
              className="border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-base text-gray-900 dark:text-white bg-white dark:bg-gray-900"
              placeholder="New password"
              placeholderTextColor="#9CA3AF"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
            <TextInput
              className="border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-base text-gray-900 dark:text-white bg-white dark:bg-gray-900"
              placeholder="Confirm new password"
              placeholderTextColor="#9CA3AF"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
            <TouchableOpacity
              className={`rounded-xl py-3 items-center ${
                passwordMutation.isPending ? 'bg-purple-300' : 'bg-purple-600'
              }`}
              onPress={handleChangePassword}
              disabled={passwordMutation.isPending}
            >
              {passwordMutation.isPending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text className="text-sm font-semibold text-white">Change Password</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
