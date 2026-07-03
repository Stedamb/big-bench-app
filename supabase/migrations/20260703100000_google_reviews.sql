-- Google Reviews cache (see docs/GOOGLE_REVIEWS.md)

-- Per-bench sync state: the resolved Google Place ID and when reviews were
-- last fetched. A row with place_id NULL means Google had no match for this
-- bench — cached too, so we don't retry the lookup on every page view.
CREATE TABLE IF NOT EXISTS public.google_review_sync (
  bench_id INTEGER PRIMARY KEY REFERENCES public.benches(id) ON DELETE CASCADE,
  place_id TEXT,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.google_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bench_id INTEGER NOT NULL REFERENCES public.benches(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_photo_url TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  content TEXT,
  relative_time TEXT, -- Google's localized relative date ("2 mesi fa")
  published_at TIMESTAMPTZ,
  google_review_name TEXT UNIQUE, -- Places API review resource name, prevents duplicates
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_google_reviews_bench_id ON public.google_reviews(bench_id);

ALTER TABLE public.google_review_sync ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_reviews ENABLE ROW LEVEL SECURITY;

-- Read-only for everyone; writes happen only from the fetch-google-reviews
-- Edge Function via the service role, which bypasses RLS.
CREATE POLICY "Google review sync state is viewable by everyone"
  ON public.google_review_sync FOR SELECT USING (true);

CREATE POLICY "Google reviews are viewable by everyone"
  ON public.google_reviews FOR SELECT USING (true);
