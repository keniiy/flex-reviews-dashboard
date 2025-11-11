import {
  HostawayReviewRaw,
  Review,
  ListingReviews,
  Channel,
  ReviewStatus,
} from "./types";
import { computeInsights } from "./service";

export function normalizeHostawayReview(raw: HostawayReviewRaw): Review {
  const categories = raw.reviewCategory.reduce((acc, cat) => {
    acc[cat.category] = cat.rating;
    return acc;
  }, {} as Record<string, number>);

  const listingId = raw.listingName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const channel = raw.channel ?? inferChannel(raw);
  const ratingOnFive =
    raw.rating !== null
      ? normalizeStarRating(raw.rating)
      : calculateOverallRating(categories);

  const status = (Object.values(ReviewStatus) as string[]).includes(raw.status)
    ? (raw.status as ReviewStatus)
    : ReviewStatus.Published;

  return {
    id: raw.id.toString(),
    listingId,
    listingName: raw.listingName,
    guestName: raw.guestName,
    review: raw.publicReview,
    rating: ratingOnFive,
    categories,
    channel,
    submittedAt: new Date(raw.submittedAt).toISOString(),
    approved: Boolean(raw.approved),
    status,
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

    const baseListing = {
      listingId,
      listingName: listingReviews[0].listingName,
      avgRating: Math.round(avgRating * 10) / 10,
      totalReviews,
      categoryAverages,
      channels,
      reviews: listingReviews,
    } satisfies Omit<ListingReviews, "insights">;

    return {
      ...baseListing,
      insights: computeInsights(baseListing),
    };
  });
}

function inferChannel(raw: HostawayReviewRaw): Channel {
  const channels = [Channel.Airbnb, Channel.Booking, Channel.Direct];
  const hash =
    Math.abs(
      Array.from(`${raw.listingName}-${raw.guestName}-${raw.id}`).reduce(
        (acc, char) => acc + char.charCodeAt(0),
        0
      )
    ) % channels.length;
  return channels[hash];
}

function calculateOverallRating(categories: Record<string, number>): number {
  const values = Object.values(categories);
  if (values.length === 0) return 0;
  const tenPointAverage = values.reduce((sum, val) => sum + val, 0) / values.length;
  return normalizeStarRating(tenPointAverage);
}

function normalizeStarRating(scoreOutOfTen: number): number {
  if (!scoreOutOfTen) return 0;
  return Math.round((scoreOutOfTen / 10) * 5 * 10) / 10;
}
