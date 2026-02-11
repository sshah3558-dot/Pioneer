'use client';

import { MessageCircle, Eye } from 'lucide-react';

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
  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return `${Math.floor(days / 7)}w ago`;
  };

  return (
    <div
      className={`forum-card bg-white rounded-2xl shadow-lg p-6 ${
        post.isPinned ? 'border-2 border-purple-300' : ''
      }`}
    >
      {post.isPinned && (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">📌</span>
          <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-bold">
            Pinned
          </span>
        </div>
      )}

      <div className="flex items-start gap-4">
        <img
          src={post.user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.user.name || 'U')}&background=667eea&color=fff`}
          alt={post.user.name || ''}
          className="w-12 h-12 rounded-full border-2 border-purple-300 object-cover"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <h3 className="font-bold text-lg">{post.title}</h3>
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-bold">
              {post.forumName}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Posted by <span className="font-semibold">@{post.user.username || 'anonymous'}</span> &middot;{' '}
            {timeAgo(post.createdAt)}
          </p>
          <p className="text-gray-700 mb-4 line-clamp-3">{post.content}</p>
          <div className="flex items-center gap-6 text-sm text-gray-600">
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
