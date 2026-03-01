import { UserPreview } from './user';
import { TripCard } from './trip';
import { ReviewCard } from './review';

export type FeedItemType = 'trip' | 'review' | 'follow' | 'post';

export interface FeedItem {
  id: string;
  type: FeedItemType;
  createdAt: string;
  trip?: TripCard;
  review?: ReviewCard;
  follow?: { follower: UserPreview; following: UserPreview };
  post?: {
    id: string;
    content: string;
    imageUrl: string | null;
    imageUrl2: string | null;
    imageUrl3: string | null;
    compositeScore: number | null;
    likeCount: number;
    user: UserPreview;
    createdAt: string;
    place?: { id: string; name: string; category: string; cityName?: string; countryName?: string } | null;
  };
}
