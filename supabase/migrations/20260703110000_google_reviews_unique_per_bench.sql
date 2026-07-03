-- google_review_name was globally UNIQUE, but two nearby benches can resolve
-- to the same Google place and legitimately share reviews; the second bench's
-- insert would then fail forever. Scope uniqueness to the bench instead.
ALTER TABLE public.google_reviews
  DROP CONSTRAINT IF EXISTS google_reviews_google_review_name_key;

ALTER TABLE public.google_reviews
  ADD CONSTRAINT google_reviews_bench_review_unique UNIQUE (bench_id, google_review_name);
