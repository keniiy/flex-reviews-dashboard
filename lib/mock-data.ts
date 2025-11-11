import { faker } from "@faker-js/faker";
import { HostawayReviewRaw } from "@/modules/reviews/types";

// Realistic property names
const propertyNames = [
  "2B N1 A - 29 Shoreditch Heights",
  "Spacious 2 Bed Flat in Hoxton",
  "Beautiful Pimlico Flat near Victoria Station",
  "Stunning 2 Bed Flat near Tower Bridge",
  "Modern Loft in King's Cross",
  "Elegant Studio in Canary Wharf",
  "Cozy 1 Bed in Camden",
  "Luxury Apartment in Mayfair",
];

// Review categories
const categories = [
  "cleanliness",
  "communication",
  "accuracy",
  "location",
  "checkin",
  "value",
];

// Generate a single review
function generateReview(id: number): HostawayReviewRaw {
  const rating = faker.number.int({ min: 6, max: 10 });
  const listingName = faker.helpers.arrayElement(propertyNames);

  // Generate category ratings (higher ratings more common)
  const reviewCategory = categories.map((category) => ({
    category,
    rating: faker.number.int({ min: rating - 1, max: 10 }),
  }));

  // Generate realistic review text based on rating
  let reviewText: string;
  if (rating >= 9) {
    reviewText = faker.helpers.arrayElement([
      "Absolutely stunning property! Everything was perfect from start to finish. The location is unbeatable and the apartment exceeded our expectations. Would definitely stay again!",
      "Incredible experience! The flat was spotlessly clean, beautifully decorated, and had everything we needed. Host was very responsive and helpful. Highly recommend!",
      "One of the best properties we've stayed at. The attention to detail is impressive and the location is perfect for exploring London. 10/10 would book again!",
      "Perfect stay! The apartment was exactly as described, if not better. Great communication from the host and seamless check-in process. Loved every minute!",
    ]);
  } else if (rating >= 7) {
    reviewText = faker.helpers.arrayElement([
      "Great property overall. The location was convenient and the apartment was clean. A few minor issues but nothing major. Would recommend for a short stay.",
      "Nice place with good amenities. Check-in was smooth and the host was responsive. The neighborhood is vibrant with plenty of cafes and shops nearby.",
      "Solid experience. The flat met our needs and was comfortable. WiFi was reliable which was important for work. A few things could be improved but overall good value.",
      "Good stay. The apartment was as described and the location was convenient for our purposes. Host was helpful when we had questions.",
    ]);
  } else {
    reviewText = faker.helpers.arrayElement([
      "The property has potential but there were some issues. Street noise was significant at night and the heating took a while to warm up. Check-in was smooth though.",
      "Decent stay but not without problems. WiFi was unreliable and the apartment could have been cleaner. Location was good but that alone doesn't make up for the issues.",
      "Mixed experience. The property needs some maintenance - a few things weren't working properly. Host did respond to our concerns eventually.",
    ]);
  }

  return {
    id,
    type: "host-to-guest",
    status: "published",
    rating,
    publicReview: reviewText,
    reviewCategory,
    submittedAt: faker.date
      .between({
        from: "2024-01-01",
        to: "2024-11-11",
      })
      .toISOString(),
    guestName: faker.person.fullName(),
    listingName,
  };
}

function slugifyListing(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function seedApprovals(reviews: HostawayReviewRaw[]): HostawayReviewRaw[] {
  const firstPerListing = new Set<string>();

  return reviews.map((review) => {
    const key = slugifyListing(review.listingName);
    if (!firstPerListing.has(key)) {
      firstPerListing.add(key);
      return { ...review, approved: true };
    }

    const approveMore = faker.datatype.boolean({ probability: 0.35 });
    return { ...review, approved: approveMore };
  });
}

// Generate 60 realistic reviews and ensure at least one approved per listing
export const mockHostawayReviews: HostawayReviewRaw[] = seedApprovals(
  Array.from({ length: 60 }, (_, i) => generateReview(7450 + i))
);
