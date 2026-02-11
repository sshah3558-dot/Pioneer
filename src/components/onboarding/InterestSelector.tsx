'use client';

import { Check } from 'lucide-react';
import { InterestCategory, INTEREST_CATEGORIES } from '@/types/user';
import { cn } from '@/lib/utils';

interface InterestSelectorProps {
  value: InterestCategory[];
  onChange: (interests: InterestCategory[]) => void;
  maxSelections?: number;
}

export function InterestSelector({
  value,
  onChange,
  maxSelections = 10,
}: InterestSelectorProps) {
  const toggleInterest = (category: InterestCategory) => {
    if (value.includes(category)) {
      onChange(value.filter(c => c !== category));
    } else if (value.length < maxSelections) {
      onChange([...value, category]);
    }
  };

  const interests = Object.entries(INTEREST_CATEGORIES) as [InterestCategory, typeof INTEREST_CATEGORIES[InterestCategory]][];

  return (
    <div className="grid grid-cols-2 gap-3">
      {interests.map(([category, info]) => {
        const isSelected = value.includes(category);
        const isDisabled = !isSelected && value.length >= maxSelections;

        return (
          <button
            key={category}
            onClick={() => !isDisabled && toggleInterest(category)}
            disabled={isDisabled}
            className={cn(
              'p-4 rounded-xl border-2 text-left transition-all relative',
              isSelected
                ? 'border-[#667eea] bg-[#667eea]/5'
                : 'border-gray-200 hover:border-gray-300 bg-white',
              isDisabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">{info.icon}</span>
              <span className={cn(
                'font-medium text-sm',
                isSelected ? 'text-[#667eea]' : 'text-gray-900'
              )}>
                {info.label}
              </span>
            </div>
            {isSelected && (
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full gradient-primary flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
