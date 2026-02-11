'use client';

import { TripPlannerData } from '@/lib/mock-data';

interface TripPlannerCardProps {
  trip: TripPlannerData;
}

export function TripPlannerCard({ trip }: TripPlannerCardProps) {
  const isActive = trip.status === 'Active';

  return (
    <div className={`trip-card bg-white rounded-2xl shadow-lg p-6 ${!isActive ? 'opacity-80' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              isActive
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {trip.status}
          </span>
          <h3 className="text-2xl font-bold mt-2">{trip.title}</h3>
          <p className="text-gray-600">
            {trip.dateRange} • {trip.duration}
          </p>
        </div>
        <button className="text-gray-400 hover:text-gray-600 p-1">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>

      {/* Trip Members */}
      {trip.members && trip.members.length > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm font-semibold text-gray-700">Trip Members:</span>
          <div className="flex -space-x-2">
            {trip.members.slice(0, 3).map((member) => (
              <img
                key={member.id}
                src={member.avatarUrl}
                alt={member.name}
                className="member-avatar w-8 h-8 rounded-full object-cover"
              />
            ))}
            {trip.members.length > 3 && (
              <div className="member-avatar w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-bold">
                +{trip.members.length - 3}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Destinations */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {trip.destinations.map((dest) => (
            <span
              key={dest.name}
              className={`destination-tag ${dest.color} px-3 py-1 rounded-full text-sm font-semibold`}
            >
              📍 {dest.name}
            </span>
          ))}
        </div>
      </div>

      {/* Progress bar (for active trips) */}
      {isActive && trip.progress !== undefined && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-semibold text-gray-700">Planning Progress</span>
            <span className="text-purple-600 font-bold">{trip.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-purple-600 to-pink-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${trip.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Quick Stats */}
      {isActive && trip.stats && (
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-purple-50 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-purple-600">{trip.stats.placesSaved}</div>
            <div className="text-xs text-gray-600">Places Saved</div>
          </div>
          <div className="bg-pink-50 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-pink-600">{trip.stats.bookings}</div>
            <div className="text-xs text-gray-600">Bookings Made</div>
          </div>
          <div className="bg-blue-50 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-blue-600">{trip.stats.estBudget}</div>
            <div className="text-xs text-gray-600">Est. Budget</div>
          </div>
        </div>
      )}

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
