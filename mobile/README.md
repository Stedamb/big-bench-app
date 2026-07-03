# BigBenchApp — Expo app

React Native port of the web app at `../`, sharing the same Supabase project.

## What's here

- `App.tsx` — bottom tabs (Mappa / Guestbook / Profilo) + native stack for
  bench detail, wrapped in TanStack Query + AuthProvider.
- `lib/supabase.ts` — Supabase client using AsyncStorage for session persistence
  (swap for `expo-secure-store` before shipping — see roadmap).
- `lib/useBenches.ts`, `lib/useVisitedBenches.ts`, `lib/useGuestbook.ts` — ports
  of the web hooks (same queries, incl. the web app's data-safety fixes).
- `screens/MapScreen.tsx` — clustered native map, CARTO tiles, bicolor pins;
  callout tap opens bench detail.
- `screens/BenchDetailScreen.tsx` — stats, visited toggle, stamp locations,
  per-bench guestbook with composer (text, rating, photos via image picker).
- `screens/GuestbookScreen.tsx` — global feed.
- `screens/ProfileScreen.tsx` — email/password auth (login/signup) when logged
  out; profile + visited progress + sign-out when logged in. Google sign-in
  needs a dev build (roadmap phase 2).

## Setup

```bash
cd mobile
npm install
# .env should already exist with real values. If it's missing (or contains the
# your-project placeholders), recreate it from the web app's ../.env.local:
#   EXPO_PUBLIC_SUPABASE_URL      = VITE_SUPABASE_URL (unquoted)
#   EXPO_PUBLIC_SUPABASE_ANON_KEY = VITE_SUPABASE_PUBLISHABLE_KEY (unquoted)
npx expo start -c
```

Dependencies with native code (maps, async-storage, svg) must stay on the
versions Expo pins for the SDK — install them with `npx expo install <pkg>`,
never plain `npm install <pkg>`, and run `npx expo install --check` after any
dependency change. A mismatched native module fails at runtime in Expo Go with
errors like `Native module is null`.

Press `i` for iOS Simulator or `a` for Android emulator. Clustering and custom
markers require a native build (`expo prebuild` / dev client or EAS build) —
they will not render correctly in Expo Go on some SDKs; if `npx expo start`
in Expo Go shows a blank map, run `npx expo run:ios` / `npx expo run:android`
instead.

## Known gaps in this POC (by design — see `docs/brainstorms/*-expo-roadmap.md`)

- No auth, no visited-toggle, no guestbook — map rendering only.
- No FitBounds-equivalent viewport fitting; region is hardcoded to Italy.
- Untyped Supabase client — the web app's committed `database.types.ts` predates
  the `benches`/`bench_colors` tables and needs regenerating from the live schema
  before any typed client is reintroduced (mobile or web).
