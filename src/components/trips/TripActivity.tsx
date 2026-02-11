'use client';

import { mockTripActivities } from '@/lib/mock-data';

export function TripActivity() {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="font-bold text-lg mb-4 gradient-text-135">Recent Activity</h3>
      <div className="space-y-4">
        {mockTripActivities.map((activity) => (
          <div key={activity.id} className="flex gap-3">
            <img
              src={activity.avatarUrl}
              alt={activity.userName}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p className="text-sm">
                <span className="font-bold">{activity.userName}</span> {activity.action}
              </p>
              <p className="text-xs text-gray-500">{activity.timeAgo}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
