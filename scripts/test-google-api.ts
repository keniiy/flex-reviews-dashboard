/**
 * Test script for Google APIs integration
 * Tests both Google Places API and Google My Business API
 */

import {
  fetchGooglePlacesReviews,
  fetchGoogleBusinessReviews,
} from "../modules/reviews/services/google.service";

async function testGooglePlacesAPI() {
  console.log("Testing Google Places API");

  try {
    const result = await fetchGooglePlacesReviews();

    console.log("Results:");
    console.log(`   Source: ${result.source}`);
    console.log(`   Reviews found: ${result.reviews.length}`);
    console.log(`   Last synced: ${result.lastSyncedAt}`);

    if (result.fallbackReason) {
      console.log(`Fallback reason: ${result.fallbackReason}\n`);
      console.log("To fix this:");
      console.log(
        "1. Get a Google Places API key from: https://console.cloud.google.com/"
      );
      console.log("2. Enable Places API for your project");
      console.log("3. Add to .env.local:");
      console.log("GOOGLE_PLACES_API_KEY=your_api_key_here");
      console.log("GOOGLE_PLACE_ID=your_place_id_here\n");
    } else {
      console.log("Successfully fetched Google Places reviews!\n");

      if (result.reviews.length > 0) {
        console.log("Sample Review:");
        const sample = result.reviews[0];
        console.log(`Guest: ${sample.guestName}`);
        console.log(`Rating: ${sample.rating}/5 ⭐`);
        console.log(`Review: ${sample.publicReview.substring(0, 100)}...`);
        console.log(
          `Date: ${new Date(sample.submittedAt).toLocaleDateString()}\n`
        );
      }
    }
  } catch (error) {
    console.error("Error testing Google Places API:");
    console.error(error);
  }
}

async function testGoogleBusinessAPI() {
  console.log("Testing Google My Business API");

  try {
    const result = await fetchGoogleBusinessReviews();

    console.log("Results:");
    console.log(`Source: ${result.source}`);
    console.log(`Reviews found: ${result.reviews.length}`);
    console.log(`Last synced: ${result.lastSyncedAt}`);

    if (result.fallbackReason) {
      console.log(`Fallback reason: ${result.fallbackReason}\n`);
    } else {
      console.log("Successfully fetched Google Business reviews!\n");

      if (result.reviews.length > 0) {
        console.log("Sample Review:");
        const sample = result.reviews[0];
        console.log(`Guest: ${sample.guestName}`);
        console.log(`Rating: ${sample.rating}/5 ⭐`);
        console.log(`Review: ${sample.publicReview.substring(0, 100)}...`);
        console.log(
          `   Date: ${new Date(sample.submittedAt).toLocaleDateString()}\n`
        );
      }
    }
  } catch (error) {
    console.error(error);
  }
}

async function main() {
  console.log("\nGoogle API Integration Tests\n");

  // Test Places API (simpler, only needs API key)
  await testGooglePlacesAPI();

  console.log("\n");

  // Test My Business API (requires OAuth)
  await testGoogleBusinessAPI();
  console.log("Tests Complete");
}

main();
