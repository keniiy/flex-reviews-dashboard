/**
 * Script to test Hostaway API access
 * This script will verify that the API credentials work and fetch basic data
 *
 * Hostaway uses OAuth2 Client Credentials flow for authentication
 */

const HOSTAWAY_CONFIG = {
  clientId: "61148", // Account ID
  clientSecret:
    "f94377ebbbb479490bb3ec364649168dc443dda2e4830facaf5de2e74ccc9152", // API Key
  baseUrl: "https://api.hostaway.com/v1",
  tokenUrl: "https://api.hostaway.com/v1/accessTokens",
};

interface TokenResponse {
  token_type: string;
  expires_in: number;
  access_token: string;
}

interface HostawayResponse<T> {
  status: string;
  result: T;
  count?: number;
}

interface Listing {
  id: number;
  name: string;
  [key: string]: unknown;
}

interface Review {
  id: number;
  listingMapId?: number;
  [key: string]: unknown;
}

/**
 * Get OAuth2 access token using client credentials
 */
async function getAccessToken(): Promise<string> {
  console.log("Step 1: Obtaining OAuth2 access token...\n");

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: HOSTAWAY_CONFIG.clientId,
    client_secret: HOSTAWAY_CONFIG.clientSecret,
    scope: "general",
  });

  const response = await fetch(HOSTAWAY_CONFIG.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Cache-Control": "no-cache",
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to get access token: ${response.status} ${response.statusText}\n${errorText}`
    );
  }

  const tokenData: TokenResponse = await response.json();
  console.log("Access token obtained successfully!");
  console.log(`Token type: ${tokenData.token_type}`);
  console.log(
    `   Expires in: ${tokenData.expires_in} seconds (${Math.floor(
      tokenData.expires_in / 86400
    )} days)`
  );
  console.log(`   Access token: ${tokenData.access_token.substring(0, 50)}...`);
  console.log("");

  return tokenData.access_token;
}

async function testHostawayAPI() {
  console.log("Testing Hostaway API Connection...\n");
  console.log(`Client ID (Account ID): ${HOSTAWAY_CONFIG.clientId}`);
  console.log(`Base URL: ${HOSTAWAY_CONFIG.baseUrl}\n`);

  try {
    // Step 1: Get access token
    const accessToken = await getAccessToken();

    // Prepare headers with access token
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
    };

    // Test 2: Fetch listings
    console.log("Step 2: Fetching listings...");
    const listingsResponse = await fetch(
      `${HOSTAWAY_CONFIG.baseUrl}/listings`,
      {
        headers,
        method: "GET",
      }
    );

    if (!listingsResponse.ok) {
      const errorText = await listingsResponse.text();
      throw new Error(
        `Listings API failed: ${listingsResponse.status} ${listingsResponse.statusText}\nResponse: ${errorText}`
      );
    }

    const listingsData: HostawayResponse<Listing[]> =
      await listingsResponse.json();
    console.log("Listings fetch successful!");
    console.log(
      `Total count: ${
        listingsData.count || listingsData.result?.length || 0
      } listings`
    );
    if (listingsData.result && listingsData.result.length > 0) {
      console.log(
        `Sample listing: ID ${listingsData.result[0].id} - ${listingsData.result[0].name}`
      );
    }
    console.log("");

    // Test 3: Fetch reviews
    console.log("Step 3: Fetching reviews...");
    const reviewsResponse = await fetch(`${HOSTAWAY_CONFIG.baseUrl}/reviews`, {
      headers,
    });

    if (!reviewsResponse.ok) {
      const errorText = await reviewsResponse.text();
      throw new Error(
        `Reviews API failed: ${reviewsResponse.status} ${reviewsResponse.statusText}\nResponse: ${errorText}`
      );
    }

    const reviewsData: HostawayResponse<Review[]> =
      await reviewsResponse.json();
    console.log("Reviews fetch successful!");
    console.log(
      `Total count: ${
        reviewsData.count || reviewsData.result?.length || 0
      } reviews`
    );
    if (reviewsData.result && reviewsData.result.length > 0) {
      console.log(
        `Sample review: ID ${reviewsData.result[0].id} for listing ${
          reviewsData.result[0].listingMapId || "N/A"
        }`
      );
    }
    console.log("");

    // Summary
    console.log("All API Tests Passed Successfully!");
    console.log("OAuth2 Authentication: Working");
    console.log(
      `Listings API: Working (${
        listingsData.count || listingsData.result?.length || 0
      } listings)`
    );
    console.log(
      `Reviews API: Working (${
        reviewsData.count || reviewsData.result?.length || 0
      } reviews)`
    );
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

// Run the test
testHostawayAPI();
