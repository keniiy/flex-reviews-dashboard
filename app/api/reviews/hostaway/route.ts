import { NextResponse } from "next/server";
import {
  normalizeHostawayReview,
  groupByListing,
} from "@/modules/reviews/hostaway.adapter";
import { approvalsStore } from "@/modules/reviews/approvals.store";
import { fetchHostawayReviews } from "@/modules/reviews/hostaway.service";
import type { Review } from "@/modules/reviews/types";

export async function GET() {
  try {
    const { reviews: rawReviews, source, fallbackReason, lastSyncedAt } =
      await fetchHostawayReviews();

    const normalizedReviews = rawReviews.map((raw) => {
      const review = normalizeHostawayReview(raw);
      review.approved = approvalsStore.isApproved(review.id);
      return review;
    });

    // Group by listing with aggregates
    const listingReviews = groupByListing(normalizedReviews);

    return NextResponse.json({
      success: true,
      listings: listingReviews,
      totals: buildTotals(normalizedReviews),
      source: {
        type: source,
        fallback: source === "mock" ? fallbackReason : undefined,
        lastSyncedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

function buildTotals(reviews: Review[]) {
  const totalReviews = reviews.length;
  const approvedCount = reviews.filter((r) => r.approved).length;
  const pendingCount = totalReviews - approvedCount;
  const avgRating =
    totalReviews === 0
      ? 0
      : Math.round(
          (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) * 10
        ) / 10;

  const channelBreakdown = reviews.reduce<Record<string, number>>(
    (acc, review) => {
      acc[review.channel] = (acc[review.channel] ?? 0) + 1;
      return acc;
    },
    {}
  );

  const categoryAccumulator = reviews.reduce<
    Record<string, { sum: number; count: number }>
  >((acc, review) => {
    Object.entries(review.categories).forEach(([category, rating]) => {
      if (!acc[category]) {
        acc[category] = { sum: 0, count: 0 };
      }
      acc[category].sum += rating;
      acc[category].count += 1;
    });
    return acc;
  }, {});

  const categoryAverages = Object.entries(categoryAccumulator).reduce<
    Record<string, number>
  >((acc, [category, { sum, count }]) => {
    acc[category] = Math.round((sum / count) * 10) / 10;
    return acc;
  }, {});

  return {
    totalReviews,
    avgRating,
    approvedCount,
    pendingCount,
    channelBreakdown,
    categoryAverages,
  };
}
