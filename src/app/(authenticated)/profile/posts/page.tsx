'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { apiFetch } from '@/lib/api/fetcher';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AllPostsPage() {
  const { user } = useCurrentUser();
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const { data, isLoading } = useQuery({
    queryKey: ['allMyPosts', page],
    queryFn: () => apiFetch<{ items: Array<{
      id: string;
      content: string;
      imageUrl: string | null;
      likeCount: number;
      createdAt: string;
    }>, total: number, hasMore: boolean }>(`/api/posts?userId=me&page=${page}&pageSize=${pageSize}`),
    enabled: !!user,
  });

  const posts = data?.items || [];

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`;
    return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with back link */}
      <div className="flex items-center gap-3">
        <Link href="/profile" className="text-gray-500 hover:text-gray-700 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h2 className="font-bold text-2xl gradient-text-135">All Posts</h2>
        {data?.total && (
          <span className="text-sm text-gray-500">({data.total} posts)</span>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-200" />
              <div className="p-5 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-20" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <p className="text-gray-500 text-lg">No posts yet.</p>
          <p className="text-gray-400 text-sm mt-1">Share your latest discovery on the feed!</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <div key={post.id} className="card-hover bg-white rounded-2xl shadow-lg overflow-hidden">
                {post.imageUrl && (
                  <img src={post.imageUrl} alt="" className="w-full h-48 object-cover" />
                )}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-gray-500">{timeAgo(post.createdAt)}</span>
                    {post.likeCount > 0 && (
                      <span className="bg-pink-100 text-pink-800 px-2 py-1 rounded-full text-xs font-bold">
                        {post.likeCount} likes
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-4">{post.content}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center gap-3">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-xl bg-white shadow-lg text-sm font-medium disabled:opacity-50 hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm text-gray-500">Page {page}</span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={!data?.hasMore}
              className="px-4 py-2 rounded-xl bg-white shadow-lg text-sm font-medium disabled:opacity-50 hover:bg-gray-50 transition-colors"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
