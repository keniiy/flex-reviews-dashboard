import { NextRequest, NextResponse } from "next/server";
import { fetchGoogleReviewsForListing } from "@/modules/reviews/services/google.service";
import { normalizeHostawayReview } from "@/modules/reviews/hostaway.adapter";

export async function GET(request: NextRequest) {
  const listingName = request.nextUrl.searchParams.get("listingName");
  const listingId = request.nextUrl.searchParams.get("listingId") ?? undefined;

  if (!listingName) {
    return NextResponse.json(
      { success: false, error: "listingName is required" },
      { status: 400 }
    );
  }

  try {
    const result = await fetchGoogleReviewsForListing(listingName, listingId);
    const normalized = result.reviews.map((raw) => normalizeHostawayReview(raw));

    return NextResponse.json({
      success: true,
      reviews: normalized,
      meta: {
        source: result.source,
        fallbackReason: result.fallbackReason,
        lastSyncedAt: result.lastSyncedAt,
        query: result.query,
        placeId: result.placeId,
        placeName: result.placeName,
      },
    });
  } catch (error) {
    console.error("Error fetching Google reviews for listing", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch Google reviews" },
      { status: 500 }
    );
  }
}
