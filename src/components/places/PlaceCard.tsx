'use client';

import Link from 'next/link';
import { Bookmark, MapPin } from 'lucide-react';
import { PlaceCard as PlaceCardType } from '@/types/place';
import { RatingStars } from '@/components/shared/RatingStars';
import { CategoryBadge, TagBadge } from '@/components/shared/CategoryBadge';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface PlaceCardProps {
  place: PlaceCardType;
  variant?: 'default' | 'compact' | 'horizontal';
  className?: string;
  onSave?: (placeId: string) => void;
}

export function PlaceCard({ place, variant = 'default', className, onSave }: PlaceCardProps) {
  const [isSaved, setIsSaved] = useState(place.isSaved);

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSaved(!isSaved);
    onSave?.(place.id);
  };

  const priceSymbols: Record<string, string> = {
    FREE: 'Free',
    BUDGET: '$',
    MODERATE: '$$',
    EXPENSIVE: '$$$',
    LUXURY: '$$$$',
  };

  if (variant === 'horizontal') {
    return (
      <Link href={`/places/${place.id}`} className={cn('block', className)}>
        <div className="flex gap-3 p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 relative">
            {place.imageUrl ? (
              <img
                src={place.imageUrl}
                alt={place.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#667eea] to-[#764ba2]" />
            )}
            <button
              onClick={handleSave}
              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white/90 flex items-center justify-center"
            >
              <Bookmark className={cn('w-3 h-3', isSaved ? 'fill-[#667eea] text-[#667eea]' : 'text-gray-600')} />
            </button>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-gray-900 truncate">{place.name}</h3>
              {place.priceLevel && (
                <span className="text-sm text-gray-500 flex-shrink-0">
                  {priceSymbols[place.priceLevel]}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3" />
              {place.neighborhood}
              {place.cityName && `, ${place.cityName}`}
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <CategoryBadge category={place.category} size="sm" />
            </div>
            {place.avgOverallRating && (
              <div className="flex items-center gap-2 mt-2">
                <RatingStars rating={place.avgOverallRating} size="sm" showValue />
                <span className="text-xs text-gray-400">({place.totalReviewCount})</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link href={`/places/${place.id}`} className={cn('block', className)}>
        <div className="flex gap-3 p-2 bg-white rounded-lg hover:bg-gray-50 transition-colors">
          <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
            {place.imageUrl ? (
              <img
                src={place.imageUrl}
                alt={place.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#667eea] to-[#764ba2]" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 truncate text-sm">{place.name}</h3>
            <p className="text-xs text-gray-500 truncate">{place.neighborhood}</p>
            {place.avgOverallRating && (
              <div className="flex items-center gap-1 mt-1">
                <RatingStars rating={place.avgOverallRating} size="sm" />
                <span className="text-xs text-gray-400">{place.avgOverallRating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/places/${place.id}`} className={cn('block', className)}>
      <div className="rounded-2xl overflow-hidden bg-white shadow-lg hover:shadow-xl transition-shadow">
        {/* Image */}
        <div className="relative h-40 overflow-hidden">
          {place.imageUrl ? (
            <img
              src={place.imageUrl}
              alt={place.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#667eea] to-[#764ba2]" />
          )}

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors"
          >
            <Bookmark className={cn('w-4 h-4', isSaved ? 'fill-[#667eea] text-[#667eea]' : 'text-gray-600')} />
          </button>

          {/* Category Badge */}
          <div className="absolute bottom-3 left-3">
            <CategoryBadge category={place.category} size="sm" />
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-2">
          {/* Title and Price */}
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-gray-900">{place.name}</h3>
            {place.priceLevel && (
              <span className="text-sm text-gray-500 font-medium">
                {priceSymbols[place.priceLevel]}
              </span>
            )}
          </div>

          {/* Location */}
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {place.neighborhood}
            {place.distance !== undefined && (
              <span className="text-gray-400">
                {' '}
                ({place.distance < 1 ? `${Math.round(place.distance * 1000)}m` : `${place.distance.toFixed(1)}km`})
              </span>
            )}
          </p>

          {/* Rating */}
          {place.avgOverallRating && (
            <div className="flex items-center gap-2">
              <RatingStars rating={place.avgOverallRating} size="sm" showValue />
              <span className="text-xs text-gray-400">
                ({place.totalReviewCount.toLocaleString()} reviews)
              </span>
            </div>
          )}

          {/* Tags */}
          {place.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {place.tags.slice(0, 3).map((tag) => (
                <TagBadge key={tag} tag={tag} size="sm" />
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
