'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/fetcher';

interface ForumItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  postCount: number;
}

interface ForumSidebarProps {
  activeSlug?: string;
  onSelectForum?: (slug: string | null) => void;
}

export function ForumSidebar({ activeSlug, onSelectForum }: ForumSidebarProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['forums'],
    queryFn: () => apiFetch<{ forums: ForumItem[] }>('/api/forums'),
  });

  const forums = data?.forums || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-32 mb-4" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-gray-200 rounded mb-2" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Categories */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-lg mb-4 gradient-text-135">Categories</h3>
        <div className="space-y-2">
          <button
            onClick={() => onSelectForum?.(null)}
            className={`w-full text-left px-4 py-3 rounded-xl hover:bg-purple-50 transition-all flex items-center justify-between ${
              !activeSlug ? 'bg-purple-50 font-bold' : ''
            }`}
          >
            <span>All Forums</span>
          </button>
          {forums.map((forum) => (
            <button
              key={forum.id}
              onClick={() => onSelectForum?.(forum.slug)}
              className={`w-full text-left px-4 py-3 rounded-xl hover:bg-purple-50 transition-all flex items-center justify-between ${
                activeSlug === forum.slug ? 'bg-purple-50 font-bold' : ''
              }`}
            >
              <span>{forum.name}</span>
              <span className="text-sm text-gray-500">{forum.postCount}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
