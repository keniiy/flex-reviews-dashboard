# Flex Living Reviews Dashboard

A modern Next.js 16 application that helps Flex Living managers ingest Hostaway reviews, normalize them by property, and curate which testimonials are published on guest-facing pages.

## Features
- **Hostaway integration** with graceful fallback to realistic mock data (no empty dashboards when the sandbox has no reviews).
- **Review normalization** groups data per listing, computes category averages, and surfaces insights such as trends, approval rate, and channel mix.
- **Manager dashboard** offers KPI cards, advanced filters (rating, category, channel, timeframe, approval status), inline approvals, review-detail links, and quick access to each property page.
- **Property catalogue (`/property`)** showcases the portfolio with marketing-friendly hero, featured listings, and static About/Contact anchors that match the provided Flex Living comps.
- **Detailed property page** mirrors the Flex Living PDP layout with a hero gallery, booking widget, amenity chips, and an approved-review spotlight.
- **Single review page (`/reviews/[id]`)** lets managers deep-dive an individual review, flip approval state, and preview the underlying property gallery without hunting through the dashboard.
- **Theme-aware UI** powered by a lightweight context so the interface feels at home in both dark dashboard mode and light marketing pages.

## Getting Started
```bash
cp .env.example .env.local   # drop the provided Hostaway credentials if you have them
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000). The root route redirects to `/dashboard`.

## Environment Variables
| Key | Description |
| --- | --- |
| `HOSTAWAY_ACCOUNT_ID` | Hostaway account ID (61148 for the sandbox). |
| `HOSTAWAY_API_KEY` | API key/token used to mint short-lived access tokens. |
| `HOSTAWAY_API_BASE_URL` | Optional override (defaults to `https://api.hostaway.com/v1`). |

Without credentials the app automatically uses the bundled mock dataset so you can still explore every screen.

## API Routes
- `GET /api/reviews/hostaway` – Fetches Hostaway reviews, normalizes + groups them, and returns aggregate metrics alongside per-listing insights.
- `POST /api/reviews/approve` – Toggles whether a review should appear publicly. Uses an in-memory store that simulates what a database table would provide.

## Useful Scripts
| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js dev server. |
| `npm run build` | Create a production build. |
| `npm run start` | Run the compiled production build. |
| `npm run lint` | Run ESLint over the project. |

## Routes Overview
- `/dashboard` – operational workspace for approvals & insights.
- `/property` – marketing-facing listing explorer with hero, featured cards, and CTA sections.
- `/property/[listingId]` – property detail layout with gallery, amenities, booking widget, and curated reviews.
- `/reviews/[reviewId]` – single-review deep dive with approve/unapprove controls and property context.

## Documentation
Additional architectural notes, data-flow diagrams, and the Google Reviews exploration can be found in [`docs/IMPLEMENTATION.md`](docs/IMPLEMENTATION.md).
