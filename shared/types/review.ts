import { UserPreview } from './user';
import { PlaceCard } from './place';

export interface ReviewCard {
  id: string;
  overallRating: number;
  title: string | null;
  content: string;
  likeCount: number;
  createdAt: string;
  user: UserPreview;
  place?: PlaceCard;
  photoCount: number;
  isLiked: boolean;
}
