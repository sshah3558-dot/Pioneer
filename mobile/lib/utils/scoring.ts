export function scoreBadgeColor(score: number): string {
  if (score >= 8) return 'bg-green-500';
  if (score >= 6) return 'bg-lime-500';
  if (score >= 4) return 'bg-amber-500';
  return 'bg-red-500';
}
