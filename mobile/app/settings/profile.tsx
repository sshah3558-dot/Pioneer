import React, { useState, useEffect } from 'react';
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
import { Image } from 'expo-image';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ArrowLeft, Camera } from 'lucide-react-native';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';

export default function EditProfileScreen() {
  const { user, refreshUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setUsername(user.username || '');
      setBio(user.bio || '');
    }
  }, [user]);

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      let avatarUrl: string | undefined;

      // Upload avatar if changed
      if (avatarUri) {
        const uploadResult = await api.upload(avatarUri);
        avatarUrl = uploadResult.url;
      }

      await api.patch('/api/users/me', {
        name: name.trim() || null,
        username: username.trim() || null,
        bio: bio.trim() || null,
        ...(avatarUrl ? { avatarUrl } : {}),
      });
    },
    onSuccess: async () => {
      await refreshUser();
      Alert.alert('Saved', 'Your profile has been updated.');
      router.back();
    },
    onError: (err: Error) => {
      Alert.alert('Error', err.message || 'Could not save profile.');
    },
  });

  const displayAvatar = avatarUri || user?.avatarUrl;

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-950">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
            <ArrowLeft size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text className="text-base font-bold text-gray-900 dark:text-white">
            Edit Profile
          </Text>
          <TouchableOpacity
            onPress={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className={`px-4 py-1.5 rounded-full ${
              saveMutation.isPending ? 'bg-purple-300' : 'bg-purple-600'
            }`}
          >
            {saveMutation.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text className="text-sm font-semibold text-white">Save</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Avatar */}
          <View className="items-center mt-6 mb-6">
            <TouchableOpacity onPress={pickAvatar} activeOpacity={0.7}>
              <View className="relative">
                {displayAvatar ? (
                  <Image
                    source={{ uri: displayAvatar }}
                    style={{ width: 96, height: 96, borderRadius: 48 }}
                    contentFit="cover"
                  />
                ) : (
                  <View className="w-24 h-24 rounded-full bg-purple-200 dark:bg-purple-800 items-center justify-center">
                    <Text className="text-3xl font-bold text-purple-600 dark:text-purple-300">
                      {(name || username || '?')[0].toUpperCase()}
                    </Text>
                  </View>
                )}
                <View className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-purple-600 items-center justify-center border-2 border-white dark:border-gray-950">
                  <Camera size={14} color="#FFFFFF" />
                </View>
              </View>
            </TouchableOpacity>
            <Text className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Tap to change photo
            </Text>
          </View>

          {/* Form Fields */}
          <View className="px-4 gap-5">
            <View>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Name
              </Text>
              <TextInput
                className="border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-base text-gray-900 dark:text-white bg-white dark:bg-gray-900"
                placeholder="Your display name"
                placeholderTextColor="#9CA3AF"
                value={name}
                onChangeText={setName}
                maxLength={50}
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Username
              </Text>
              <TextInput
                className="border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-base text-gray-900 dark:text-white bg-white dark:bg-gray-900"
                placeholder="username"
                placeholderTextColor="#9CA3AF"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={30}
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Bio
              </Text>
              <TextInput
                className="border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-base text-gray-900 dark:text-white bg-white dark:bg-gray-900 min-h-[100px]"
                placeholder="Tell others about yourself..."
                placeholderTextColor="#9CA3AF"
                value={bio}
                onChangeText={setBio}
                multiline
                textAlignVertical="top"
                maxLength={300}
              />
              <Text className="text-xs text-gray-400 dark:text-gray-500 mt-1 text-right">
                {bio.length}/300
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
