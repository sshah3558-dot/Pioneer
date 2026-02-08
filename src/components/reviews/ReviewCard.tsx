'use client';

import Link from 'next/link';
import { Heart, MoreHorizontal, Image as ImageIcon } from 'lucide-react';
import { ReviewCard as ReviewCardType } from '@/types/review';
import { Avatar } from '@/components/shared/UserPreview';
import { RatingStars } from '@/components/shared/RatingStars';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface ReviewCardProps {
  review: ReviewCardType;
  showPlace?: boolean;
  className?: string;
}

export function ReviewCard({
  review,
  showPlace = true,
  className,
}: ReviewCardProps) {
  const [isLiked, setIsLiked] = useState(review.isLiked);
  const [likeCount, setLikeCount] = useState(review.likeCount);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className={cn('bg-white rounded-2xl shadow-sm p-4 space-y-3', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/users/${review.user.username}`}>
            <Avatar src={review.user.avatarUrl} alt={review.user.name || 'User'} size="sm" />
          </Link>
          <div>
            <Link
              href={`/users/${review.user.username}`}
              className="font-semibold text-gray-900 hover:underline"
            >
              {review.user.name}
            </Link>
            <p className="text-xs text-gray-500">{formatDate(review.createdAt)}</p>
          </div>
        </div>
        <button className="p-1 hover:bg-gray-100 rounded-full transition-colors">
          <MoreHorizontal className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Place info */}
      {showPlace && review.place && (
        <Link
          href={`/places/${review.place.id}`}
          className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {review.place.imageUrl && (
            <img
              src={review.place.imageUrl}
              alt={review.place.name}
              className="w-12 h-12 rounded-lg object-cover"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">{review.place.name}</p>
            <p className="text-sm text-gray-500 truncate">{review.place.neighborhood}</p>
          </div>
        </Link>
      )}

      {/* Rating */}
      <div className="flex items-center gap-2">
        <RatingStars rating={review.overallRating} size="sm" />
        <span className="font-semibold text-gray-900">{review.overallRating.toFixed(1)}</span>
      </div>

      {/* Content */}
      {review.title && (
        <h3 className="font-semibold text-gray-900">{review.title}</h3>
      )}
      <p className="text-gray-700 text-sm leading-relaxed">{review.content}</p>

      {/* Photo indicator */}
      {review.photoCount > 0 && (
        <div className="flex items-center gap-1.5 text-gray-500 text-sm">
          <ImageIcon className="w-4 h-4" />
          <span>{review.photoCount} photo{review.photoCount > 1 ? 's' : ''}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <button
          onClick={handleLike}
          className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <Heart className={cn('w-4 h-4', isLiked && 'fill-red-500 text-red-500')} />
          <span className="text-sm">{likeCount} helpful</span>
        </button>
        <span className="text-xs text-gray-400">
          Was this helpful?
        </span>
      </div>
    </div>
  );
}
