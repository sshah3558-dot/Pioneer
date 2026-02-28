'use client';

import Image from 'next/image';
import { ScoreBadge } from './ScoreBadge';
import { ChevronDown, ChevronUp, MapPin, Star } from 'lucide-react';
import { useState } from 'react';

interface RankingCardProps {
  moment: {
    id: string;
    rank: number | null;
    content: string;
    imageUrl: string | null;
    imageUrl2?: string | null;
    imageUrl3?: string | null;
    compositeScore: number | null;
    overallRating: number | null;
    valueRating: number | null;
    authenticityRating: number | null;
    crowdRating: number | null;
    place?: {
      name: string;
      cityName?: string;
      countryName?: string;
    } | null;
    createdAt: string;
  };
}

export function RankingCard({ moment }: RankingCardProps) {
  const [expanded, setExpanded] = useState(false);

  const ratingPill = (label: string, value: number | null) => {
    if (value === null) return null;
    return (
      <span className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
        {label}: {value}/5
      </span>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden card-hover">
      <div
        className="flex items-center gap-4 p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Rank number */}
        <div className="flex flex-col items-center min-w-[40px]">
          <span className="text-2xl font-bold text-gray-300 dark:text-gray-600">#{moment.rank || '-'}</span>
        </div>

        {/* Score badge */}
        {moment.compositeScore != null && (
          <ScoreBadge score={moment.compositeScore} size="md" />
        )}

        {/* Photo thumbnail */}
        {moment.imageUrl && (
          <Image
            src={moment.imageUrl}
            alt=""
            width={64}
            height={64}
            className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
          />
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-gray-900 dark:text-gray-100 font-medium text-sm line-clamp-1">{moment.content}</p>
          {moment.place && (
            <p className="text-gray-500 dark:text-gray-400 text-xs flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3" />
              {moment.place.name}{moment.place.cityName ? `, ${moment.place.cityName}` : ''}
            </p>
          )}
        </div>

        {/* Expand toggle */}
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
        )}
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700 pt-3">
          {/* Photos */}
          <div className="flex gap-2 mb-3 overflow-x-auto">
            {[moment.imageUrl, moment.imageUrl2, moment.imageUrl3].filter(Boolean).map((url, i) => (
              <Image key={i} src={url!} alt="" width={400} height={192} className="h-48 rounded-xl object-cover" />
            ))}
          </div>

          {/* Full content */}
          <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">{moment.content}</p>

          {/* Rating pills */}
          <div className="flex flex-wrap gap-2">
            {ratingPill('Overall', moment.overallRating)}
            {ratingPill('Value', moment.valueRating)}
            {ratingPill('Authenticity', moment.authenticityRating)}
            {ratingPill('Crowd', moment.crowdRating)}
          </div>
        </div>
      )}
    </div>
  );
}
