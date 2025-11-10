import { HostAwayReviewRaw, ListingReviews, Review } from "./types";

/**
 * Normalizes raw Host-Away review into our domain model
 */
export function normalizationHostawayReview(raw: HostAwayReviewRaw): Review {
  // Extract category ratings into a clean object
  const categories =
    raw.reviewCategory?.reduce((acc, curr) => {
      acc[curr.category] = curr.rating;
      return acc;
    }, {} as Record<string, number>) || {};

  // Generate a slug-style listing name or type (simplified for this example
  const listingId = raw.listingName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  // Infer channel from listing name or type (simplified for this example)

  const channel = inferChannel(raw);

  return {
    id: raw.id.toString(),
    listingId,
    listingName: raw.listingName,
    guestName: raw.guestName,
    review: raw.publicReview || "",
    rating: raw.rating || calculateOverallRating(categories),
    categories,
    channel,
    submittedAt: raw.submittedAt,
    approved: false,
  };
}

/**
 * Groups normalized reviews by listing and computes aggregates
 */
export function groupByListing(reviews: Review[]): ListingReviews[] {
  const grouped = new Map<string, Review[]>();

  // Group reviews by listing
  reviews.forEach((review) => {
    const existing = grouped.get(review.listingId) ?? [];
    grouped.set(review.listingId, [...existing, review]);
  });

  // Compute aggregates for each listing
  return Array.from(grouped.entries()).map(([listingId, listingReviews]) => {
    const totalReviews = listingReviews.length;
    const avgRating =
      listingReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

    // Compute category averages
    const categoryAverages: Record<string, number> = {};
    const categoryKeys = new Set<string>();
    listingReviews.forEach((r) => {
      Object.keys(r.categories).forEach((key) => categoryKeys.add(key));
    });

    categoryKeys.forEach((category) => {
      const values = listingReviews
        .map((r) => r.categories[category])
        .filter((val): val is number => val !== undefined);

      if (values.length > 0)
        categoryAverages[category] =
          values.reduce((sum, val) => sum + val, 0) / values.length;
    });

    // get unique channels
    const channels = Array.from(new Set(listingReviews.map((r) => r.channel)));

    return {
      listingId,
      listingName: listingReviews[0].listingName,
      avgRating: Math.round(avgRating * 10) / 10,
      totalReviews,
      categoryAverages,
      channels,
      reviews: listingReviews,
    };
  });
}

// Helper to calculate overall rating if not provided
// Helper: infer booking channel from review data
function inferChannel(raw: HostAwayReviewRaw): string {
  // In real implementation, this would come from Hostaway metadata
  // For now, we'll use a simple heuristic
  if (raw.type.includes("airbnb")) return "airbnb";
  if (raw.type.includes("booking")) return "booking.com";
  return "direct";
}

// Helper: calculate overall rating from categories
function calculateOverallRating(categories: Record<string, number>): number {
  const values = Object.values(categories);
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}
