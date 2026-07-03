# Google Reviews Integration

Dynamically fetches and caches Google reviews for each bench, shown as a
"Recensioni da Google" section on the bench detail page — separate from the
community Guestbook.

Originally planned on the `google-reviews` branch (May 2026); this version is
updated for the **new Places API** (`places.googleapis.com/v1`) — the legacy
`findplacefromtext`/`placedetails` endpoints in the original plan are
deprecated for new usage.

## Architecture: fetch on demand + cache

1. **Frontend** (`useGoogleReviews`) reads cached reviews and the per-bench
   sync row directly from Supabase.
2. **Cache decision** (30-day TTL on `google_review_sync.fetched_at`):
   - Fresh → display immediately, no function call.
   - Stale with cached reviews → display stale data, refresh in the
     background via the Edge Function, swap in the result.
   - Nothing cached → await the Edge Function.
3. **Edge Function** (`fetch-google-reviews`) holds the API key:
   - Resolves the Place ID via Text Search with an **IDs-only field mask**
     (`places.id`), biased to the bench coordinates (2 km radius).
   - Fetches reviews via Place Details with field mask `reviews`.
   - Replaces the cached rows and upserts the sync row.
   - A bench Google can't match gets a sync row with `place_id NULL`, so the
     lookup isn't retried on every page view until the TTL expires.

## Schema

- `google_review_sync(bench_id PK, place_id, fetched_at)` — sync state.
- `google_reviews(id, bench_id, author_name, author_photo_url, rating,
  content, relative_time, published_at, google_review_name UNIQUE)` — the
  cached reviews (Google returns at most 5 per place).

Both tables are world-readable via RLS; writes happen only from the Edge
Function through the service role.

## Setup

```sh
supabase secrets set GOOGLE_MAPS_API_KEY=<key>   # key needs "Places API (New)" enabled
supabase functions deploy fetch-google-reviews
supabase db push                                  # applies the migration
```

## Cost

New Places API pricing (per-SKU free tiers, since March 2025):

- **Text Search (IDs-only)** — free, unlimited. Place resolution costs nothing.
- **Place Details with `reviews`** — Enterprise SKU, **1,000 free calls/month**,
  ~$25/1000 beyond that.

With a 30-day TTL, monthly Detail calls are bounded by the number of distinct
benches viewed (~380 official benches), so steady-state usage stays inside the
free tier regardless of traffic.

## Limitations

- The API returns only the **top 5 reviews** per place, chosen by Google.
- `relative_time` is a localized snapshot string ("2 mesi fa") frozen at fetch
  time; `published_at` holds the absolute timestamp if exact dates are needed.
- Reviews shown without a Google map require the **"Powered by Google"**
  attribution, rendered in the `GoogleReviews` component.
