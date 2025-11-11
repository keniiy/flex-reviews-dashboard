import type { ListingReviews, Review } from "./reviews";

export interface ReviewsTotals {
  totalReviews: number;
  avgRating: number;
  approvedCount: number;
  pendingCount: number;
  channelBreakdown: Record<string, number>;
  categoryAverages: Record<string, number>;
}

export interface ReviewsSourceMeta {
  type: "hostaway" | "mock" | "google";
  fallback?: string;
  lastSyncedAt: string;
}

export interface ReviewsApiResponse {
  success: boolean;
  listings: ListingReviews[];
  totals: ReviewsTotals;
  source: ReviewsSourceMeta;
  sources?: Record<string, ReviewsSourceMeta>;
}

export interface GoogleReviewsMeta {
  source: "google" | "mock";
  fallbackReason?: string;
  lastSyncedAt: string;
  query: string;
  placeId?: string;
  placeName?: string;
}

export interface GoogleReviewsResponse {
  success: boolean;
  reviews: Review[];
  meta: GoogleReviewsMeta;
}
