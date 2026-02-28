'use client';

import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/fetcher';
import { timeAgo } from '@/lib/utils/date';

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

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6">
      <h3 className="font-bold text-lg mb-4 gradient-text-135">Recent Activity</h3>
      {trips.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">No recent activity yet.</p>
      ) : (
        <div className="space-y-4">
          {trips.map((trip) => (
            <div key={trip.id} className="flex gap-3">
              <Image
                src={trip.user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(trip.user.name || 'U')}&background=667eea&color=fff&size=40`}
                alt={trip.user.name || ''}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="text-sm dark:text-gray-200">
                  <span className="font-bold">{trip.user.name}</span>{' '}
                  {trip.status === 'COMPLETED' ? 'completed' : 'is planning'}{' '}
                  <span className="font-semibold">{trip.title}</span>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{timeAgo(trip.updatedAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
