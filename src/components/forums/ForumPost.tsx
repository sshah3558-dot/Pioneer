'use client';

import Image from 'next/image';
import { MessageCircle, Eye } from 'lucide-react';
import { timeAgo } from '@/lib/utils/date';

export interface ForumPostItem {
  id: string;
  title: string;
  content: string;
  user: { id: string; name: string | null; username: string | null; avatarUrl: string | null };
  commentCount: number;
  viewCount: number;
  isPinned: boolean;
  createdAt: string;
  forumName: string;
  forumSlug: string;
}

interface ForumPostProps {
  post: ForumPostItem;
}

export function ForumPost({ post }: ForumPostProps) {
  return (
    <div
      className={`forum-card bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 ${
        post.isPinned ? 'border-2 border-purple-300 dark:border-purple-700' : ''
      }`}
    >
      {post.isPinned && (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">📌</span>
          <span className="bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full text-xs font-bold">
            Pinned
          </span>
        </div>
      )}

      <div className="flex items-start gap-4">
        <Image
          src={post.user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.user.name || 'U')}&background=667eea&color=fff`}
          alt={post.user.name || ''}
          width={48}
          height={48}
          className="w-12 h-12 rounded-full border-2 border-purple-300 object-cover"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <h3 className="font-bold text-lg dark:text-white">{post.title}</h3>
            <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full text-xs font-bold">
              {post.forumName}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Posted by <span className="font-semibold">@{post.user.username || 'anonymous'}</span> &middot;{' '}
            {timeAgo(post.createdAt)}
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">{post.content}</p>
          <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <MessageCircle className="w-5 h-5" />
              <span className="font-semibold">{post.commentCount} replies</span>
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-5 h-5" />
              <span>{post.viewCount} views</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
