'use client';

import { useState } from 'react';
import { mockSuggestedUsers } from '@/lib/mock-data';

export function SuggestedUsers() {
  const [following, setFollowing] = useState<Set<string>>(new Set());

  const toggleFollow = (userId: string) => {
    setFollowing((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="font-bold text-lg mb-4 gradient-text-135">Suggested Pioneers</h3>
      <div className="space-y-4">
        {mockSuggestedUsers.map((user) => {
          const isFollowing = following.has(user.id);
          return (
            <div key={user.id} className="flex items-center gap-3">
              <img
                src={user.avatarUrl || ''}
                alt={user.name || 'User'}
                className="w-12 h-12 rounded-full border-2 border-gray-200 object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">{user.name}</div>
                <div className="text-xs text-gray-500">{user.stat}</div>
              </div>
              <button
                onClick={() => toggleFollow(user.id)}
                className={`follow-btn px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                  isFollowing
                    ? 'bg-gray-200 text-gray-700'
                    : 'bg-purple-600 text-white'
                }`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
