// Base review domain types

export enum ReviewStatus {
  Published = "published",
  Pending = "pending",
  Rejected = "rejected",
}

export enum Channel {
  Airbnb = "airbnb",
  Booking = "booking",
  Direct = "direct",
  Google = "google",
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
  channel?: Channel;
  approved?: boolean;
}

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

export interface ListingInsights {
  topCategory: string | null;
  lowestCategory: string | null;
  approvalRate: number;
  recentTrend: "improving" | "declining" | "stable";
}

export interface ListingReviews {
  listingId: string;
  listingName: string;
  avgRating: number;
  totalReviews: number;
  categoryAverages: Record<string, number>;
  channels: string[];
  reviews: Review[];
  insights: ListingInsights;
}
