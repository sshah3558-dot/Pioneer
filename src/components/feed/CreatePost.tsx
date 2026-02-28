'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { CreateMoment } from '@/components/moments/CreateMoment';
import { Plus } from 'lucide-react';

export function CreatePost() {
  const { user } = useCurrentUser();
  const [showCreateMoment, setShowCreateMoment] = useState(false);

  return (
    <>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-4 sm:p-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <Image
            src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=667eea&color=fff&size=48`}
            alt={user?.name || 'User'}
            width={48}
            height={48}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0"
          />
          <button
            onClick={() => setShowCreateMoment(true)}
            className="flex-1 text-left bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-3 text-gray-400 dark:text-gray-500 text-sm sm:text-base cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            What moment will you share today?
          </button>
          <button
            onClick={() => setShowCreateMoment(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-4 sm:px-6 py-2.5 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2 whitespace-nowrap text-sm sm:text-base"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Post a Moment</span>
            <span className="sm:hidden">Post</span>
          </button>
        </div>
      </div>
      <CreateMoment isOpen={showCreateMoment} onClose={() => setShowCreateMoment(false)} />
    </>
  );
}
