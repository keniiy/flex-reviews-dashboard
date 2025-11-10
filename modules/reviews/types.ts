export interface HostAwayReviewRaw {
  id: string | number;
  type: string;
  status: string;
  rating: number | null;
  publicReview: string | null;
  reviewCategory: Array<{
    category: string;
    rating: number;
  }> | null;
  submittedAt: string;
  guestName: string;
  listingName: string;
}

// Normalized review for our dashboard
export interface Review {
  id: string;
  listingId: string;
  listingName: string;
  guestName: string;
  review: string;
  rating: number;
  categories: Record<string, number>;
  channel: string;
  submittedAt: string;
  approved: boolean;
}

// Grouped reviews by listing
export interface ListingReviews {
  listingId: string;
  listingName: string;
  avgRating: number;
  totalReviews: number;
  categoryAverages: Record<string, number>;
  channels: string[];
  reviews: Review[];
}
