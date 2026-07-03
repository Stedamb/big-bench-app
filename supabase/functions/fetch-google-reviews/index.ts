// Fetches Google reviews for a bench and caches them in the google_reviews
// table with a 30-day TTL. Uses the new Places API (places.googleapis.com/v1):
// place resolution via Text Search with an IDs-only field mask (free SKU),
// reviews via Place Details with the `reviews` field (Enterprise SKU,
// 1,000 free calls/month — hence the aggressive caching).
//
// Required secret: GOOGLE_MAPS_API_KEY (supabase secrets set GOOGLE_MAPS_API_KEY=...)

import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

// The API key is website-restricted to the app's domains, so server-side
// calls must present a matching Referer to be accepted.
const GOOGLE_REFERER = "https://bigbench.app/";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

interface PlaceReview {
  name?: string;
  rating?: number;
  text?: { text?: string };
  originalText?: { text?: string };
  relativePublishTimeDescription?: string;
  publishTime?: string;
  authorAttribution?: { displayName?: string; photoUri?: string };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { benchId } = await req.json().catch(() => ({}));
    if (!Number.isInteger(benchId)) {
      return json({ error: "benchId must be an integer" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: sync } = await supabase
      .from("google_review_sync")
      .select("place_id, fetched_at")
      .eq("bench_id", benchId)
      .maybeSingle();

    const isFresh = sync &&
      Date.now() - new Date(sync.fetched_at).getTime() < CACHE_TTL_MS;

    if (isFresh) {
      const { data: cached } = await supabase
        .from("google_reviews")
        .select("*")
        .eq("bench_id", benchId)
        .order("published_at", { ascending: false });
      return json({ reviews: cached ?? [], cached: true });
    }

    const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
    if (!apiKey) {
      return json({ error: "GOOGLE_MAPS_API_KEY is not configured" }, 500);
    }

    // Claim the refresh slot before calling Google: concurrent stale requests
    // (or a client hammering the endpoint with the anon key) see a fresh sync
    // row and short-circuit above instead of stampeding the quota-limited
    // Places API. Restored via releaseClaim() if the refresh fails.
    await supabase.from("google_review_sync").upsert({
      bench_id: benchId,
      place_id: sync?.place_id ?? null,
      fetched_at: new Date().toISOString(),
    });
    const releaseClaim = async () => {
      if (sync) {
        await supabase.from("google_review_sync").upsert({
          bench_id: benchId,
          place_id: sync.place_id,
          fetched_at: sync.fetched_at,
        });
      } else {
        await supabase.from("google_review_sync").delete().eq("bench_id", benchId);
      }
    };

    // Resolve the Place ID once, then reuse it on later refreshes.
    let placeId: string | null = sync?.place_id ?? null;
    if (!placeId) {
      const { data: bench } = await supabase
        .from("benches")
        .select("name, lat, lng")
        .eq("id", benchId)
        .maybeSingle();
      if (!bench) {
        await releaseClaim();
        return json({ error: "Bench not found" }, 404);
      }
      const searchRes = await fetch(
        "https://places.googleapis.com/v1/places:searchText",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Referer": GOOGLE_REFERER,
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask": "places.id",
          },
          body: JSON.stringify({
            textQuery: `Big Bench ${bench.name}`,
            locationBias: {
              circle: {
                center: { latitude: bench.lat, longitude: bench.lng },
                radius: 2000,
              },
            },
            languageCode: "it",
          }),
        },
      );
      if (!searchRes.ok) {
        console.error("Places searchText failed", await searchRes.text());
        await releaseClaim();
        return json({ error: "Google Places search failed" }, 502);
      }
      const search = await searchRes.json();
      placeId = search.places?.[0]?.id ?? null;
    }

    let reviews: unknown[] = [];
    if (placeId) {
      const detailsRes = await fetch(
        `https://places.googleapis.com/v1/places/${placeId}?languageCode=it`,
        {
          headers: {
            "Referer": GOOGLE_REFERER,
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask": "reviews",
          },
        },
      );
      if (!detailsRes.ok) {
        console.error("Place details failed", await detailsRes.text());
        await releaseClaim();
        return json({ error: "Google Place details failed" }, 502);
      }
      const details = await detailsRes.json();

      const rows = ((details.reviews ?? []) as PlaceReview[])
        .filter((r) => r.authorAttribution?.displayName)
        .map((r) => ({
          bench_id: benchId,
          author_name: r.authorAttribution!.displayName!,
          author_photo_url: r.authorAttribution?.photoUri ?? null,
          rating: r.rating ?? null,
          content: r.text?.text ?? r.originalText?.text ?? null,
          relative_time: r.relativePublishTimeDescription ?? null,
          published_at: r.publishTime ?? null,
          google_review_name: r.name ?? null,
        }));

      // Replace the cached set: Google returns at most 5 reviews. The upsert
      // (vs plain insert) makes a residual concurrent refresh of the same
      // bench converge instead of failing on the per-bench unique constraint.
      await supabase.from("google_reviews").delete().eq("bench_id", benchId);
      if (rows.length > 0) {
        const { data: inserted, error: insertError } = await supabase
          .from("google_reviews")
          .upsert(rows, { onConflict: "bench_id,google_review_name" })
          .select();
        if (insertError) {
          console.error("google_reviews upsert failed", insertError);
          await releaseClaim();
          return json({ error: "Failed to cache reviews" }, 500);
        }
        reviews = inserted ?? [];
      }
    }

    // Record the sync even when no place was found, so we don't burn a
    // search request on every page view of an unmatched bench.
    await supabase.from("google_review_sync").upsert({
      bench_id: benchId,
      place_id: placeId,
      fetched_at: new Date().toISOString(),
    });

    return json({ reviews, cached: false });
  } catch (error) {
    console.error("fetch-google-reviews error", error);
    return json({ error: "Internal error" }, 500);
  }
});
