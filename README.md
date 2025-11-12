# Flex Living Reviews Dashboard

## About the app

This is the admin center for Flex Living. The dashboard normalizes Hostaway reviews, lets managers approve/reject them in-context, and shows how those testimonials surface on the marketing-facing property pages. Every listing keeps its history and insights inside an accordion so we can scan KPIs quickly, then dive into the relevant reviews without leaving the page. When a Google Place match exists, the property detail page also shows the most recent public review so the ops and marketing teams see the same public story.

### Tech stack (frontend & backend)

| Layer | Tools |
| --- | --- |
| Frontend | Next.js 16 (App Router), React 19, Tailwind/TWCS, Radix/Lucide UI, TypeScript |
| Backend | Next.js route handlers (`app/api/**`) calling Hostaway + Google services |
| Data/logic | Services in `modules/reviews/services/*`, reusable hooks (`useReviewsData`, `useGoogleReviews`), persisted approvals (`data/approvals.json`), cached Google place IDs (`data/google-places.json`) |
| Tooling | ESLint, Faker mock data, docs in `docs/deliverables.md` & `docs/summary.txt` |

### Key design & logic decisions

- **Shared services + hooks**: Hostaway ingestion, Google lookup, and analytics. Pages only import hook, keeping data fetching reusable and testable.

- **Optimistic approvals**: Dashboard accordion cards show filtered reviews, and approving/unapproving updates KPIs immediately while the API request runs in the background.

- **Accordion UX**: Each listing holds its own history in an expandable card. controls let ops scan dozens of properties quickly.
making it in a simple list would make the UX overwhelming and noisy

- **Cache + overrides**: Google place matches persist to a local json file.  and can be overridden via config`, so the Text Search guess can be corrected once and reused.

- **Dark mode + skeletons**: Theming is just my personal flare, toggle keeps the admin vs marketing personas clear, and skeleton loaders provide a nice preloader while Hostaway/Google calls resolve.

### Running version / local setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000). Approvals persist to `data/approvals.json`. Google overrides live in `config/google-places.overrides.json`. Currently not deployed—submit your own build (Vercel, Netlify, etc.) when ready.

### API behaviors

| Route | Description |
| --- | --- |
| `GET /api/reviews/hostaway` | Authenticates with Hostaway, normalizes + groups reviews, returns totals and channel/category insights. Falls back to `lib/mock-data.ts` and logs the reason when the sandbox is empty. |
| `POST /api/reviews/approve` | Persists approve/unapprove state into `data/approvals.json` so public pages only show curated testimonials. |
| `GET /api/reviews/google` | Resolves a listing name to a Place ID via Google Places Text Search, caches the mapping, and returns normalized Google review data when a match exists. |

### Google Reviews findings

- Created a GCP project, enabled Places API, and used the free credit to test Text Search + Details.
- Because Hostaway doesn’t expose Place IDs, the app tries to match by listing name/location and caches the successful match. Manual overrides let you pin an exact Place ID if the automatic search is off.
- Google reviews only show on the property detail page—ops can see the latest public review beneath the Hostaway-approved list, while the dashboard stays focused on internal data.

### AI tool used

- ChatGPT assisted for autocomplete and quick research support (e.g. clarifying API behavior, summarizing docs). All architecture, logic, and implementation were done manually.
