---
title: React Native (Expo) port of BigBenchApp
date: 2026-07-02
type: requirements
---

## Status update (2026-07-03): superseded by Capacitor

After the Expo POC and a full feature port (`mobile/`: map, auth, bench
detail, guestbook), the reuse question was revisited: the priority is using
the web app's actual components (shadcn/Radix/Tailwind/Leaflet), which React
Native cannot render. Decision: wrap the existing web app with **Capacitor**
(`android/`, `capacitor.config.ts`) — 100% frontend reuse, native shell for
store distribution and device APIs. The Expo app remains in `mobile/` as a
working reference for a future fully-native track; the roadmap below applies
to that track only. Capacitor next steps: install Android Studio (SDK +
Java) to build/run, add `@capacitor/geolocation` if the web geolocation
bridge proves unreliable, iOS platform once Xcode is available.

## Summary

BigBenchApp is a Vite + React + Supabase web app for discovering and tracking
"Big Benches" (Panchine Giganti) across Italy. This document scopes a native
mobile port: a separate Expo app in `mobile/`, sharing the existing Supabase
project, targeting iOS and Android. A working proof of concept already exists
at `mobile/` — a native map rendering all benches with clustering and the
same bicolor pin styling as the web app, fetched live from the production
Supabase project. This document records the scope decisions behind it and the
roadmap for everything the POC deliberately left out.

## Decisions

- **Relationship to the web app:** separate Expo app in `mobile/` inside this
  repo, not a monorepo restructure and not a react-native-web unification.
  The web app is untouched; the two apps share nothing except the Supabase
  backend and, where practical, hand-copied logic (hooks, types, constants).
- **Map engine:** `react-native-maps` (native Apple Maps on iOS, Google Maps
  on Android) with `react-native-map-clustering` for marker clustering —
  replaces Leaflet + `react-leaflet-cluster`, which has no RN equivalent.
- **Platforms:** iOS and Android, via EAS Build.
- **Feature scope:** port existing web features (map, bench detail, visited
  tracking, progress, guestbook, auth) plus one native-only addition — GPS
  proximity check-in. No offline mode, no push notifications for v1.
- **POC scope:** map + markers only, fetched from the real Supabase project.
  This was chosen over a broader vertical slice (map + auth + visited toggle)
  or a map-less data-layer POC because the map engine swap is the one piece
  with no direct code-reuse path from the web app — everything else (auth,
  Supabase queries, business logic) is a straightforward port. Proving the
  hard part first de-risks the rest of the roadmap.

## What the POC proves

Verified working (`mobile/`, `npx tsc --noEmit` clean, `npx expo export
--platform ios` bundles 807 modules with no resolution errors):

- A native Expo app can talk to the same Supabase project as the web app
  (`mobile/lib/supabase.ts`, `mobile/.env` sourced from the web app's
  `.env.local`) and fetch the live `benches` + `bench_colors` tables.
- The bench-color sort/flatten query logic in `src/hooks/useBenches.ts` ports
  directly (`mobile/lib/useBenches.ts`) — same query shape, same result
  shape, no schema changes needed.
- The bicolor SVG pin markup in `src/components/blocks/BenchMap.tsx`
  (`createBenchIcon`) translates 1:1 to `react-native-svg`
  (`mobile/components/BenchPin.tsx`) — same path data, same gradient split,
  same visual result.
- `react-native-map-clustering` renders custom marker components as cluster
  children with a plain prop-based API — no equivalent of the web app's
  `react-leaflet-cluster` no-op-update bug (`docs` bug report, finding #4)
  carries over, since RN's clustering re-renders on every marker-array change
  rather than mutating a Leaflet layer group in place.

## Unverified / deferred from the POC

- **Rendering at real device scale.** The POC was typechecked and bundled but
  not run on an iOS Simulator or Android emulator in this environment (no
  simulator available). `tracksViewChanges={false}` is set on markers as a
  known RN perf requirement for 500+ custom-view markers, but actual
  frame-rate behavior on device is unverified — first task of phase 1.
- **Stale generated Supabase types.** `src/integrations/supabase/types.ts`
  (the web app's committed, "auto-generated" types file) has no `benches` or
  `bench_colors` table definitions — only `profiles` and `visited_benches`.
  Typechecking the mobile POC against it failed outright. This is a
  pre-existing web-app issue (matches finding #18 from the prior code
  review: `as any` casts in `useBenches.ts` hide exactly this drift), not
  something introduced by the port. The POC's Supabase client is untyped as
  a result. **Regenerating types from the live schema is a prerequisite for
  phase 1**, and should probably be fixed in the web app too.
- Auth, visited-toggle, guestbook, bench detail, progress tracking, GPS
  check-in — all out of scope for the POC, all in scope for the roadmap
  below.

## Roadmap

### Phase 0 — Prerequisite fixes (before further mobile work)

- Regenerate `src/integrations/supabase/types.ts` from the live schema
  (`supabase gen types typescript`) so both apps can use a typed client.
- Apply the storage-policy and `.env` security fixes already identified for
  the web app if not yet shipped — the mobile app reuses the same bucket and
  project, so unfixed issues ship twice.

### Phase 1 — Data layer and map hardening

- Swap `mobile/lib/supabase.ts`'s AsyncStorage adapter for
  `expo-secure-store` (session tokens should not sit in plain AsyncStorage).
- Reintroduce TanStack Query (`@tanstack/react-query`) in place of the POC's
  plain `useEffect` fetch, matching the web app's caching/staleTime behavior.
- Add viewport fitting equivalent to the web app's `FitBounds` — compute
  bounds from the fetched benches and animate the region on first load and
  on filter change (not on every refetch — port the fix for finding #6 from
  the web app review, don't reintroduce the bug).
- Verify marker rendering performance on an actual iOS Simulator and Android
  emulator with all ~530 benches; tune `tracksViewChanges`,
  `clusterColor`/`radius`, and consider `Animated` region transitions.
- Port `MapFilters` (region/color/visited filters) as native controls
  (bottom sheet or filter modal — `@gorhom/bottom-sheet` recommended over a
  popover, which doesn't have a good mobile analogue).

### Phase 2 — Auth and visited tracking

- Port `AuthContext` — email/password auth is a direct port. Google sign-in
  uses `@react-native-google-signin/google-signin` +
  `supabase.auth.signInWithIdToken` instead of the web OAuth redirect flow;
  requires registering native OAuth client IDs in the Google Cloud project
  and Supabase Auth settings (backend config addition — no schema change).
- Port `useVisitedBenches`, replacing `localStorage` with AsyncStorage for
  the guest (logged-out) visit list. Fix the two known bugs from the web
  review before porting rather than after: the silent-data-loss login merge
  (finding #2) and the optimistic-toggle-without-rollback issue (finding #9).
- Port the Progress screen and `ProgressTracker`.

### Phase 3 — Bench detail and guestbook

- Bench detail screen: description, artist, install date, colors, stamp
  locations.
- Guestbook: photo posts via `expo-image-picker` (+ client-side compression
  before upload — the web app has no compression either, worth adding for
  mobile data costs), ratings, comments.
- Apply the storage-policy fix (path-scoped uploads) before wiring up mobile
  uploads — the vulnerability is bucket-level, so it affects both clients
  equally, but adding a second upload path makes it more urgent to fix
  first.

### Phase 4 — GPS proximity check-in (native-only addition)

- `expo-location`, foreground ("when in use") permission only — no
  background tracking, keeps App Store / Play Store review simple.
- Distance-sorted "near you" list on top of the existing bench dataset (pure
  client-side haversine distance, no backend change).
- Proximity prompt (~150m radius) offering to pre-confirm a visit, reusing
  the Phase 2 visited-toggle logic rather than a separate write path.

### Phase 5 — Polish and release

- App icons, splash screen, dark mode via `useColorScheme`.
- Haptics via `expo-haptics` (replaces the web app's `web-haptics`).
- EAS Build configuration, TestFlight and Play Console internal testing
  tracks, store listing assets.

## Scope boundaries

- **Deferred for later:** offline support (cached bench/visited data without
  connectivity), push notifications, background location tracking.
- **Outside this port's identity:** unifying web and native into one
  react-native-web codebase; monorepo package extraction (revisit only if a
  second native-adjacent surface appears — until then, hand-copying the
  small set of shared hooks/types keeps the two apps decoupled at low cost).

## Dependencies / assumptions

- Backend requires no schema changes for the ported feature set — same
  tables, same RLS policies, same storage bucket. The only backend addition
  is registering native Google OAuth client IDs.
- Assumes an Apple Developer account ($99/yr) and Google Play Console
  account ($25 one-time) will be available before phase 5 (store
  submission) — not needed for phases 0–4, which can be validated via
  Simulator/emulator and TestFlight/internal-testing without a public store
  listing.
