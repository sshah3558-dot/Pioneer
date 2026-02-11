'use client';

import { ForumPost } from '@/components/forums/ForumPost';
import { ForumSidebar } from '@/components/forums/ForumSidebar';
import { mockForumPosts } from '@/lib/mock-data';

export default function ForumsPage() {
  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Forum Topics */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-3xl font-bold gradient-text-135">💬 Community Forums</h2>
            <button className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all">
              + New Topic
            </button>
          </div>

          {mockForumPosts.map((post) => (
            <ForumPost key={post.id} post={post} />
          ))}
        </div>

        {/* Sidebar */}
        <ForumSidebar />
      </div>
    </div>
  );
}
