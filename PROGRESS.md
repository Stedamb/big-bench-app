# Progress

Roadmap and changelog for Big Bench App. Implementation details live in
[`docs/`](docs/) and in the commit history.

## Roadmap

- [ ] **Moderation roles** — moderator and admin roles enforced by RLS; moderators can hide and restore Guestbook posts with an audit trail.
- [ ] **CI** — GitHub Actions pipeline for lint, tests and build; RLS policy tests.
- [ ] **Observability** — structured logging and error reporting for the `fetch-google-reviews` Edge Function.
- [ ] **Guestbook likes and comments** — UI on top of the existing tables and RLS policies.
- [ ] **Profile editing** — avatar and bio.
- [ ] **Client-side image compression** before upload, to reduce storage usage.
- [ ] **Cleanup** — single `Stars` component; single source for the reviews cache TTL.

## Changelog

### 2026-10

- Dependency upgrades: React Router 7, Zod 4, Vitest 4; security advisories resolved.
- Map clusters break apart at lower zoom levels on desktop.
- `fetch-google-reviews` surfaces database errors and uses the new Supabase secret-key format.

### 2026-09

- CARTO basemap tiles authenticated with an API key.
- Cached Google reviews shown in the Guestbook feed; empty photo galleries hidden.

### 2026-07

- **Google reviews on bench pages.** Reviews are fetched on demand through a Supabase Edge Function and cached in Postgres for 30 days (stale-while-revalidate). Place IDs are resolved once through the free IDs-only Text Search. Refresh-slot claiming prevents cache stampedes and quota abuse through the public key; benches without a match are cached negatively. See [`docs/GOOGLE_REVIEWS.md`](docs/GOOGLE_REVIEWS.md).
- **Security hardening.** Avatar uploads scoped to the owner's storage path; bucket limited to 5 MB and image MIME types; fixed likes/comments RLS policies; foreign key and length constraints on user content.
- **Android app** via Capacitor, wrapping the web frontend; Expo reference app and mobile roadmap in [`mobile/`](mobile/).
- Supabase CLI linked to the production project with a repaired migration history.

### 2026-05

- **Guestbook**: card-based social feed with multi-image posts, one review per user per bench (enforced by a unique constraint), background tables for likes and comments.
- **Architecture refactor**: components split into `layout/` and `blocks/`; shared `BenchHeader`, `BenchStats` and `NavigationButtons` blocks.
- **Localization**: Italian region names and European country names across filters, popups and headers.
- **UX**: page transitions with Motion, haptic feedback on mobile, compact bench drawer, guest-mode prompt to sign in.
- **Map**: reliable "View on map" navigation through a dedicated map controller; zoom ceiling on search and selection; marker clustering and viewport-based rendering.
- **Stability**: full component audit fixing rules-of-hooks violations, race conditions in visited-bench state, and type-safety gaps.
- Google sign-in.

### 2026-04

- Initial prototype: bench map with 450+ benches imported from GeoJSON, authentication, community posts with photo uploads.
