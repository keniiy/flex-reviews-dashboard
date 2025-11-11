import { mockHostawayReviews } from "@/lib/mock-data";
import type { HostawayReviewRaw } from "./types";

const HOSTAWAY_BASE_URL =
  process.env.HOSTAWAY_API_BASE_URL ?? "https://api.hostaway.com/v1";

export interface HostawayFetchResult {
  source: "hostaway" | "mock";
  reviews: HostawayReviewRaw[];
  fallbackReason?: string;
  lastSyncedAt: string;
}

export async function fetchHostawayReviews(): Promise<HostawayFetchResult> {
  const accountId = process.env.HOSTAWAY_ACCOUNT_ID;
  const apiKey = process.env.HOSTAWAY_API_KEY;
  const lastSyncedAt = new Date().toISOString();

  if (!accountId || !apiKey) {
    return {
      source: "mock",
      reviews: mockHostawayReviews,
      fallbackReason: "Missing HOSTAWAY_ACCOUNT_ID or HOSTAWAY_API_KEY",
      lastSyncedAt,
    };
  }

  try {
    const token = await requestAccessToken(accountId, apiKey);

    if (!token) {
      throw new Error("Hostaway token response did not include a token");
    }

    const hostawayReviews = await requestReviews(token, accountId);

    if (hostawayReviews.length === 0) {
      return {
        source: "mock",
        reviews: mockHostawayReviews,
        fallbackReason: "Hostaway sandbox responded without review data",
        lastSyncedAt,
      };
    }

    return {
      source: "hostaway",
      reviews: hostawayReviews,
      lastSyncedAt,
    };
  } catch (error) {
    console.error("Hostaway API error, falling back to mock data", error);
    return {
      source: "mock",
      reviews: mockHostawayReviews,
      fallbackReason:
        error instanceof Error ? error.message : "Unknown Hostaway error",
      lastSyncedAt,
    };
  }
}

async function requestAccessToken(accountId: string, apiKey: string) {
  const url = `${HOSTAWAY_BASE_URL.replace(/\/$/, "")}/accessTokens`;
  const formData = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: accountId,
    client_secret: apiKey,
    scope: "general",
  });

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Unable to authenticate with Hostaway (${response.statusText})`
    );
  }

  const tokenResponse = await response.json();
  return (
    tokenResponse.access_token ??
    tokenResponse.token ??
    tokenResponse.result?.token ??
    null
  );
}

async function requestReviews(token: string, accountId: string) {
  const url = new URL(`${HOSTAWAY_BASE_URL.replace(/\/$/, "")}/reviews`);
  url.searchParams.set("accountId", accountId);

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Account-Id": accountId,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Unable to fetch Hostaway reviews (${response.statusText})`);
  }

  const payload = await response.json();
  const result = payload.result ?? payload.reviews ?? [];
  return Array.isArray(result) ? (result as HostawayReviewRaw[]) : [];
}
