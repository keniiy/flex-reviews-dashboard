import { mockHostawayReviews } from "@/lib/mock-data";
import {
  groupByListing,
  normalizationHostawayReview,
} from "@/modules/reviews/hostaway.adapter";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Normalize all raw reviews
    const normalizedReviews = mockHostawayReviews.map(
      normalizationHostawayReview
    );

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
