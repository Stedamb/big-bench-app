-- Create google_reviews table
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

-- Enable RLS
ALTER TABLE public.google_reviews ENABLE ROW LEVEL SECURITY;

-- Google reviews are viewable by everyone
CREATE POLICY "Google reviews are viewable by everyone" 
  ON public.google_reviews FOR SELECT USING (true);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_google_reviews_bench_id ON public.google_reviews(bench_id);
