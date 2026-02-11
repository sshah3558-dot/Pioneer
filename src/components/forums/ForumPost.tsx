'use client';

import { ForumPostData } from '@/lib/mock-data';
import { MessageCircle, Eye } from 'lucide-react';

interface ForumPostProps {
  post: ForumPostData;
}

export function ForumPost({ post }: ForumPostProps) {
  return (
    <div
      className={`forum-card bg-white rounded-2xl shadow-lg p-6 ${
        post.isTrending ? 'border-2 border-purple-300' : ''
      }`}
    >
      {/* Trending indicator */}
      {post.isTrending && (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">🔥</span>
          <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold">
            Trending
          </span>
        </div>
      )}

      <div className="flex items-start gap-4">
        <img
          src={post.avatarUrl}
          alt={post.author}
          className="w-12 h-12 rounded-full border-2 border-purple-300 object-cover"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <h3 className="font-bold text-lg">{post.title}</h3>
            <span
              className={`${post.categoryColor} px-2 py-1 rounded-full text-xs font-bold`}
            >
              {post.categoryEmoji} {post.category}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Posted by <span className="font-semibold">@{post.author}</span> •{' '}
            {post.timeAgo}
          </p>
          <p className="text-gray-700 mb-4">{post.description}</p>
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <MessageCircle className="w-5 h-5" />
              <span className="font-semibold">{post.replyCount} replies</span>
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
