'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/fetcher';

interface RecentTrip {
  id: string;
  title: string;
  status: string;
  updatedAt: string;
  user: { name: string | null; avatarUrl: string | null };
}

export function TripActivity() {
  const { data } = useQuery({
    queryKey: ['recentTrips'],
    queryFn: () => apiFetch<{ items: RecentTrip[] }>('/api/trips?pageSize=5&sortBy=recent'),
  });

  const trips = data?.items || [];

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="font-bold text-lg mb-4 gradient-text-135">Recent Activity</h3>
      {trips.length === 0 ? (
        <p className="text-sm text-gray-500">No recent activity yet.</p>
      ) : (
        <div className="space-y-4">
          {trips.map((trip) => (
            <div key={trip.id} className="flex gap-3">
              <img
                src={trip.user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(trip.user.name || 'U')}&background=667eea&color=fff&size=40`}
                alt={trip.user.name || ''}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="text-sm">
                  <span className="font-bold">{trip.user.name}</span>{' '}
                  {trip.status === 'COMPLETED' ? 'completed' : 'is planning'}{' '}
                  <span className="font-semibold">{trip.title}</span>
                </p>
                <p className="text-xs text-gray-500">{timeAgo(trip.updatedAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
