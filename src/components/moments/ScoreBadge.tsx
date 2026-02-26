'use client';

interface ScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ScoreBadge({ score, size = 'md', className = '' }: ScoreBadgeProps) {
  const getColor = (s: number) => {
    if (s >= 8.0) return 'bg-green-600';
    if (s >= 6.0) return 'bg-lime-500';
    if (s >= 4.0) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
  };

  return (
    <div className={`${getColor(score)} ${sizeClasses[size]} rounded-xl text-white font-bold flex items-center justify-center shadow-lg ${className}`}>
      {score.toFixed(1)}
    </div>
  );
}
