# Google Reviews Integration

Fetches and caches Google reviews for each bench, shown as a "Recensioni da
Google" section on the bench detail page — separate from the community
Guestbook. Shipped to production on 2026-07-03.

Originally planned on the old `google-reviews` branch (May 2026, commit
`cdad9ba`); the implementation was updated for the **new Places API**
(`places.googleapis.com/v1`) since the legacy `findplacefromtext` /
`placedetails` endpoints in that plan are deprecated for new usage.

## Architecture: fetch on demand + cache

```
BenchDetailPage
  └─ GoogleReviews (component)
       └─ useGoogleReviews (hook)
            ├─ reads google_reviews + google_review_sync via PostgREST
            └─ if stale (>30d) → invokes Edge Function fetch-google-reviews
                                   ├─ Text Search (IDs-only, free) → place_id
                                   ├─ Place Details (reviews field, metered)
                                   └─ caches rows + sync state in Postgres
```

1. **Frontend** (`src/hooks/useGoogleReviews.ts`) reads cached reviews and
   the per-bench sync row directly from Supabase.
2. **Cache decision** (30-day TTL on `google_review_sync.fetched_at`):
   - Fresh → display immediately, no function call.
   - Stale with cached reviews → display stale data, refresh in the
     background, swap in the result (stale-while-revalidate).
   - Nothing cached → await the Edge Function.
3. **Edge Function** (`supabase/functions/fetch-google-reviews/index.ts`)
   holds the API key server-side:
   - Resolves the Place ID via Text Search with an **IDs-only field mask**
     (`places.id`), query `Big Bench <name>` biased to the bench coordinates
     (2 km radius), Italian language. Resolved once, reused on refreshes.
   - Fetches reviews via Place Details with field mask `reviews`.
   - Replaces the bench's cached rows and updates the sync row.

## Hardening (from the pre-merge code review)

- **Stampede / quota-abuse protection**: the function is invokable by anyone
  holding the public anon key. Before calling Google it *claims* the refresh
  slot by upserting `google_review_sync.fetched_at = now()`, so concurrent
  stale requests (or a client hammering the endpoint) hit the fresh-cache
  short-circuit instead of each triggering a metered Google call. If the
  refresh fails, `releaseClaim()` restores the previous sync row so a
  transient Google error doesn't freeze the bench for 30 days.
- **Shared-place collisions**: two nearby benches can resolve to the same
  Google place and legitimately share reviews, so review uniqueness is
  scoped per bench — `UNIQUE (bench_id, google_review_name)` — and the write
  is an upsert on that key, letting residual concurrent refreshes converge
  instead of erroring.
- **Negative caching**: a bench Google can't match gets a sync row with
  `place_id NULL`, so the lookup isn't retried on every page view until the
  TTL expires.

## Schema (migrations `20260703100000` + `20260703110000`)

- `google_review_sync(bench_id PK → benches, place_id, fetched_at)` — sync
  state; `place_id NULL` = "no Google match, don't retry until TTL".
- `google_reviews(id, bench_id → benches, author_name, author_photo_url,
  rating 1–5, content, relative_time, published_at, google_review_name,
  created_at)` with `UNIQUE (bench_id, google_review_name)` and an index on
  `bench_id`. Google returns at most 5 reviews per place.

Both tables are world-readable via RLS; writes happen only from the Edge
Function through the service role (which bypasses RLS — no write policies
exist on purpose). Row types are registered in
`src/integrations/supabase/types.ts`.

## API key

The key lives in the Supabase secret `GOOGLE_MAPS_API_KEY` (never in the
frontend or in Vercel). It is **website-restricted** to the app's domains in
Google Cloud Console, so the Edge Function sends
`Referer: https://bigbench.app/` on its Google calls to satisfy the
restriction (see `GOOGLE_REFERER` in the function). API restriction: Places
API (New) only.

To rotate the key: create/regenerate it in Google Cloud Console → run
`supabase secrets set GOOGLE_MAPS_API_KEY=<new>` — no redeploy needed,
secrets are read at runtime.

## Deploy / operate

```sh
supabase link --project-ref oznxvjfmjvuaircepkzz   # once per machine
supabase db push                                    # migrations
supabase functions deploy fetch-google-reviews
supabase secrets set GOOGLE_MAPS_API_KEY=<key>
```

Vercel needs no new variables for this feature (only the pre-existing
`VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`).

To force-refresh one bench's reviews (e.g. after fixing a wrong place
match): delete its sync row and let the next page view refetch —

```sql
DELETE FROM google_review_sync WHERE bench_id = <id>;
```

## Cost

New Places API pricing (per-SKU free tiers, since March 2025):

- **Text Search (IDs-only)** — free, unlimited. Place resolution costs
  nothing, and happens once per bench ever.
- **Place Details with `reviews`** — Enterprise SKU, **1,000 free
  calls/month**, ~$25/1,000 beyond.

With the 30-day TTL and the stampede guard, monthly Detail calls are bounded
by the number of distinct benches viewed (~380 official benches), so
steady-state usage stays inside the free tier regardless of traffic.

## Limitations & known trade-offs

- Only the **top 5 reviews** per place, chosen by Google.
- `relative_time` is a localized snapshot string ("2 mesi fa") frozen at
  fetch time; `published_at` holds the absolute timestamp if needed.
- Reviews shown without a Google map require the **"Powered by Google"**
  attribution, rendered in `src/components/blocks/GoogleReviews.tsx`.
- Place matching is a text search near the coordinates; a wrong match is
  possible for oddly named benches (fix: correct manually via the SQL above
  after setting the right `place_id`, or improve the query).
- Deliberate cleanup debt: the `Stars` component is duplicated between
  `GoogleReviews.tsx` and `BenchDetailPage.tsx`, and the 30-day TTL constant
  exists in both the hook and the function — keep them in sync.
