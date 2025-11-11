import { NextResponse } from "next/server";
import { mockHostawayReviews } from "@/lib/mock-data";
import {
  normalizeHostawayReview,
  groupByListing,
} from "@/modules/reviews/hostaway.adapter";
import { approvalsStore } from "@/modules/reviews/approvals.store";

export async function GET() {
  try {
    // Normalize all raw reviews
    const normalizedReviews = mockHostawayReviews.map((raw) => {
      const review = normalizeHostawayReview(raw);
      // Check approval status from store
      review.approved = approvalsStore.isApproved(review.id);
      return review;
    });

    // Group by listing with aggregates
    const listingReviews = groupByListing(normalizedReviews);

    return NextResponse.json({
      success: true,
      listings: listingReviews,
      totalReviews: normalizedReviews.length,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
