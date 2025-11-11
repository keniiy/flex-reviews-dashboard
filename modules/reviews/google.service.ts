/**
 * Google My Business / Google Places API Integration
 *
 * This service fetches reviews from Google Business Profile API
 * https://developers.google.com/my-business/reference/rest
 */

import type { HostawayReviewRaw } from "./types";

const GOOGLE_API_BASE_URL =
  "https://mybusinessaccountmanagement.googleapis.com/v1";
const GOOGLE_PLACES_API_URL = "https://maps.googleapis.com/maps/api/place";

export interface GoogleReviewRaw {
  reviewId: string;
  reviewer: {
    profilePhotoUrl?: string;
    displayName: string;
    isAnonymous?: boolean;
  };
  starRating: "ONE" | "TWO" | "THREE" | "FOUR" | "FIVE";
  comment?: string;
  createTime: string;
  updateTime: string;
  reviewReply?: {
    comment: string;
    updateTime: string;
  };
}

export interface GooglePlaceReview {
  author_name: string;
  author_url?: string;
  language: string;
  profile_photo_url?: string;
  rating: number; // 1-5
  relative_time_description: string;
  text: string;
  time: number; // Unix timestamp
}

export interface GoogleFetchResult {
  source: "google" | "mock";
  reviews: HostawayReviewRaw[];
  fallbackReason?: string;
  lastSyncedAt: string;
}

/**
 * Fetch reviews using Google My Business API (requires OAuth2)
 * This is the official API for Google Business Profile reviews
 */
export async function fetchGoogleBusinessReviews(): Promise<GoogleFetchResult> {
  const accessToken = process.env.GOOGLE_OAUTH_ACCESS_TOKEN;
  const accountId = process.env.GOOGLE_BUSINESS_ACCOUNT_ID;
  const locationId = process.env.GOOGLE_BUSINESS_LOCATION_ID;
  const lastSyncedAt = new Date().toISOString();

  if (!accessToken || !accountId || !locationId) {
    return {
      source: "mock",
      reviews: [],
      fallbackReason:
        "Missing Google Business API credentials (OAuth token, account ID, or location ID)",
      lastSyncedAt,
    };
  }

  try {
    const reviews = await requestGoogleBusinessReviews(
      accessToken,
      accountId,
      locationId
    );
    const normalizedReviews = normalizeGoogleBusinessReviews(reviews);

    return {
      source: "google",
      reviews: normalizedReviews,
      lastSyncedAt,
    };
  } catch (error) {
    console.error("Google Business API error:", error);
    return {
      source: "mock",
      reviews: [],
      fallbackReason:
        error instanceof Error ? error.message : "Unknown Google API error",
      lastSyncedAt,
    };
  }
}

/**
 * Fetch reviews using Google Places API (simpler, only needs API key)
 * Good for properties listed on Google Maps
 */
export async function fetchGooglePlacesReviews(): Promise<GoogleFetchResult> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID; // Your property's Google Place ID
  const lastSyncedAt = new Date().toISOString();

  if (!apiKey || !placeId) {
    return {
      source: "mock",
      reviews: [],
      fallbackReason: "Missing Google Places API key or Place ID",
      lastSyncedAt,
    };
  }

  try {
    const reviews = await requestGooglePlacesReviews(apiKey, placeId);
    const normalizedReviews = normalizeGooglePlacesReviews(reviews, placeId);

    return {
      source: "google",
      reviews: normalizedReviews,
      lastSyncedAt,
    };
  } catch (error) {
    console.error("Google Places API error:", error);
    return {
      source: "mock",
      reviews: [],
      fallbackReason:
        error instanceof Error ? error.message : "Unknown Google Places error",
      lastSyncedAt,
    };
  }
}

// ============================================================================
// Private Helper Functions
// ============================================================================

async function requestGoogleBusinessReviews(
  accessToken: string,
  accountId: string,
  locationId: string
): Promise<GoogleReviewRaw[]> {
  const url = `${GOOGLE_API_BASE_URL}/accounts/${accountId}/locations/${locationId}/reviews`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Google Business API error: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  return data.reviews || [];
}

async function requestGooglePlacesReviews(
  apiKey: string,
  placeId: string
): Promise<GooglePlaceReview[]> {
  const url = `${GOOGLE_PLACES_API_URL}/details/json?place_id=${placeId}&fields=reviews&key=${apiKey}`;

  const response = await fetch(url, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Google Places API error: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();

  if (data.status !== "OK") {
    throw new Error(`Google Places API returned status: ${data.status}`);
  }

  return data.result?.reviews || [];
}

/**
 * Convert Google Business reviews to our normalized format
 */
function normalizeGoogleBusinessReviews(
  reviews: GoogleReviewRaw[]
): HostawayReviewRaw[] {
  return reviews.map((review) => {
    const starMap = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };
    const rating = starMap[review.starRating] || 5;

    return {
      id: parseInt(review.reviewId) || Math.floor(Math.random() * 1000000),
      type: "guest-to-host",
      status: "published",
      rating,
      publicReview: review.comment || "",
      reviewCategory: [{ category: "Overall", rating }],
      submittedAt: review.createTime,
      guestName: review.reviewer.displayName,
      listingName: "Google Business Location",
    };
  });
}

/**
 * Convert Google Places reviews to our normalized format
 */
function normalizeGooglePlacesReviews(
  reviews: GooglePlaceReview[],
  placeId: string
): HostawayReviewRaw[] {
  return reviews.map((review, index) => ({
    id: review.time || Date.now() + index,
    type: "guest-to-host",
    status: "published",
    rating: review.rating,
    publicReview: review.text || "",
    reviewCategory: [{ category: "Overall", rating: review.rating }],
    submittedAt: new Date(review.time * 1000).toISOString(),
    guestName: review.author_name,
    listingName: `Google Place ${placeId}`,
  }));
}

/**
 * Helper to get OAuth2 URL for Google My Business API
 */
export function getGoogleOAuthUrl(
  clientId: string,
  redirectUri: string
): string {
  const scopes = ["https://www.googleapis.com/auth/business.manage"].join(" ");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: scopes,
    access_type: "offline",
    prompt: "consent",
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Exchange OAuth2 authorization code for access token
 */
export async function exchangeGoogleAuthCode(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string
): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
}> {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to exchange auth code: ${response.statusText}`);
  }

  return response.json();
}
