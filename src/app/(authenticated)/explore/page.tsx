'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { PlaceCard } from '@/components/places/PlaceCard';
import { mockPlaces } from '@/lib/mock-data';

export default function ExplorePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Explore</h1>
        <p className="text-gray-500 text-sm">Discover amazing places in Lisbon</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          placeholder="Search places, restaurants, cafes..."
          className="pl-10"
        />
      </div>

      {/* Coming Soon Banner */}
      <div className="gradient-primary rounded-2xl p-6 text-white text-center">
        <h2 className="text-xl font-bold mb-2">Explore Mode - Coming Soon!</h2>
        <p className="text-white/80">
          AI-powered discovery features will be available in Phase 2.
          For now, here are some popular places.
        </p>
      </div>

      {/* Places Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {mockPlaces.map((place) => (
          <PlaceCard key={place.id} place={place} />
        ))}
      </div>
    </div>
  );
}
