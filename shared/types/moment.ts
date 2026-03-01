import { UserPreview } from './user';

export interface Moment {
  id: string;
  content: string;
  imageUrl: string | null;
  imageUrl2: string | null;
  imageUrl3: string | null;
  overallRating: number | null;
  valueRating: number | null;
  authenticityRating: number | null;
  crowdRating: number | null;
  compositeScore: number | null;
  rank: number | null;
  likeCount: number;
  viewCount: number;
  createdAt: string;
  isSaved: boolean;
  user: UserPreview;
  place: MomentPlace | null;
}

export interface MomentPlace {
  id: string;
  name: string;
  category: string;
  imageUrl: string | null;
  cityName?: string;
  countryName?: string;
}

export interface CreateMomentRequest {
  content: string;
  imageUrl?: string;
  imageUrl2?: string;
  imageUrl3?: string;
  overallRating?: number;
  valueRating?: number;
  authenticityRating?: number;
  crowdRating?: number;
  placeId?: string;
}
