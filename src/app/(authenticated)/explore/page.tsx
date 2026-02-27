'use client';

import { useState, useEffect } from 'react';
import { Search, Sparkles, Eye, TrendingUp } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MomentCard } from '@/components/moments/MomentCard';
import { apiFetch } from '@/lib/api/fetcher';

type FilterType = 'recommended' | 'mostViewed' | 'topRated';

const filters: { label: string; value: FilterType; icon: React.ReactNode }[] = [
  { label: 'Recommended', value: 'recommended', icon: <Sparkles className="w-4 h-4" /> },
  { label: 'Most Viewed', value: 'mostViewed', icon: <Eye className="w-4 h-4" /> },
  { label: 'Top Rated', value: 'topRated', icon: <TrendingUp className="w-4 h-4" /> },
];

export default function ExplorePage() {
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('recommended');
  const [country, setCountry] = useState('');

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(searchInput), 300);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const queryParams = new URLSearchParams();
  queryParams.set('filter', activeFilter);
  if (debouncedSearch) queryParams.set('search', debouncedSearch);
  if (country) queryParams.set('country', country);
  queryParams.set('pageSize', '20');

  const { data, isLoading } = useQuery({
    queryKey: ['moments', activeFilter, debouncedSearch, country],
    queryFn: () => apiFetch<{
      items: Array<{
        id: string;
        content: string;
        imageUrl: string | null;
        compositeScore: number | null;
        viewCount: number;
        user: { id: string; name: string | null; username: string | null; avatarUrl: string | null };
        place: { name: string; cityName?: string; countryName?: string } | null;
        isSaved: boolean;
      }>;
      total: number;
      hasMore: boolean;
    }>(`/api/moments?${queryParams.toString()}`),
  });

  const moments = data?.items || [];

  const handleToggleSave = async (momentId: string, currentlySaved: boolean) => {
    try {
      if (currentlySaved) {
        await fetch(`/api/moments/${momentId}/save`, { method: 'DELETE' });
      } else {
        await fetch(`/api/moments/${momentId}/save`, { method: 'POST' });
      }
      queryClient.invalidateQueries({ queryKey: ['moments'] });
      queryClient.invalidateQueries({ queryKey: ['savedMoments'] });
    } catch (err) {
      console.error('Save toggle failed:', err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold gradient-text-135">Explore Moments</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Discover amazing experiences from travelers worldwide</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          placeholder="Search moments, places, countries..."
          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all dark:text-gray-100 dark:placeholder-gray-400"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>

      {/* Filter pills + Country dropdown */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setActiveFilter(f.value)}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeFilter === f.value
                ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {f.icon}
            {f.label}
          </button>
        ))}

        {/* Country filter */}
        <input
          type="text"
          placeholder="Filter by country..."
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="px-3 sm:px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none w-36 sm:w-48"
        />
      </div>

      {/* Moments Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-2xl overflow-hidden bg-white dark:bg-gray-900 shadow-lg animate-pulse">
              <div className="h-48 bg-gray-200 dark:bg-gray-700" />
              <div className="p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                </div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : moments.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">No moments found.</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
            {debouncedSearch || country ? 'Try different search criteria.' : 'Check back soon for new moments!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {moments.map((moment) => (
            <MomentCard
              key={moment.id}
              moment={moment}
              onToggleSave={handleToggleSave}
            />
          ))}
        </div>
      )}
    </div>
  );
}
