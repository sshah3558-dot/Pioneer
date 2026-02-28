/**
 * Shared date formatting utilities.
 *
 * Replaces the duplicate timeAgo / formatDate helpers that were previously
 * defined inline in individual components.
 */

/**
 * Returns a human-readable relative time string for the given date.
 *
 * Handles:
 *   - "Just now"       (< 1 minute)
 *   - "Xm ago"         (< 60 minutes)
 *   - "Xh ago"         (< 24 hours)
 *   - "Yesterday"      (1 day ago)
 *   - "X days ago"     (2-6 days)
 *   - "X weeks ago"    (7-29 days)
 *   - "X months ago"   (30-364 days)
 *   - "MMM D, YYYY"    (365+ days)
 */
export function timeAgo(date: string | Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60_000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  }
  if (days < 365) {
    const months = Math.floor(days / 30);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  }

  // Older than a year — show a full date
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Formats a date as "MMM D, YYYY" (e.g. "Jan 15, 2026").
 * Returns an empty string when `date` is null/undefined.
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Formats a date as "MMM YYYY" (e.g. "Jan 2026").
 * Useful for trip date ranges that only need month-level precision.
 * Returns an empty string when `date` is null/undefined.
 */
export function formatMonthYear(date: Date | string | null | undefined): string {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
}
