'use client';

import { TripPlannerCard } from '@/components/trips/TripPlannerCard';
import { TripActivity } from '@/components/trips/TripActivity';
import { QuickAdd } from '@/components/trips/QuickAdd';
import { mockTripPlannerData } from '@/lib/mock-data';

export default function PlannerPage() {
  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trip List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-3xl font-bold gradient-text-135">✈️ Trip Planning</h2>
            <button className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all">
              + New Trip
            </button>
          </div>

          {mockTripPlannerData.map((trip) => (
            <TripPlannerCard key={trip.id} trip={trip} />
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <TripActivity />
          <QuickAdd />
        </div>
      </div>
    </div>
  );
}
