'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ForumPost, ForumPostItem } from '@/components/forums/ForumPost';
import { ForumSidebar } from '@/components/forums/ForumSidebar';
import { apiFetch } from '@/lib/api/fetcher';

export default function ForumsPage() {
  const queryClient = useQueryClient();
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Fetch all forums to get slugs
  const { data: forumsData } = useQuery({
    queryKey: ['forums'],
    queryFn: () => apiFetch<{ forums: Array<{ slug: string; name: string }> }>('/api/forums'),
  });

  // Fetch posts for the active forum (or first forum if none selected)
  const effectiveSlug = activeSlug || forumsData?.forums?.[0]?.slug || 'general-travel';

  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ['forumPosts', effectiveSlug],
    queryFn: () => apiFetch<{ items: ForumPostItem[] }>(`/api/forums/${effectiveSlug}/posts`),
    enabled: !!effectiveSlug,
  });

  const posts = postsData?.items || [];

  const handleCreatePost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) return;
    setIsCreating(true);

    try {
      await fetch(`/api/forums/${effectiveSlug}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newPostTitle.trim(),
          content: newPostContent.trim(),
        }),
      });

      setNewPostTitle('');
      setNewPostContent('');
      setShowCreateModal(false);
      queryClient.invalidateQueries({ queryKey: ['forumPosts', effectiveSlug] });
      queryClient.invalidateQueries({ queryKey: ['forums'] });
    } catch (err) {
      console.error('Failed to create post:', err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Forum Topics */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-3xl font-bold gradient-text-135">Community Forums</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
            >
              + New Topic
            </button>
          </div>

          {/* Create Post Modal (inline) */}
          {showCreateModal && (
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-purple-200">
              <h3 className="font-bold text-lg mb-4">Create New Topic</h3>
              <input
                type="text"
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
                placeholder="Topic title..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="What's on your mind?"
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePost}
                  disabled={isCreating || !newPostTitle.trim() || !newPostContent.trim()}
                  className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-2 rounded-xl font-bold disabled:opacity-50"
                >
                  {isCreating ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>
          )}

          {postsLoading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-200" />
                    <div className="flex-1">
                      <div className="h-5 bg-gray-200 rounded w-48 mb-2" />
                      <div className="h-4 bg-gray-200 rounded w-32 mb-3" />
                      <div className="h-4 bg-gray-200 rounded w-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <p className="text-gray-500 text-lg">No posts yet in this forum.</p>
              <p className="text-gray-400 text-sm mt-1">Be the first to start a conversation!</p>
            </div>
          ) : (
            posts.map((post) => <ForumPost key={post.id} post={post} />)
          )}
        </div>

        {/* Sidebar */}
        <ForumSidebar
          activeSlug={activeSlug || undefined}
          onSelectForum={(slug) => setActiveSlug(slug)}
        />
      </div>
    </div>
  );
}
