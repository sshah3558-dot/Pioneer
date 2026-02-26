'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RankingCard } from '@/components/moments/RankingCard';
import { CreateMoment } from '@/components/moments/CreateMoment';
import { apiFetch } from '@/lib/api/fetcher';
import { Trophy, Plus } from 'lucide-react';

export default function RankingsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['myRankings'],
    queryFn: () => apiFetch<{ items: Array<{
      id: string;
      content: string;
      imageUrl: string | null;
      imageUrl2: string | null;
      imageUrl3: string | null;
      likeCount: number;
      viewCount: number;
      overallRating: number | null;
      valueRating: number | null;
      authenticityRating: number | null;
      crowdRating: number | null;
      compositeScore: number | null;
      rank: number | null;
      createdAt: string;
      place: {
        id: string;
        name: string;
        category: string;
        imageUrl: string | null;
        cityName: string;
        countryName: string;
      } | null;
    }>; total: number; hasMore: boolean }>('/api/posts?userId=me&pageSize=50'),
  });

  // Sort by rank (ranked moments first, then unranked)
  const moments = (data?.items || [])
    .filter(m => m.compositeScore !== null)
    .sort((a, b) => (a.rank || 999) - (b.rank || 999));

  const unrankedPosts = (data?.items || []).filter(m => m.compositeScore === null);

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Trophy className="w-7 h-7 sm:w-8 sm:h-8 text-yellow-500 flex-shrink-0" />
          <h2 className="text-2xl sm:text-3xl font-bold gradient-text-135">My Rankings</h2>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold hover:shadow-lg transition-all flex items-center gap-2 text-sm sm:text-base flex-shrink-0"
        >
          <Plus className="w-5 h-5" />
          New Moment
        </button>
      </div>

      {/* Rankings list */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : moments.length === 0 && unrankedPosts.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-12 text-center">
          <Trophy className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No moments yet</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Create your first moment to start ranking your experiences!</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
          >
            Create Your First Moment
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {moments.map((moment) => (
            <RankingCard key={moment.id} moment={moment} />
          ))}
        </div>
      )}

      <CreateMoment isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
    </div>
  );
}
