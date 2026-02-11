'use client';

import { TripCard } from '@/types/trip';

interface TripPlannerCardProps {
  trip: TripCard;
}

export function TripPlannerCard({ trip }: TripPlannerCardProps) {
  const statusConfig = {
    PLANNING: { label: 'Planning', color: 'bg-blue-100 text-blue-700' },
    IN_PROGRESS: { label: 'Active', color: 'bg-green-100 text-green-700' },
    COMPLETED: { label: 'Completed', color: 'bg-gray-100 text-gray-700' },
  };

  const config = statusConfig[trip.status];
  const isActive = trip.status === 'IN_PROGRESS' || trip.status === 'PLANNING';

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const dateRange =
    trip.startDate && trip.endDate
      ? `${formatDate(trip.startDate)} - ${formatDate(trip.endDate)}`
      : trip.startDate
      ? `From ${formatDate(trip.startDate)}`
      : 'Dates TBD';

  return (
    <div className={`trip-card bg-white rounded-2xl shadow-lg p-6 ${!isActive ? 'opacity-80' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${config.color}`}>
            {config.label}
          </span>
          <h3 className="text-2xl font-bold mt-2">{trip.title}</h3>
          <p className="text-gray-600">{dateRange}</p>
        </div>
        <button className="text-gray-400 hover:text-gray-600 p-1">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>

      {/* Destination */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          <span className="destination-tag bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold">
            {trip.city.name}, {trip.city.country.name}
          </span>
          {trip.stopCount > 0 && (
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
              {trip.stopCount} stop{trip.stopCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-purple-50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-purple-600">{trip.stopCount}</div>
          <div className="text-xs text-gray-600">Places</div>
        </div>
        <div className="bg-pink-50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-pink-600">{trip.likeCount}</div>
          <div className="text-xs text-gray-600">Likes</div>
        </div>
        <div className="bg-blue-50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-blue-600">{trip.status === 'COMPLETED' ? 'Done' : 'Go'}</div>
          <div className="text-xs text-gray-600">Status</div>
        </div>
      </div>

      {/* CTA Button */}
      <button
        className={`w-full py-3 rounded-xl font-semibold transition-all ${
          isActive
            ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:shadow-lg'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        {isActive ? 'View Trip Details' : 'View Memories'}
      </button>
    </div>
  );
}
