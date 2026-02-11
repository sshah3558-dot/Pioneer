'use client';

import { cn } from '@/lib/utils';
import { GradientButton } from './GradientButton';
import { MapPin, BookOpen, Users, Heart, Camera, MessageCircle } from 'lucide-react';

type EmptyStateType = 'trips' | 'reviews' | 'saved' | 'following' | 'photos' | 'feed' | 'custom';

interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

const defaultContent: Record<Exclude<EmptyStateType, 'custom'>, { icon: React.ReactNode; title: string; description: string }> = {
  trips: {
    icon: <MapPin className="w-12 h-12" />,
    title: 'No trips yet',
    description: 'Start documenting your adventures and share them with the community.',
  },
  reviews: {
    icon: <BookOpen className="w-12 h-12" />,
    title: 'No reviews yet',
    description: 'Share your experiences and help other travelers discover great places.',
  },
  saved: {
    icon: <Heart className="w-12 h-12" />,
    title: 'No saved places',
    description: 'Save places you want to visit to find them easily later.',
  },
  following: {
    icon: <Users className="w-12 h-12" />,
    title: 'Not following anyone',
    description: 'Follow travelers with similar interests to see their trips in your feed.',
  },
  photos: {
    icon: <Camera className="w-12 h-12" />,
    title: 'No photos yet',
    description: 'Add photos to your trips and reviews to share your experiences.',
  },
  feed: {
    icon: <MessageCircle className="w-12 h-12" />,
    title: 'Your feed is empty',
    description: 'Follow other travelers to see their trips and activities here.',
  },
};

export function EmptyState({
  type = 'custom',
  title,
  description,
  actionLabel,
  onAction,
  icon,
  className,
}: EmptyStateProps) {
  const content = type !== 'custom' ? defaultContent[type] : null;

  const displayIcon = icon || content?.icon;
  const displayTitle = title || content?.title || 'Nothing here';
  const displayDescription = description || content?.description || 'No content to display.';

  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-6 text-center', className)}>
      <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[#667eea]/10 to-[#764ba2]/10 flex items-center justify-center mb-4">
        <span className="text-[#667eea]">
          {displayIcon}
        </span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{displayTitle}</h3>
      <p className="text-gray-500 max-w-sm mb-6">{displayDescription}</p>
      {actionLabel && onAction && (
        <GradientButton onClick={onAction} size="sm">
          {actionLabel}
        </GradientButton>
      )}
    </div>
  );
}
