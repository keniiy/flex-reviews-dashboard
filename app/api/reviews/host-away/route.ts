import { mockHostAwayReviews } from "@/lib/mock-data";
import {
  groupByListing,
  normalizationHostAwayReview,
} from "@/modules/reviews/host-away.adapter";
import { NextResponse } from "next/server";

export async function Get() {
  try {
    // Normalize all raw reviews
    const normalizedReviews = mockHostAwayReviews.map(
      normalizationHostAwayReview
    );

    // Group by listing with aggregates
    const listingReviews = groupByListing(normalizedReviews);

    return NextResponse.json({
      success: true,
      listings: listingReviews,
      totalReviews: normalizedReviews.length,
    });
  } catch (error) {
    console.error("Error fetching Host Away reviews:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch Host Away reviews." },
      { status: 500 }
    );
  }
}
