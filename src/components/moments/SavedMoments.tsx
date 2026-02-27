'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/fetcher';
import { Bookmark, MapPin, Plus } from 'lucide-react';
import { ScoreBadge } from './ScoreBadge';

interface SavedMomentsProps {
  onAddToTrip?: (momentId: string, placeName: string) => void;
}

export function SavedMoments({ onAddToTrip }: SavedMomentsProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['savedMoments'],
    queryFn: () => apiFetch<{
      items: Array<{
        id: string;
        content: string;
        imageUrl: string | null;
        compositeScore: number | null;
        place: {
          id: string;
          name: string;
          cityName?: string;
          countryName?: string;
        } | null;
        user: {
          name: string | null;
          avatarUrl: string | null;
        };
      }>;
    }>('/api/moments?saved=true'),
  });

  const moments = data?.items || [];

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-xl" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Bookmark className="w-5 h-5 text-purple-600 fill-purple-600" />
        <h3 className="font-bold text-lg dark:text-white">Saved Moments</h3>
        <span className="text-xs bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full font-medium">
          {moments.length}
        </span>
      </div>

      {moments.length === 0 ? (
        <p className="text-gray-400 dark:text-gray-500 text-sm">No saved moments yet. Save moments from the Explore page!</p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {moments.map((moment) => (
            <div key={moment.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              {moment.imageUrl ? (
                <img src={moment.imageUrl} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-gray-400" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1">{moment.content}</p>
                {moment.place && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {moment.place.name}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {moment.compositeScore != null && (
                  <ScoreBadge score={moment.compositeScore} size="sm" />
                )}
                {onAddToTrip && moment.place && (
                  <button
                    onClick={() => onAddToTrip(moment.id, moment.place!.name)}
                    className="p-1.5 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800/50 transition-colors"
                    title="Add to trip"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
