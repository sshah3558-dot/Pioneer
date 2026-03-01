import { UserPreview } from './user';

export type TripStatus = 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED';

export interface TripCard {
  id: string;
  title: string;
  coverImageUrl: string | null;
  startDate: string | null;
  endDate: string | null;
  likeCount: number;
  status: TripStatus;
  user: UserPreview;
  city: { name: string; country: { name: string } };
  stopCount: number;
  isLiked: boolean;
}

export interface CreateTripInput {
  cityId: string;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  isPublic?: boolean;
}
