# Google Reviews Integration Strategy

This document outlines the architecture for dynamically fetching and caching Google Reviews for Big Benches.

## 1. High-Level Architecture: "Fetch on Demand + Cache"

To minimize API costs and ensure fast page loads, we use a hybrid approach:

1.  **Frontend Request**: When a user opens a Bench Detail page, the app checks the local database for reviews associated with that `bench_id`.
2.  **Cache Validation**:
    *   **Hit**: If reviews exist and are less than 30 days old, display them immediately.
    *   **Miss/Stale**: If no reviews exist or they are older than 30 days, trigger a Supabase Edge Function.
3.  **Edge Function Execution**:
    *   Searches for the Google Place ID using the bench name and coordinates.
    *   Fetches the top 5 reviews using the Google Places API.
    *   Updates the `google_reviews` table with fresh data and a new `fetched_at` timestamp.
4.  **Display**: The frontend receives the fresh data and updates the UI.

---

## 2. Database Schema

A dedicated table stores the cached reviews.

```sql
CREATE TABLE IF NOT EXISTS public.google_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bench_id INTEGER REFERENCES public.benches(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  content TEXT,
  review_date TEXT, -- Relative date from Google (e.g., "2 months ago")
  google_review_id TEXT UNIQUE, -- Prevents duplicate imports
  fetched_at TIMESTAMPTZ DEFAULT now(), -- Used for cache invalidation (30-day TTL)
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_google_reviews_bench_id ON public.google_reviews(bench_id);
```

---

## 3. Supabase Edge Function (`fetch-google-reviews`)

The Edge Function handles the heavy lifting and keeps the API Key secure.

### Workflow:
1.  **Input**: Receives `bench_id`.
2.  **Lookup**: Gets `name`, `lat`, and `lng` from the `benches` table.
3.  **Google Search**: Calls `findplacefromtext` to get the `place_id`.
4.  **Google Details**: Calls `placedetails` with the `place_id` to get `reviews`.
5.  **Upsert**: Clears old reviews for that `bench_id` and inserts new ones.

---

## 4. Frontend Integration (React Query)

We use a custom hook to manage the fetch-and-sync logic.

```typescript
export const useGoogleReviews = (benchId: number) => {
  return useQuery({
    queryKey: ["google-reviews", benchId],
    queryFn: async () => {
      // 1. Fetch from Supabase
      const { data: cached, error } = await supabase
        .from("google_reviews")
        .select("*")
        .eq("bench_id", benchId)
        .order("created_at", { ascending: false });

      // 2. Determine if cache is stale (30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const isStale = !cached || cached.length === 0 || new Date(cached[0].fetched_at) < thirtyDaysAgo;

      if (isStale) {
        // 3. Trigger background sync via Edge Function
        // We use invoke() but don't necessarily 'await' it if we want to show stale data first
        const { data: fresh } = await supabase.functions.invoke('fetch-google-reviews', {
          body: { benchId }
        });
        return fresh;
      }

      return cached;
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours internal query cache
  });
};
```

---

## 5. Cost & Limitations

*   **API Limits**: The free tier of Google Places API allows ~1,000 requests/month for "Atmosphere" data (Reviews). Caching for 30 days ensures we stay well within this limit even with high traffic.
*   **Review Count**: The official API only returns the **top 5 reviews**. For a full set of reviews, a manual scrape into a separate JSON/Import flow is required.

---

## 6. Frontend UI: Displaying Reviews

The `BenchDetail` component should include a new section to render the reviews fetched via `useGoogleReviews`.

### Component Design:
- **Loading State**: Show a skeleton loader while the reviews are being fetched for the first time.
- **Cached vs. Fresh**: If data is loading in the background (Edge Function) but stale data exists, show the stale data immediately and update it seamlessly once the promise resolves.
- **Attribution**: A small text footer must be present: *"Reviews powered by Google"*.

### Example UI implementation:

```tsx
const ReviewList = ({ benchId }: { benchId: number }) => {
  const { data: reviews, isLoading } = useGoogleReviews(benchId);

  if (isLoading) return <ReviewSkeleton />;

  return (
    <div className="space-y-4">
      {reviews?.map(review => (
        <div key={review.google_review_id} className="border-b pb-4">
          <div className="flex justify-between items-center">
            <span className="font-bold text-sm">{review.author_name}</span>
            <span className="text-yellow-500">{"★".repeat(review.rating)}</span>
          </div>
          <p className="text-sm mt-1">{review.content}</p>
        </div>
      ))}
      <p className="text-[10px] text-muted-foreground italic">Powered by Google</p>
    </div>
  );
};
```
