// Enums for type safety
export enum ReviewStatus {
  Published = "published",
  Pending = "pending",
  Rejected = "rejected",
}

export enum Channel {
  Airbnb = "airbnb",
  Booking = "booking",
  Direct = "direct",
}

export enum ReviewType {
  HostToGuest = "host-to-guest",
  GuestToHost = "guest-to-host",
}

export interface HostawayReviewRaw {
  id: number;
  type: string;
  status: string;
  rating: number | null;
  publicReview: string;
  reviewCategory: Array<{
    category: string;
    rating: number;
  }>;
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
  status: ReviewStatus;
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
