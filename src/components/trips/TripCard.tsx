'use client';

import Link from 'next/link';
import { Heart, MapPin, Calendar, MoreHorizontal } from 'lucide-react';
import { TripCard as TripCardType } from '@/types/trip';
import { Avatar } from '@/components/shared/UserPreview';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface TripCardProps {
  trip: TripCardType;
  variant?: 'default' | 'compact';
  className?: string;
  onLike?: (tripId: string) => void;
}

export function TripCard({ trip, variant = 'default', className, onLike }: TripCardProps) {
  const [isLiked, setIsLiked] = useState(trip.isLiked);
  const [likeCount, setLikeCount] = useState(trip.likeCount);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    onLike?.(trip.id);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  };

  const statusColors = {
    PLANNING: 'bg-blue-100 text-blue-700',
    IN_PROGRESS: 'bg-green-100 text-green-700',
    COMPLETED: 'bg-purple-100 text-purple-700',
  };

  if (variant === 'compact') {
    return (
      <Link href={`/trips/${trip.id}`} className={cn('block', className)}>
        <div className="flex gap-3 p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
            {trip.coverImageUrl ? (
              <img
                src={trip.coverImageUrl}
                alt={trip.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#667eea] to-[#764ba2]" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{trip.title}</h3>
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3" />
              {trip.city.name}, {trip.city.country.name}
            </p>
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
              <span>{trip.stopCount} stops</span>
              <span className="flex items-center gap-1">
                <Heart className={cn('w-3 h-3', isLiked && 'fill-red-500 text-red-500')} />
                {likeCount}
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/trips/${trip.id}`} className={cn('block', className)}>
      <div className="rounded-2xl overflow-hidden bg-white shadow-lg hover:shadow-xl transition-shadow">
        {/* Cover Image */}
        <div className="relative h-48 overflow-hidden">
          {trip.coverImageUrl ? (
            <img
              src={trip.coverImageUrl}
              alt={trip.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#667eea] to-[#764ba2]" />
          )}

          {/* Status Badge */}
          <div className={cn(
            'absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium',
            statusColors[trip.status]
          )}>
            {trip.status === 'IN_PROGRESS' ? 'In Progress' : trip.status.charAt(0) + trip.status.slice(1).toLowerCase()}
          </div>

          {/* Like Button */}
          <button
            onClick={handleLike}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors"
          >
            <Heart className={cn('w-4 h-4', isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600')} />
          </button>

          {/* Location overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
            <div className="flex items-center gap-1 text-white text-sm">
              <MapPin className="w-4 h-4" />
              <span>{trip.city.name}, {trip.city.country.name}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* User */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar src={trip.user.avatarUrl} alt={trip.user.name || 'User'} size="sm" />
              <div>
                <p className="text-sm font-medium text-gray-900">{trip.user.name}</p>
                <p className="text-xs text-gray-500">@{trip.user.username}</p>
              </div>
            </div>
            <button className="p-1 hover:bg-gray-100 rounded-full">
              <MoreHorizontal className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-lg text-gray-900">{trip.title}</h3>

          {/* Meta */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            {trip.startDate && (
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(trip.startDate)}
              </span>
            )}
            <span>{trip.stopCount} stops</span>
            <span className="flex items-center gap-1">
              <Heart className={cn('w-4 h-4', isLiked && 'fill-red-500 text-red-500')} />
              {likeCount}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
