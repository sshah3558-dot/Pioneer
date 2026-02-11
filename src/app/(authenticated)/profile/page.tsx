'use client';

import { useQuery } from '@tanstack/react-query';
import { ProfileHeader } from '@/components/users/ProfileHeader';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { apiFetch } from '@/lib/api/fetcher';

export default function ProfilePage() {
  const { user, isLoading: userLoading } = useCurrentUser();

  const { data: reviewsData } = useQuery({
    queryKey: ['myReviews'],
    queryFn: () => apiFetch<{ items: Array<{
      id: string;
      title: string | null;
      overallRating: number;
      content: string;
      createdAt: string;
      place: { name: string; city: { name: string; country: { name: string } } };
    }> }>('/api/reviews?userId=me'),
    enabled: !!user,
  });

  if (userLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="h-64 bg-gray-200 animate-pulse" />
          <div className="p-6 space-y-4">
            <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const reviews = reviewsData?.items || [];

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`;
    return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <ProfileHeader user={user} isOwnProfile />

      {/* Recent Reviews */}
      <h3 className="font-bold text-2xl gradient-text-135">Recent Reviews</h3>
      {reviews.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <p className="text-gray-500 text-lg">No reviews yet.</p>
          <p className="text-gray-400 text-sm mt-1">Start exploring and share your experiences!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <div key={review.id} className="card-hover bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-bold">
                    {review.overallRating}/5
                  </span>
                  <span className="text-xs text-gray-500">{timeAgo(review.createdAt)}</span>
                </div>
                <h4 className="font-bold text-lg mb-2">{review.title || review.place.name}</h4>
                <p className="text-sm text-gray-600 mb-3">
                  {review.place.city.name}, {review.place.city.country.name}
                </p>
                <p className="text-sm text-gray-700 line-clamp-3">{review.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
