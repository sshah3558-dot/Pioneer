'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { PlaceCard } from '@/components/places/PlaceCard';
import { apiFetch } from '@/lib/api/fetcher';
import { GetPlacesResponse } from '@/types/api';

const categoryFilters = [
  { label: 'All', value: '' },
  { label: 'Restaurants', value: 'RESTAURANT' },
  { label: 'Cafes', value: 'CAFE' },
  { label: 'Markets', value: 'MARKET' },
  { label: 'Monuments', value: 'MONUMENT' },
  { label: 'Parks', value: 'PARK' },
  { label: 'Viewpoints', value: 'VIEWPOINT' },
  { label: 'Hidden Gems', value: 'HIDDEN_GEM' },
];

export default function ExplorePage() {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('');

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(searchInput), 300);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const queryParams = new URLSearchParams();
  if (debouncedSearch) queryParams.set('search', debouncedSearch);
  if (activeCategory) queryParams.set('categories', activeCategory);
  queryParams.set('pageSize', '20');

  const { data, isLoading } = useQuery({
    queryKey: ['places', debouncedSearch, activeCategory],
    queryFn: () => apiFetch<GetPlacesResponse>(`/api/places?${queryParams.toString()}`),
  });

  const places = data?.items || [];

  const handleSave = async (placeId: string) => {
    const place = places.find((p) => p.id === placeId);
    if (!place) return;

    try {
      if (place.isSaved) {
        await fetch(`/api/places/${placeId}/save`, { method: 'DELETE' });
      } else {
        await fetch(`/api/places/${placeId}/save`, { method: 'POST' });
      }
    } catch (err) {
      console.error('Save toggle failed:', err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Explore</h1>
        <p className="text-gray-500 text-sm">Discover amazing places around the world</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          placeholder="Search places, restaurants, cafes..."
          className="pl-10"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categoryFilters.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setActiveCategory(cat.value)}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
              activeCategory === cat.value
                ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Places Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-2xl overflow-hidden bg-white shadow-lg animate-pulse">
              <div className="h-40 bg-gray-200" />
              <div className="p-4 space-y-2">
                <div className="h-5 bg-gray-200 rounded w-32" />
                <div className="h-4 bg-gray-200 rounded w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : places.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No places found.</p>
          <p className="text-gray-400 text-sm mt-1">
            {debouncedSearch ? 'Try a different search term.' : 'Check back soon for new places!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {places.map((place) => (
            <PlaceCard key={place.id} place={place} onSave={handleSave} />
          ))}
        </div>
      )}
    </div>
  );
}
