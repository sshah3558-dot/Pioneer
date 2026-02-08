'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TripCard } from '@/components/trips/TripCard';
import { PlaceCard } from '@/components/places/PlaceCard';
import { ReviewCard } from '@/components/reviews/ReviewCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { TripCard as TripCardType } from '@/types/trip';
import { PlaceCard as PlaceCardType } from '@/types/place';
import { ReviewCard as ReviewCardType } from '@/types/review';

interface ProfileTabsProps {
  trips: TripCardType[];
  reviews: ReviewCardType[];
  savedPlaces: PlaceCardType[];
  isOwnProfile?: boolean;
}

export function ProfileTabs({
  trips,
  reviews,
  savedPlaces,
  isOwnProfile = false,
}: ProfileTabsProps) {
  return (
    <Tabs defaultValue="trips" className="w-full">
      <TabsList className="grid w-full grid-cols-3 bg-gray-100 rounded-xl p-1">
        <TabsTrigger
          value="trips"
          className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
        >
          Trips
        </TabsTrigger>
        <TabsTrigger
          value="reviews"
          className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
        >
          Reviews
        </TabsTrigger>
        <TabsTrigger
          value="saved"
          className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
        >
          Saved
        </TabsTrigger>
      </TabsList>

      <TabsContent value="trips" className="mt-4 space-y-4">
        {trips.length > 0 ? (
          trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} variant="compact" />
          ))
        ) : (
          <EmptyState
            type="trips"
            actionLabel={isOwnProfile ? 'Create a trip' : undefined}
            onAction={isOwnProfile ? () => { window.location.href = '/trips/new'; } : undefined}
          />
        )}
      </TabsContent>

      <TabsContent value="reviews" className="mt-4 space-y-4">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))
        ) : (
          <EmptyState type="reviews" />
        )}
      </TabsContent>

      <TabsContent value="saved" className="mt-4">
        {savedPlaces.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {savedPlaces.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        ) : (
          <EmptyState type="saved" />
        )}
      </TabsContent>
    </Tabs>
  );
}
