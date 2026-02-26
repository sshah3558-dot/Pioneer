'use client';

import Link from 'next/link';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal } from 'lucide-react';
import { FeedActivity } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { ScoreBadge } from '@/components/moments/ScoreBadge';

interface FeedCardProps {
  activity: FeedActivity;
  className?: string;
}

export function FeedCard({ activity, className }: FeedCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(activity.trip?.likeCount || activity.review?.likeCount || 0);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getDescription = () => {
    if (activity.type === 'review_posted' && activity.review) {
      return activity.review.content;
    }
    if (activity.type === 'trip_completed' && activity.trip) {
      return `Just completed an amazing trip to ${activity.trip.city.name}, ${activity.trip.city.country.name}! ${activity.trip.stopCount} incredible stops along the way.`;
    }
    if (activity.type === 'trip_started' && activity.trip) {
      return `Starting a new adventure to ${activity.trip.city.name}, ${activity.trip.city.country.name}! Can't wait to explore!`;
    }
    if (activity.type === 'photos_uploaded' && activity.trip) {
      return `Uploaded ${activity.photoCount} new photos from ${activity.trip.city.name}. Check them out!`;
    }
    if (activity.type === 'place_saved' && activity.place) {
      return `Saved ${activity.place.name} to their travel list. Located in ${activity.place.neighborhood || activity.place.cityName}.`;
    }
    if (activity.type === 'follow' && activity.follow) {
      return `Started following ${activity.follow.following.name || activity.follow.following.username}`;
    }
    if (activity.type === 'post' && activity.post) {
      return activity.post.content;
    }
    return '';
  };

  const getLocationText = () => {
    if (activity.trip) {
      return `${activity.trip.city.name}, ${activity.trip.city.country.name}`;
    }
    if (activity.place) {
      return `${activity.place.cityName || ''}, ${activity.place.countryName || ''}`;
    }
    return '';
  };

  const getImage = () => {
    if (activity.trip?.coverImageUrl) return activity.trip.coverImageUrl;
    if (activity.place?.imageUrl) return activity.place.imageUrl;
    if (activity.post?.imageUrl) return activity.post.imageUrl;
    return null;
  };

  const getLink = () => {
    if (activity.type === 'follow' && activity.follow) return `/users/${activity.follow.following.username}`;
    if (activity.type === 'post') return '#';
    if (activity.trip) return `/trips/${activity.trip.id}`;
    if (activity.place) return `/places/${activity.place.id}`;
    return '#';
  };

  const getTags = () => {
    const tags: { label: string; color: string }[] = [];
    if (activity.rating) {
      tags.push({ label: `⭐ ${activity.rating}/5`, color: 'bg-yellow-100 text-yellow-800' });
    }
    if (activity.place?.priceLevel === 'BUDGET') {
      tags.push({ label: '💰 Budget Friendly', color: 'bg-green-100 text-green-800' });
    }
    if (activity.place?.tags?.includes('local-favorite')) {
      tags.push({ label: '🌟 Hidden Gem', color: 'bg-purple-100 text-purple-800' });
    }
    if (activity.type === 'photos_uploaded') {
      tags.push({ label: `📸 ${activity.photoCount} Photos`, color: 'bg-blue-100 text-blue-800' });
    }
    return tags;
  };

  const image = getImage();
  const tags = getTags();

  return (
    <div className={cn('post-card dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden', className)}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <Link href={`/users/${activity.user.username}`}>
            <img
              src={activity.user.avatarUrl || ''}
              alt={activity.user.name || 'User'}
              className="w-12 h-12 rounded-full border-2 border-purple-300 object-cover"
            />
          </Link>
          <div className="flex-1">
            <Link href={`/users/${activity.user.username}`} className="font-bold text-gray-900 dark:text-gray-100 hover:underline">
              {activity.user.name}
            </Link>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              📍 {getLocationText()} • {formatTimeAgo(activity.timestamp)}
            </div>
          </div>
          <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Description */}
        <p className="text-gray-700 dark:text-gray-300 mb-4">{getDescription()}</p>

        {/* Image */}
        {image && (
          <div className="relative mb-4">
            <Link href={getLink()}>
              <img
                src={image}
                alt=""
                className="w-full h-80 object-cover rounded-xl"
              />
            </Link>
            {activity.post?.compositeScore && (
              <div className="absolute top-3 right-3">
                <ScoreBadge score={activity.post.compositeScore} size="md" />
              </div>
            )}
          </div>
        )}

        {/* Tag pills */}
        {tags.length > 0 && (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {tags.map((tag, i) => (
              <span
                key={i}
                className={`${tag.color} px-3 py-1 rounded-full text-sm font-semibold`}
              >
                {tag.label}
              </span>
            ))}
          </div>
        )}

        {/* Moment ratings */}
        {activity.post?.overallRating && (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-semibold">
              Overall: {activity.post.overallRating}/5
            </span>
            {activity.post.valueRating && (
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                Value: {activity.post.valueRating}/5
              </span>
            )}
            {activity.post.authenticityRating && (
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                Authenticity: {activity.post.authenticityRating}/5
              </span>
            )}
            {activity.post.crowdRating && (
              <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-semibold">
                Crowd: {activity.post.crowdRating}/5
              </span>
            )}
          </div>
        )}

        {/* Action bar */}
        <div className="flex items-center justify-between pt-4 border-t dark:border-gray-700">
          <button
            onClick={handleLike}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors"
          >
            <Heart className={cn('like-btn w-6 h-6', isLiked && 'fill-red-500 text-red-500 like-btn-active')} />
            <span className="font-semibold">{likeCount}</span>
          </button>
          <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-500 transition-colors">
            <MessageCircle className="w-6 h-6" />
            <span className="font-semibold">Comment</span>
          </button>
          <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-500 transition-colors">
            <Share2 className="w-6 h-6" />
            <span className="font-semibold">Share</span>
          </button>
          <button
            onClick={() => setIsSaved(!isSaved)}
            className="text-gray-600 dark:text-gray-400 hover:text-purple-500 transition-colors"
          >
            <Bookmark className={cn('w-6 h-6', isSaved && 'fill-[#667eea] text-[#667eea]')} />
          </button>
        </div>
      </div>
    </div>
  );
}
