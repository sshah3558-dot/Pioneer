'use client';

import Link from 'next/link';
import { UserPreview as UserPreviewType } from '@/types/user';
import { cn } from '@/lib/utils';

interface UserPreviewProps {
  user: UserPreviewType;
  size?: 'sm' | 'md' | 'lg';
  showStats?: boolean;
  showLink?: boolean;
  className?: string;
}

export function UserPreviewComponent({
  user,
  size = 'md',
  showStats = false,
  showLink = true,
  className,
}: UserPreviewProps) {
  const sizes = {
    sm: {
      avatar: 'w-8 h-8',
      name: 'text-sm',
      username: 'text-xs',
    },
    md: {
      avatar: 'w-10 h-10',
      name: 'text-base',
      username: 'text-sm',
    },
    lg: {
      avatar: 'w-12 h-12',
      name: 'text-lg',
      username: 'text-base',
    },
  };

  const content = (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Avatar */}
      <div
        className={cn(
          'rounded-full bg-gradient-to-r from-[#667eea] to-[#764ba2] p-0.5',
          sizes[size].avatar
        )}
      >
        <div className="w-full h-full rounded-full bg-white p-0.5">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name || user.username || 'User'}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
              <span className={cn('font-semibold text-gray-500', sizes[size].username)}>
                {(user.name || user.username || 'U')[0].toUpperCase()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* User Info */}
      <div className="flex flex-col">
        <span className={cn('font-semibold text-gray-900', sizes[size].name)}>
          {user.name || user.username}
        </span>
        {user.username && (
          <span className={cn('text-gray-500', sizes[size].username)}>
            @{user.username}
          </span>
        )}
        {showStats && (
          <div className={cn('flex items-center gap-3 text-gray-500 mt-0.5', sizes[size].username)}>
            <span>{user.tripCount} trips</span>
            <span>{user.followerCount.toLocaleString()} followers</span>
          </div>
        )}
      </div>
    </div>
  );

  if (showLink && user.username) {
    return (
      <Link href={`/users/${user.username}`} className="hover:opacity-80 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}

// Simple avatar component
interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showBorder?: boolean;
  className?: string;
}

export function Avatar({
  src,
  alt = 'User',
  size = 'md',
  showBorder = true,
  className,
}: AvatarProps) {
  const sizes = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const wrapper = showBorder
    ? 'rounded-full bg-gradient-to-r from-[#667eea] to-[#764ba2] p-0.5'
    : 'rounded-full';

  return (
    <div className={cn(wrapper, sizes[size], className)}>
      <div className={cn('w-full h-full rounded-full', showBorder && 'bg-white p-0.5')}>
        {src ? (
          <img
            src={src}
            alt={alt}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
            <span className="font-semibold text-gray-500 text-xs">
              {alt[0].toUpperCase()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
