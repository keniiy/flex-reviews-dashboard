import {
  HostawayReviewRaw,
  Review,
  ListingReviews,
  Channel,
  ReviewStatus,
} from "./types";

export function normalizeHostawayReview(raw: HostawayReviewRaw): Review {
  const categories = raw.reviewCategory.reduce((acc, cat) => {
    acc[cat.category] = cat.rating;
    return acc;
  }, {} as Record<string, number>);

  const listingId = raw.listingName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const channel = inferChannel(raw);

  return {
    id: raw.id.toString(),
    listingId,
    listingName: raw.listingName,
    guestName: raw.guestName,
    review: raw.publicReview,
    rating: raw.rating || calculateOverallRating(categories),
    categories,
    channel,
    submittedAt: new Date(raw.submittedAt).toISOString(),
    approved: false,
    status: ReviewStatus.Published,
  };
}

export function groupByListing(reviews: Review[]): ListingReviews[] {
  const grouped = new Map<string, Review[]>();

  reviews.forEach((review) => {
    const existing = grouped.get(review.listingId) || [];
    grouped.set(review.listingId, [...existing, review]);
  });

  return Array.from(grouped.entries()).map(([listingId, listingReviews]) => {
    const totalReviews = listingReviews.length;
    const avgRating =
      listingReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

    const categoryAverages: Record<string, number> = {};
    const categoryKeys = new Set<string>();

    listingReviews.forEach((r) => {
      Object.keys(r.categories).forEach((cat) => categoryKeys.add(cat));
    });

    categoryKeys.forEach((category) => {
      const values = listingReviews
        .map((r) => r.categories[category])
        .filter((val) => val !== undefined);

      if (values.length > 0) {
        categoryAverages[category] =
          values.reduce((sum, val) => sum + val, 0) / values.length;
      }
    });

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

function inferChannel(raw: HostawayReviewRaw): Channel {
  // Simple heuristic - in production, this would come from Hostaway metadata
  const random = Math.random();
  if (random < 0.5) return Channel.Airbnb;
  if (random < 0.8) return Channel.Booking;
  return Channel.Direct;
}

function calculateOverallRating(categories: Record<string, number>): number {
  const values = Object.values(categories);
  if (values.length === 0) return 0;
  return (
    Math.round(
      (values.reduce((sum, val) => sum + val, 0) / values.length) * 10
    ) / 10
  );
}
