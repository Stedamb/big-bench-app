import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface GoogleReview {
  id: string;
  bench_id: number;
  author_name: string;
  author_photo_url: string | null;
  rating: number | null;
  content: string | null;
  relative_time: string | null;
  published_at: string | null;
}

const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // matches the Edge Function TTL

export const useGoogleReviews = (benchId?: number) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["google-reviews", benchId],
    enabled: !!benchId,
    staleTime: 1000 * 60 * 60 * 24,
    queryFn: async (): Promise<GoogleReview[]> => {
      const [{ data: cached }, { data: sync }] = await Promise.all([
        supabase
          .from("google_reviews")
          .select("*")
          .eq("bench_id", benchId!)
          .order("published_at", { ascending: false }),
        supabase
          .from("google_review_sync")
          .select("fetched_at")
          .eq("bench_id", benchId!)
          .maybeSingle(),
      ]);

      const reviews = (cached ?? []) as GoogleReview[];
      const isFresh =
        sync &&
        Date.now() - new Date(sync.fetched_at as string).getTime() <
          CACHE_TTL_MS;

      if (isFresh) return reviews;

      const refresh = () =>
        supabase.functions.invoke("fetch-google-reviews", {
          body: { benchId },
        });

      // Stale-while-revalidate: show cached reviews immediately and swap in
      // the fresh set once the Edge Function responds.
      if (reviews.length > 0) {
        refresh()
          .then(({ data, error }) => {
            if (!error && data?.reviews) {
              queryClient.setQueryData(
                ["google-reviews", benchId],
                data.reviews as GoogleReview[],
              );
            }
          })
          .catch(() => {});
        return reviews;
      }

      // Nothing cached: wait for the fetch. Errors degrade to an empty list
      // so the section simply doesn't render.
      const { data, error } = await refresh();
      if (error || !data?.reviews) return [];
      return data.reviews as GoogleReview[];
    },
  });
};
