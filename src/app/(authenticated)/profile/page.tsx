'use client';

import { ProfileHeader } from '@/components/users/ProfileHeader';
import { mockCurrentUser, mockReviews } from '@/lib/mock-data';

const recentReviews = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop',
    rating: 5,
    timeAgo: '2 days ago',
    title: 'Osteria Francescana',
    location: 'Modena, Italy',
    excerpt: "An unforgettable culinary experience! Chef Massimo's creativity...",
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=400&h=300&fit=crop',
    rating: 4,
    timeAgo: '1 week ago',
    title: 'Blue Lagoon',
    location: 'Iceland',
    excerpt: 'Beautiful but touristy. Go early morning for the best experience...',
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=400&h=300&fit=crop',
    rating: 5,
    timeAgo: '2 weeks ago',
    title: 'Haleakalā Summit',
    location: 'Maui, Hawaii',
    excerpt: 'Watching sunrise above the clouds was absolutely breathtaking...',
  },
];

export default function ProfilePage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <ProfileHeader user={mockCurrentUser} isOwnProfile />

      {/* Recent Reviews */}
      <h3 className="font-bold text-2xl gradient-text-135">📝 Recent Reviews</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recentReviews.map((review) => (
          <div key={review.id} className="card-hover bg-white rounded-2xl shadow-lg overflow-hidden">
            <img
              src={review.image}
              alt={review.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-bold">
                  ⭐ {review.rating}/5
                </span>
                <span className="text-xs text-gray-500">{review.timeAgo}</span>
              </div>
              <h4 className="font-bold text-lg mb-2">{review.title}</h4>
              <p className="text-sm text-gray-600 mb-3">📍 {review.location}</p>
              <p className="text-sm text-gray-700">{review.excerpt}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
