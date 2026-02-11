'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
}

export function RatingStars({
  rating,
  maxRating = 5,
  size = 'md',
  showValue = false,
  interactive = false,
  onChange,
  className,
}: RatingStarsProps) {
  const sizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const handleClick = (index: number) => {
    if (interactive && onChange) {
      onChange(index + 1);
    }
  };

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {Array.from({ length: maxRating }).map((_, index) => {
        const filled = index < Math.floor(rating);
        const partial = index === Math.floor(rating) && rating % 1 > 0;
        const fillPercentage = partial ? (rating % 1) * 100 : 0;

        return (
          <button
            key={index}
            type="button"
            onClick={() => handleClick(index)}
            disabled={!interactive}
            className={cn(
              'relative',
              interactive && 'cursor-pointer hover:scale-110 transition-transform',
              !interactive && 'cursor-default'
            )}
          >
            {/* Background star (empty) */}
            <Star
              className={cn(sizes[size], 'text-gray-200 fill-gray-200')}
            />
            {/* Foreground star (filled) */}
            {(filled || partial) && (
              <Star
                className={cn(
                  sizes[size],
                  'absolute inset-0 text-amber-400 fill-amber-400'
                )}
                style={partial ? { clipPath: `inset(0 ${100 - fillPercentage}% 0 0)` } : undefined}
              />
            )}
          </button>
        );
      })}
      {showValue && (
        <span className={cn('ml-1 font-medium text-gray-700', textSizes[size])}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

// Interactive rating input component
interface RatingInputProps {
  value: number;
  onChange: (rating: number) => void;
  label?: string;
  description?: string;
  required?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function RatingInput({
  value,
  onChange,
  label,
  description,
  required = false,
  size = 'lg',
}: RatingInputProps) {
  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center gap-1">
          <span className="font-medium text-gray-900">{label}</span>
          {required && <span className="text-red-500">*</span>}
        </div>
      )}
      {description && (
        <p className="text-sm text-gray-500">{description}</p>
      )}
      <RatingStars
        rating={value}
        size={size}
        interactive
        onChange={onChange}
      />
    </div>
  );
}
