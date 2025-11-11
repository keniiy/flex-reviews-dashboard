import { useCallback, useEffect, useState } from "react";
import type { ListingReviews } from "@/types/reviews";
import type {
  ReviewsApiResponse,
  ReviewsSourceMeta,
  ReviewsTotals,
} from "@/types/api";

export function useReviewsData() {
  const [listings, setListings] = useState<ListingReviews[]>([]);
  const [totals, setTotals] = useState<ReviewsTotals | null>(null);
  const [sourceMeta, setSourceMeta] = useState<ReviewsSourceMeta | null>(null);
  const [sourcesMeta, setSourcesMeta] = useState<
    Record<string, ReviewsSourceMeta>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/reviews/hostaway");
      if (!response.ok) {
        throw new Error("Unable to load reviews");
      }
      const data: ReviewsApiResponse = await response.json();
      if (!data.success) {
        throw new Error("Reviews API responded with an error");
      }

      setListings(data.listings);
      setTotals(data.totals);
      setSourceMeta(data.source);
      setSourcesMeta(data.sources ?? { hostaway: data.source });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    listings,
    setListings,
    totals,
    setTotals,
    sourceMeta,
    sourcesMeta,
    loading,
    error,
    refresh: fetchData,
  };
}
