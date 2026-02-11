'use client';

import { use } from 'react';
import { notFound } from 'next/navigation';
import { ProfileHeader } from '@/components/users/ProfileHeader';
import { ProfileTabs } from '@/components/users/ProfileTabs';
import { AuthenticatedLayout } from '@/components/layout/AuthenticatedLayout';
import { mockUsers, mockTrips, mockReviews, mockPlaces, mockCurrentUser } from '@/lib/mock-data';
import { UserProfile } from '@/types/user';

interface PageProps {
  params: Promise<{ username: string }>;
}

export default function UserProfilePage({ params }: PageProps) {
  const { username } = use(params);

  // Find the user by username
  const user = mockUsers.find(u => u.username === username);

  if (!user) {
    notFound();
  }

  // Create a UserProfile from UserPreview (in real app, this would come from API)
  const userProfile: UserProfile = {
    id: user.id,
    email: `${user.username}@example.com`,
    name: user.name,
    username: user.username,
    bio: 'Travel enthusiast exploring the world one city at a time.',
    avatarUrl: user.avatarUrl,
    coverImageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop',
    onboardingComplete: true,
    subscriptionTier: 'FREE',
    tripCount: user.tripCount,
    reviewCount: 15,
    followerCount: user.followerCount,
    followingCount: 120,
    createdAt: new Date('2023-06-15'),
    updatedAt: new Date('2024-01-15'),
    interests: [],
    socialConnections: [],
    isFollowing: false,
  };

  // Get trips and reviews by this user
  const userTrips = mockTrips.filter(trip => trip.user.id === user.id);
  const userReviews = mockReviews.filter(review => review.user.id === user.id);

  // Check if this is the current user's profile
  const isOwnProfile = user.id === mockCurrentUser.id;

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <ProfileHeader
          user={userProfile}
          isOwnProfile={isOwnProfile}
          isFollowing={userProfile.isFollowing}
        />
        <ProfileTabs
          trips={userTrips}
          reviews={userReviews}
          savedPlaces={[]} // Other users' saved places are private
          isOwnProfile={isOwnProfile}
        />
      </div>
    </AuthenticatedLayout>
  );
}
