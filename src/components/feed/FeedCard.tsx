'use client';

import Link from 'next/link';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Trash2 } from 'lucide-react';
import { FeedActivity } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { useState, useRef, useEffect } from 'react';
import { ScoreBadge } from '@/components/moments/ScoreBadge';
import { useQueryClient } from '@tanstack/react-query';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';

interface FeedCardProps {
  activity: FeedActivity;
  className?: string;
}

export function FeedCard({ activity, className }: FeedCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(activity.trip?.likeCount || activity.review?.likeCount || 0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { user: currentUser } = useCurrentUser();

  // Close menu on outside click
  useEffect(() => {
    if (!showMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleDelete = async () => {
    if (!activity.post?.id) return;
    if (!window.confirm('Are you sure you want to delete this moment? This action cannot be undone.')) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/posts/${activity.post.id}`, { method: 'DELETE' });
      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ['feed'] });
        queryClient.invalidateQueries({ queryKey: ['myPosts'] });
        queryClient.invalidateQueries({ queryKey: ['allMyPosts'] });
        queryClient.invalidateQueries({ queryKey: ['myRankings'] });
        queryClient.invalidateQueries({ queryKey: ['moments'] });
      }
    } catch {
      // silently fail
    } finally {
      setIsDeleting(false);
      setShowMenu(false);
    }
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

  const getImages = (): string[] => {
    // For posts, collect all available images
    if (activity.post) {
      const imgs: string[] = [];
      if (activity.post.imageUrl) imgs.push(activity.post.imageUrl);
      if (activity.post.imageUrl2) imgs.push(activity.post.imageUrl2);
      if (activity.post.imageUrl3) imgs.push(activity.post.imageUrl3);
      return imgs;
    }
    // For trips/places, return single image
    if (activity.trip?.coverImageUrl) return [activity.trip.coverImageUrl];
    if (activity.place?.imageUrl) return [activity.place.imageUrl];
    return [];
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
      tags.push({ label: `⭐ ${activity.rating}/5`, color: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300' });
    }
    if (activity.place?.priceLevel === 'BUDGET') {
      tags.push({ label: '💰 Budget Friendly', color: 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300' });
    }
    if (activity.place?.tags?.includes('local-favorite')) {
      tags.push({ label: '🌟 Hidden Gem', color: 'bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300' });
    }
    if (activity.type === 'photos_uploaded') {
      tags.push({ label: `📸 ${activity.photoCount} Photos`, color: 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300' });
    }
    return tags;
  };

  const images = getImages();
  const tags = getTags();
  const isOwnPost = activity.post && activity.user.id === currentUser?.id;

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
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
                {isOwnPost && (
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    {isDeleting ? 'Deleting...' : 'Delete Moment'}
                  </button>
                )}
                {!isOwnPost && (
                  <div className="px-4 py-2 text-sm text-gray-400 dark:text-gray-500">
                    No actions available
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-700 dark:text-gray-300 mb-4">{getDescription()}</p>

        {/* Image carousel */}
        {images.length > 0 && (
          <div className="relative mb-4">
            <div
              className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-0"
              onScroll={(e) => {
                const container = e.currentTarget;
                const index = Math.round(container.scrollLeft / container.offsetWidth);
                setCurrentSlide(index);
              }}
            >
              {images.map((img, i) => (
                <div key={i} className="w-full flex-shrink-0 snap-center">
                  <img src={img} alt="" className="w-full h-80 object-cover rounded-xl" />
                </div>
              ))}
            </div>
            {/* Composite score badge */}
            {activity.post?.compositeScore != null && (
              <div className="absolute top-3 right-3">
                <ScoreBadge score={activity.post.compositeScore} size="md" />
              </div>
            )}
            {/* Dot indicators */}
            {images.length > 1 && (
              <div className="flex justify-center gap-1.5 mt-2">
                {images.map((_, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full ${i === currentSlide ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'}`} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Inline composite score when no image */}
        {images.length === 0 && activity.post?.compositeScore != null && (
          <div className="mb-4">
            <ScoreBadge score={activity.post.compositeScore} size="md" />
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
