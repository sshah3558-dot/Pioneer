'use client';

import { Badge } from '@/components/ui/badge';
import { PlaceCategory, PLACE_CATEGORIES } from '@/types/place';
import { cn } from '@/lib/utils';

interface CategoryBadgeProps {
  category: PlaceCategory;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export function CategoryBadge({
  category,
  size = 'md',
  showIcon = true,
  className,
}: CategoryBadgeProps) {
  const categoryInfo = PLACE_CATEGORIES[category];

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  return (
    <Badge
      variant="secondary"
      className={cn(
        'font-medium rounded-full',
        sizes[size],
        className
      )}
    >
      {showIcon && <span className="mr-1">{categoryInfo.icon}</span>}
      {categoryInfo.label}
    </Badge>
  );
}

// Tag badge for generic tags
interface TagBadgeProps {
  tag: string;
  size?: 'sm' | 'md';
  variant?: 'default' | 'gradient';
  className?: string;
}

export function TagBadge({
  tag,
  size = 'sm',
  variant = 'default',
  className,
}: TagBadgeProps) {
  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
  };

  return (
    <Badge
      className={cn(
        'font-normal rounded-full',
        sizes[size],
        variant === 'gradient' && 'gradient-primary text-white border-0',
        variant === 'default' && 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700',
        className
      )}
    >
      #{tag}
    </Badge>
  );
}
