'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Bookmark, Eye, MapPin } from 'lucide-react';
import { ScoreBadge } from './ScoreBadge';
import { useTrackView } from '@/lib/hooks/useTrackView';
import { tracker } from '@/lib/tracking/event-tracker';

interface MomentCardProps {
  moment: {
    id: string;
    content: string;
    imageUrl: string | null;
    compositeScore: number | null;
    viewCount: number;
    user: {
      id: string;
      name: string | null;
      username: string | null;
      avatarUrl: string | null;
    };
    place: {
      name: string;
      cityName?: string;
      countryName?: string;
    } | null;
    isSaved: boolean;
  };
  onToggleSave: (id: string, currentlySaved: boolean) => void | Promise<void>;
}

export function MomentCard({ moment, onToggleSave }: MomentCardProps) {
  const [saved, setSaved] = useState(moment.isSaved);
  const viewRef = useTrackView(moment.id, 'MOMENT');

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const previousState = saved;
    const newState = !saved;
    // Optimistically toggle
    setSaved(newState);
    tracker?.track(newState ? 'SAVE' : 'UNSAVE', moment.id, 'MOMENT');
    try {
      // Pass the previous state so the parent knows which HTTP method to use
      await onToggleSave(moment.id, previousState);
    } catch (err) {
      console.error('Failed to save moment:', err);
      // Roll back on failure
      setSaved(previousState);
    }
  };

  return (
    <div ref={viewRef} className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden card-hover">
      {/* Image with score badge */}
      <div className="relative">
        {moment.imageUrl ? (
          <Image
            src={moment.imageUrl}
            alt=""
            width={800}
            height={300}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 flex items-center justify-center">
            <MapPin className="w-8 h-8 text-purple-300 dark:text-purple-500" />
          </div>
        )}

        {/* Score badge top-right */}
        {moment.compositeScore != null && (
          <div className="absolute top-3 right-3">
            <ScoreBadge score={moment.compositeScore} size="sm" />
          </div>
        )}

        {/* Save button bottom-right (Instagram-style) */}
        <button
          onClick={handleSave}
          className="absolute bottom-3 right-3 p-2 bg-black/30 hover:bg-black/50 rounded-full transition-colors"
        >
          <Bookmark
            className={`w-5 h-5 transition-colors ${
              saved ? 'fill-white text-white' : 'text-white'
            }`}
          />
        </button>
      </div>

      {/* Card content */}
      <div className="p-3">
        {/* User info */}
        <div className="flex items-center gap-2 mb-2">
          <Image
            src={moment.user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(moment.user.name || 'U')}&background=667eea&color=fff&size=32`}
            alt=""
            width={24}
            height={24}
            className="w-6 h-6 rounded-full object-cover"
          />
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {moment.user.name || moment.user.username || 'Anonymous'}
          </span>
        </div>

        {/* Place info */}
        {moment.place && (
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-1">
            <MapPin className="w-3 h-3" />
            {moment.place.name}
            {moment.place.cityName && `, ${moment.place.cityName}`}
          </p>
        )}

        {/* Content preview */}
        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{moment.content}</p>

        {/* View count */}
        {moment.viewCount > 0 && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {moment.viewCount} views
          </p>
        )}
      </div>
    </div>
  );
}
