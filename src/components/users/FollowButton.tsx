'use client';

import { useState } from 'react';
import { GradientButton } from '@/components/shared/GradientButton';
import { cn } from '@/lib/utils';

interface FollowButtonProps {
  userId: string;
  initialIsFollowing?: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
  size?: 'sm' | 'md';
  className?: string;
}

export function FollowButton({
  userId,
  initialIsFollowing = false,
  onFollowChange,
  size = 'md',
  className,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      const newState = !isFollowing;
      setIsFollowing(newState);
      onFollowChange?.(newState);
    } catch (error) {
      console.error('Failed to toggle follow:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GradientButton
      onClick={handleClick}
      variant={isFollowing ? 'outline' : 'primary'}
      size={size}
      disabled={isLoading}
      className={cn(isLoading && 'opacity-70', className)}
    >
      {isFollowing ? 'Following' : 'Follow'}
    </GradientButton>
  );
}
