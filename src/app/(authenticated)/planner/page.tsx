'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { TripPlannerCard } from '@/components/trips/TripPlannerCard';
import { TripActivity } from '@/components/trips/TripActivity';
import { QuickAdd } from '@/components/trips/QuickAdd';
import { CreateTripModal } from '@/components/trips/CreateTripModal';
import { apiFetch } from '@/lib/api/fetcher';
import { GetTripsResponse } from '@/types/api';
import { useSession } from 'next-auth/react';
import { SavedMoments } from '@/components/moments/SavedMoments';

export default function PlannerPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['myTrips'],
    queryFn: async () => {
      // First get my user ID, then fetch trips
      const meRes = await apiFetch<{ user: { id: string } }>('/api/users/me');
      return apiFetch<GetTripsResponse>(`/api/trips?userId=${meRes.user.id}`);
    },
    enabled: !!session,
  });

  const trips = data?.items || [];

  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trip List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-3xl font-bold gradient-text-135">Trip Planning</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
            >
              + New Trip
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-6">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-20 mb-4" />
                  <div className="h-8 bg-gray-200 rounded w-48 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-32 mb-4" />
                  <div className="h-12 bg-gray-200 rounded mb-4" />
                  <div className="h-12 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          ) : trips.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <p className="text-4xl mb-3">✈️</p>
              <p className="text-gray-500 text-lg">No trips yet!</p>
              <p className="text-gray-400 text-sm mt-1">
                Start planning your next adventure.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
              >
                Create Your First Trip
              </button>
            </div>
          ) : (
            trips.map((trip) => <TripPlannerCard key={trip.id} trip={trip} />)
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <SavedMoments />
          <TripActivity />
          <QuickAdd />
        </div>
      </div>

      <CreateTripModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={() => {
          queryClient.invalidateQueries({ queryKey: ['myTrips'] });
          queryClient.invalidateQueries({ queryKey: ['currentUser'] });
        }}
      />
    </div>
  );
}
