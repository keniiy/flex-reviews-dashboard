import { useEffect, useState } from "react";
import type { Review } from "@/types/reviews";
import type { GoogleReviewsResponse } from "@/types/api";

export function useGoogleReviews(
  listingName?: string,
  listingId?: string
) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [placeName, setPlaceName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!listingName) {
      setReviews([]);
      setPlaceName(null);
      return;
    }

    const controller = new AbortController();

    const fetchGoogle = async () => {
      try {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams({
          listingName,
        });
        if (listingId) {
          params.set("listingId", listingId);
        }
        const response = await fetch(
          `/api/reviews/google?${params.toString()}`,
          { signal: controller.signal }
        );
        if (!response.ok) {
          throw new Error("Unable to fetch Google reviews");
        }
        const payload: GoogleReviewsResponse = await response.json();
        if (!payload.success) {
          throw new Error(payload.meta?.fallbackReason ?? "Google error");
        }
        setReviews(payload.reviews ?? []);
        setPlaceName(payload.meta?.placeName ?? null);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Google reviews error");
      } finally {
        setLoading(false);
      }
    };

    fetchGoogle();
    return () => controller.abort();
  }, [listingName, listingId]);

  return { reviews, placeName, loading, error };
}
