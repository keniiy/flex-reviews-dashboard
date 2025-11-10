import { Review, ListingReviews } from "./types";

export interface FilterOptions {
  minRating?: number;
  channel?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  approvedOnly?: boolean;
}

/**
 * Filters reviews based on citeria
 */

export function filterReviews(
  reviews: Review[],
  options: FilterOptions
): Review[] {
  return reviews.filter((review) => {
    if (options.minRating !== undefined && review.rating < options.minRating)
      return false;

    if (options.channel && review.channel !== options.channel) return false;

    if (options.category && !(options.category in review.categories))
      return false;

    if (options.startDate && review.submittedAt < options.startDate)
      return false;

    if (options.endDate && review.submittedAt > options.endDate) return false;

    if (options.approvedOnly && !review.approved) return false;

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
      compareValue = a.submittedAt.localeCompare(b.submittedAt);
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
export function computeInsights(listingReviews: ListingReviews) {
  const { reviews, categoryAverages } = listingReviews;

  // Find most common positive / negative categories
  const categoryScores = Object.entries(categoryAverages).sort(
    ([, a], [, b]) => b - a
  );

  return {
    topCategory: categoryScores[0]?.[0] || null,
    lowestCategory: categoryScores[categoryScores.length - 1]?.[0] || null,
    approvalRate: reviews.filter((r) => r.approved).length / reviews.length,
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

  const sorted = [...reviews].sort((a, b) =>
    a.submittedAt.localeCompare(b.submittedAt)
  );

  const recent = sorted.slice(0, Math.ceil(sorted.length / 3));
  const older = sorted.slice(Math.ceil(reviews.length / 3));

  const recentAvg =
    recent.reduce((sum, r) => sum + r.rating, 0) / recent.length;
  const olderAvg = older.reduce((sum, r) => sum + r.rating, 0) / older.length;

  const diff = recentAvg - olderAvg;

  if (diff > 0.3) return "improving";
  if (diff < -0.3) return "declining";
  return "stable";
}
