export type PlaceCategory =
  | 'RESTAURANT' | 'CAFE' | 'BAR' | 'NIGHTCLUB' | 'MUSEUM' | 'GALLERY'
  | 'MONUMENT' | 'LANDMARK' | 'PARK' | 'BEACH' | 'VIEWPOINT' | 'MARKET'
  | 'SHOP' | 'HOTEL' | 'HOSTEL' | 'TOUR' | 'ACTIVITY' | 'HIDDEN_GEM' | 'OTHER';

export type PriceLevel = 'FREE' | 'BUDGET' | 'MODERATE' | 'EXPENSIVE' | 'LUXURY';

export interface PlaceCard {
  id: string;
  name: string;
  category: PlaceCategory;
  imageUrl: string | null;
  neighborhood: string | null;
  avgOverallRating: number | null;
  totalReviewCount: number;
  priceLevel: PriceLevel | null;
  cityName?: string;
  countryName?: string;
  isSaved: boolean;
}
