'use client';

import { mockCurrentUser } from '@/lib/mock-data';

export function CreatePost() {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center gap-4 mb-4">
        <img
          src={mockCurrentUser.avatarUrl || ''}
          alt={mockCurrentUser.name || 'User'}
          className="w-12 h-12 rounded-full object-cover"
        />
        <input
          type="text"
          placeholder="Share your latest discovery..."
          className="flex-1 bg-gray-100 rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
          readOnly
        />
      </div>
      <div className="flex gap-4">
        <button className="flex-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 py-3 rounded-xl font-semibold hover:shadow-lg transition-all">
          📸 Add Photos
        </button>
        <button className="flex-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 py-3 rounded-xl font-semibold hover:shadow-lg transition-all">
          📍 Tag Location
        </button>
      </div>
    </div>
  );
}
