import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, X, MessageSquare } from 'lucide-react-native';
import { api } from '../../lib/api';
import ForumPostCard from '../../components/forums/ForumPostCard';
import type { ForumPostItem, PaginatedResponse } from '../../../shared/types';

export default function ForumThreadScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const queryClient = useQueryClient();
  const [showNewPost, setShowNewPost] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['forumPosts', slug],
    queryFn: () =>
      api.get<PaginatedResponse<ForumPostItem>>(`/api/forums/${slug}/posts`),
    enabled: !!slug,
  });

  const createPostMutation = useMutation({
    mutationFn: (body: { title: string; content: string }) =>
      api.post(`/api/forums/${slug}/posts`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forumPosts', slug] });
      setShowNewPost(false);
      setTitle('');
      setContent('');
    },
    onError: (err: Error) => {
      Alert.alert('Error', err.message || 'Could not create post.');
    },
  });

  const handleSubmit = () => {
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();
    if (!trimmedTitle) {
      Alert.alert('Missing Title', 'Please enter a title for your post.');
      return;
    }
    if (!trimmedContent) {
      Alert.alert('Missing Content', 'Please enter some content for your post.');
      return;
    }
    createPostMutation.mutate({ title: trimmedTitle, content: trimmedContent });
  };

  const posts = data?.items || [];

  // Extract the forum name from the first post if available, or fall back to slug
  const forumName = posts.length > 0 ? posts[0].forumName : (slug || 'Forum');

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-950">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={24} color="#6B7280" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900 dark:text-white ml-4 flex-1" numberOfLines={1}>
          {forumName}
        </Text>
        <TouchableOpacity
          onPress={() => setShowNewPost(true)}
          className="w-9 h-9 rounded-full bg-purple-600 items-center justify-center"
          hitSlop={8}
        >
          <Plus size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#7C3AED" />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-gray-500 dark:text-gray-400 text-center">
            Could not load posts.
          </Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-16">
              <MessageSquare size={40} color="#D1D5DB" />
              <Text className="text-gray-400 dark:text-gray-500 text-base mt-3">
                No posts yet
              </Text>
              <Text className="text-gray-400 dark:text-gray-500 text-sm mt-1 text-center px-8">
                Start the conversation by creating the first post.
              </Text>
            </View>
          }
          renderItem={({ item }) => <ForumPostCard post={item} />}
        />
      )}

      {/* New Post Modal */}
      <Modal
        visible={showNewPost}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowNewPost(false)}
      >
        <SafeAreaView className="flex-1 bg-white dark:bg-gray-950">
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1"
          >
            {/* Modal Header */}
            <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
              <TouchableOpacity onPress={() => setShowNewPost(false)} hitSlop={8}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
              <Text className="text-base font-bold text-gray-900 dark:text-white">
                New Post
              </Text>
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={createPostMutation.isPending}
                className={`px-4 py-1.5 rounded-full ${
                  createPostMutation.isPending ? 'bg-purple-300' : 'bg-purple-600'
                }`}
              >
                {createPostMutation.isPending ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text className="text-sm font-semibold text-white">Post</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Form */}
            <View className="flex-1 px-4 pt-4">
              <TextInput
                className="text-lg font-semibold text-gray-900 dark:text-white pb-3 border-b border-gray-100 dark:border-gray-800"
                placeholder="Post title"
                placeholderTextColor="#9CA3AF"
                value={title}
                onChangeText={setTitle}
                maxLength={200}
                autoFocus
              />
              <TextInput
                className="text-base text-gray-800 dark:text-gray-200 mt-3 flex-1"
                placeholder="Write your post..."
                placeholderTextColor="#9CA3AF"
                value={content}
                onChangeText={setContent}
                multiline
                textAlignVertical="top"
                maxLength={10000}
              />
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
