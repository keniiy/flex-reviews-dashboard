import { HostAwayReviewRaw } from "@/modules/reviews/types";

/**
 * Mock Host Away review data
 * Based on the example from the assessment brief
 */
export const mockHostawayReviews: HostAwayReviewRaw[] = [
  {
    id: 7453,
    type: "host-to-guest",
    status: "published",
    rating: null,
    publicReview:
      "Shane and family are wonderful! Would definitely host again :)",
    reviewCategory: [
      { category: "cleanliness", rating: 10 },
      { category: "communication", rating: 10 },
      { category: "respect_house_rules", rating: 10 },
    ],
    submittedAt: "2020-08-21 22:45:14",
    guestName: "Shane Finkelstein",
    listingName: "2B N1 A - 29 Shoreditch Heights",
  },
  {
    id: 7454,
    type: "host-to-guest",
    status: "published",
    rating: 9,
    publicReview: "Great stay! The apartment was clean and well-located.",
    reviewCategory: [
      { category: "cleanliness", rating: 9 },
      { category: "communication", rating: 9 },
      { category: "location", rating: 10 },
    ],
    submittedAt: "2023-09-15 14:30:22",
    guestName: "Maria Garcia",
    listingName: "2B N1 A - 29 Shoreditch Heights",
  },
  {
    id: 7455,
    type: "host-to-guest",
    status: "published",
    rating: 8,
    publicReview: "Nice place, would recommend!",
    reviewCategory: [
      { category: "cleanliness", rating: 8 },
      { category: "value", rating: 8 },
    ],
    submittedAt: "2024-01-10 09:15:00",
    guestName: "John Smith",
    listingName: "Spacious 2 Bed Flat in Hoxton",
  },
  {
    id: 7456,
    type: "host-to-guest",
    status: "published",
    rating: 10,
    publicReview: "Perfect apartment! Everything was as described.",
    reviewCategory: [
      { category: "cleanliness", rating: 10 },
      { category: "communication", rating: 10 },
      { category: "accuracy", rating: 10 },
    ],
    submittedAt: "2024-10-20 18:45:33",
    guestName: "Emma Wilson",
    listingName: "Spacious 2 Bed Flat in Hoxton",
  },
  {
    id: 7457,
    type: "host-to-guest",
    status: "published",
    rating: 7,
    publicReview: "Good location but could be cleaner.",
    reviewCategory: [
      { category: "cleanliness", rating: 6 },
      { category: "location", rating: 9 },
      { category: "value", rating: 7 },
    ],
    submittedAt: "2024-11-01 12:20:15",
    guestName: "David Chen",
    listingName: "Beautiful Pimlico Flat near Victoria Station",
  },
];
