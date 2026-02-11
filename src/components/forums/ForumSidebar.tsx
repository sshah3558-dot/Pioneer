'use client';

import { mockForumCategories, mockActiveMembers } from '@/lib/mock-data';

export function ForumSidebar() {
  return (
    <div className="space-y-6">
      {/* Categories */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-lg mb-4 gradient-text-135">📂 Categories</h3>
        <div className="space-y-2">
          {mockForumCategories.map((cat) => (
            <button
              key={cat.label}
              className="w-full text-left px-4 py-3 rounded-xl hover:bg-purple-50 transition-all flex items-center justify-between"
            >
              <span>
                {cat.emoji} {cat.label}
              </span>
              <span className="text-sm text-gray-500">{cat.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Members */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-lg mb-4 gradient-text-135">🌟 Active Members</h3>
        <div className="space-y-3">
          {mockActiveMembers.map((member) => (
            <div key={member.id} className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={member.avatarUrl}
                  alt={member.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                    member.status === 'online' ? 'bg-green-500' : 'bg-yellow-500'
                  }`}
                />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm">{member.name}</div>
                <div className="text-xs text-gray-500">
                  {member.status === 'online' ? 'Online now' : 'Away'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
