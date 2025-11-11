import { Review, ListingReviews, ListingInsights } from "./types";

export interface FilterOptions {
  minRating?: number;
  channel?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  approvedOnly?: boolean;
  timeframeDays?: number;
}

/**
 * Filters reviews based on citeria
 */

export function filterReviews(
  reviews: Review[],
  options: FilterOptions = {}
): Review[] {
  const timeframeCutoff = options.timeframeDays
    ? Date.now() - options.timeframeDays * 24 * 60 * 60 * 1000
    : null;

  return reviews.filter((review) => {
    const submittedAtMs = new Date(review.submittedAt).getTime();

    if (options.minRating !== undefined && review.rating < options.minRating) {
      return false;
    }

    if (options.channel && review.channel !== options.channel) {
      return false;
    }

    if (options.category && !(options.category in review.categories)) {
      return false;
    }

    if (
      options.startDate &&
      submittedAtMs < new Date(options.startDate).getTime()
    ) {
      return false;
    }

    if (
      options.endDate &&
      submittedAtMs > new Date(options.endDate).getTime()
    ) {
      return false;
    }

    if (timeframeCutoff && submittedAtMs < timeframeCutoff) {
      return false;
    }

    if (options.approvedOnly && !review.approved) {
      return false;
    }

    return true;
  });
}

/**
 *  Sorts reviews by various citeria
 */
export function sortReviews(
  reviews: Review[],
  sortBy: "date" | "rating",
  sortOrder: "asc" | "desc"
): Review[] {
  const sorted = [...reviews];

  sorted.sort((a, b) => {
    let compareValue = 0;

    if (sortBy === "date") {
      compareValue =
        new Date(a.submittedAt).getTime() -
        new Date(b.submittedAt).getTime();
    } else if (sortBy === "rating") {
      compareValue = a.rating - b.rating;
    }

    return sortOrder === "asc" ? compareValue : -compareValue;
  });

  return sorted;
}

/**
 * Computes insights from listing reviews
 */
export function computeInsights(
  listingReviews: Pick<ListingReviews, "reviews" | "categoryAverages" | "totalReviews">
): ListingInsights {
  const { reviews, categoryAverages } = listingReviews;

  // Find most common positive / negative categories
  const categoryScores = Object.entries(categoryAverages).sort(
    ([, a], [, b]) => b - a
  );

  return {
    topCategory: categoryScores[0]?.[0] || null,
    lowestCategory: categoryScores[categoryScores.length - 1]?.[0] || null,
    approvalRate:
      reviews.length === 0
        ? 0
        : reviews.filter((r) => r.approved).length / reviews.length,
    recentTrend: computeRecentTrend(reviews),
  };
}

/**
 * Analyze if recent reviews are trending up or down
 */
function computeRecentTrend(
  reviews: Review[]
): "improving" | "declining" | "stable" {
  if (reviews.length < 4) return "stable";

  const sorted = [...reviews].sort(
    (a, b) =>
      new Date(a.submittedAt).getTime() -
      new Date(b.submittedAt).getTime()
  );

  const chunkSize = Math.max(1, Math.floor(sorted.length / 3));
  const older = sorted.slice(0, chunkSize);
  const recent = sorted.slice(-chunkSize);

  const recentAvg =
    recent.reduce((sum, r) => sum + r.rating, 0) / recent.length;
  const olderAvg =
    older.reduce((sum, r) => sum + r.rating, 0) / older.length;

  const diff = recentAvg - olderAvg;

  if (diff > 0.2) return "improving";
  if (diff < -0.2) return "declining";
  return "stable";
}
