# Project Progress - Session July 3, 2026

## 🚀 Overview
Shipped Google reviews on bench detail pages end-to-end (plan from the May `google-reviews` branch, rebuilt on the new Places API), and applied the previously-unapplied security migration to production.

## ✅ Completed Features

### 1. Google Reviews on Bench Pages
- **"Recensioni da Google" section** on `BenchDetailPage`, below the Guestbook: author avatar, star rating, localized relative date, review text, "Powered by Google" attribution. Hidden for benches with no match.
- **Fetch-on-demand + 30-day cache**: `useGoogleReviews` reads cached rows from Postgres; stale data triggers the `fetch-google-reviews` Edge Function (stale-while-revalidate). Place IDs resolved once via free IDs-only Text Search; reviews via Place Details (1,000 free calls/month, usage bounded by bench count thanks to the TTL).
- **Hardened after code review**: refresh-slot claiming prevents cache stampedes and anon-key quota abuse; per-bench unique constraint + upsert handle two benches sharing one Google place; negative caching for unmatched benches.
- **Key handling**: API key lives in Supabase secrets, website-restricted in Google Cloud; the function sends the app-domain `Referer` to satisfy the restriction. Full docs in `docs/GOOGLE_REVIEWS.md`.

### 2. Infrastructure Reconciliation
- **Supabase CLI onboarded**: installed, linked to the real project (`oznxvjfmjvuaircepkzz` — `config.toml` pointed at a nonexistent ref), migration history repaired so `supabase db push` works normally.
- **Security fixes applied to production**: discovered the merged PR #13 migration (avatar path takeover, bucket MIME/size limits, likes/comments RLS, visited_benches FK) had never been applied to the live DB; it now is.

## 📋 Remaining Tasks
- [ ] Regenerate the Google API key (exposed in a chat session) and `supabase secrets set` the new one.
- [ ] Cleanup debt: dedupe the `Stars` component (`GoogleReviews.tsx` vs `BenchDetailPage.tsx`); single source for the 30-day TTL constant.

---

# Project Progress - Session May 13, 2026

## 🚀 Overview
Resolved a critical map navigation bug where "Vedi sulla mappa" (View on Map) failed to center the map on the target bench. 

## ✅ Completed Features

### 1. Map Navigation Reliability Fix
- **Refactored Map Viewport Control**: Integrated a `MapController` component directly into the `MapContainer` hierarchy to handle programmatic view updates (`map.setView`).
- **Removed Brittle Ref-based Logic**: Eliminated an unreliable `useEffect` in the parent `BenchMap` component that was attempting to manage map state via `mapRef.current` across re-renders. The new `MapController` approach ensures the map always receives the latest centering instructions immediately upon mount or prop updates.
- **Improved Interaction flow**: Fixed race conditions between the initial map state and the navigation trigger, ensuring users arrive at the correct marker every time they click "Vedi sulla mappa".

## 📋 Remaining Tasks
- [ ] Implement user profile editing (avatar/bio).
- [ ] Activate "Likes" (Bench icons) and "Comments" UI in the Guestbook.
- [ ] Add image compression/resizing before upload to reduce storage costs.

---

# Project Progress - Session May 12, 2026


## 🚀 Overview
Executed a major architectural refactor to improve componentization, implemented localization for regions and countries, and added high-end UX polish including haptics and page transitions.

## ✅ Completed Features

### 1. Architectural Refactor (DRY & Modular)
- **Component Restructuring**: Organized the `src/components` directory into clear `layout/` and `blocks/` folders to improve maintainability and discoverability.
- **Legacy Cleanup**: Identified and deleted unused legacy components (`BenchDetail.tsx`).
- **Maximum Composability**: Extracted reusable UI blocks to eliminate code duplication between the Bench Drawer (`BenchVault`) and `BenchDetailPage`:
  - `BenchHeader`: Standardized bench identity display (number, colors, name, location).
  - `BenchStats`: Flexible component for displaying bench metadata (Altitude, Year, Coordinates) in grid or list layouts.
  - `NavigationButtons`: Centralized logic for Google Maps and "Drive To" integrations.

### 2. Localization & Mapping
- **Centralized Mappings**: Created `src/lib/constants.ts` to host all translation logic.
- **Regional Localization**: Implemented full Italian region translations (e.g., "Piedmont" → "Piemonte").
- **International Country Support**: Added translations for all European countries currently in the database (Belgium, France, Germany, Poland, etc.).
- **Global Application**: Integrated these translations into filters, popups, drawers, and headers project-wide.

### 3. UX Polish & Interaction Design
- **Page Transitions**: Implemented smooth fade-in/fade-out transitions between all routes using the **Motion One** (`motion/react`) library.
- **Haptic Feedback**: Integrated light haptics for key mobile interactions:
  - Hamburger menu opening.
  - Theme toggling (Dark/Light mode).
  - Info button and navigation link clicks.
- **Guest Experience**:
  - Added an infinite scrolling marquee **"ACCEDI PER SALVARE I PROGRESSI"** for unauthenticated users.
  - Disabled interaction on the "Visited" button for guests to prevent state confusion.
- **Drawer Refinement**:
  - Transitioned the Bench Drawer to a dynamic `h-auto` height for a more compact mobile feel.
  - Temporarily hid the empty photo section with a `TODO` for future community photo activation.

### 4. Map & Performance Optimizations
- **Zoom Ceiling**: Capped map zoom at `maxZoom: 14` during searches and bench selection. This prevents disorienting "hyper-zoom" when only one bench is visible on the map.
- **Import Optimization**: Performed a bulk cleanup of unused imports and updated path aliases (`@/components/...`) across the entire project.

## 🛠 Technical Notes
- **Motion One**: Switched from `framer-motion` to `motion/react` (Motion One) to ensure compatibility with the project's specific bundle constraints while maintaining full `AnimatePresence` support.
- **CSS Marquee**: Implemented as a pure CSS animation within `tailwind.config.ts` for maximum performance and zero layout shift.

## 📋 Remaining Tasks
- [ ] Implement user profile editing (avatar/bio).
- [ ] Activate "Likes" (Bench icons) and "Comments" UI in the Guestbook.
- [ ] Add image compression/resizing before upload to reduce storage costs.

---

# Project Progress - Session May 6, 2026 (Evening)

## 🚀 Overview
Transformed the community features into a social **Guestbook** system and resolved critical rendering issues. This update shifts the platform's social dynamics from standard reviews to a collaborative "expedition diary" feel.

## ✅ Completed Features

### 1. Guestbook Social Transformation
- **Rebranding**: Successfully migrated all "Community" references to **Guestbook** across the entire UI (Header, Footer, Routes, and Detail pages).
- **Social Timeline**:
  - Implemented a modern, card-based social feed in `/guestbook`.
  - Added support for **multi-image posts** with a responsive grid gallery.
  - Posts now handle any combination of content: "Only Image", "Only Text", "Only Rating", or a mix.
  - Integrated custom **Bench Icons** for social interactions (prepared in background).
- **Database Logic**:
  - Enforced a **one-review-per-bench** constraint per user via database unique index.
  - Added background tables for **Likes** and **Comments** with full RLS policies for future activation.

### 2. Map & Performance Stabilization
- **Hook Order Fix**: Resolved a critical React crash in `ProgressTracker.tsx` caused by a "Rules of Hooks" violation. Refactored the component to receive data as props from the parent `Index` page.
- **State Atomicity**: Fixed race conditions in `useVisitedBenches` by implementing functional state updates, ensuring that rapid clicks on "visited" toggles are handled correctly without reading stale state.
- **Type Safety**: Eliminated multiple `any` casts in hooks and components, replacing them with strict `Bench` and `GuestbookPost` interfaces.
- **Improved UX**: Simplified the Guestbook feed by removing unrequested proximity filters and "Coming Soon" buttons, focusing on high-signal user content.
- **SVG Reliability**: Fixed a bug where bench icons on the map would lose their color gradients in Safari/Firefox due to ID collisions. Added unique IDs based on bench ID and colors.

## 🛠 Technical Notes for Next Agent
- **One-Review Constraint**: Attempting to post a second review for the same bench will now return a 23505 Postgres error, which is caught and handled with a user-friendly toast message. This is a composite unique constraint on `(user_id, bench_id)`.
- **Guestbook Hook**: `useGuestbook` replaces `useCommunityPosts`. It handles the complex multi-image upload flow and invalidates relevant queries on success.
- **Auth Context**: Optimized `AuthContext` to remove redundant session fetching on mount, relying on the synchronous INITIAL_SESSION event from Supabase v2.
- **Sidebar Integration**: Stamp locations remain in the sidebar of the detail page with enhanced typography.

## 📋 Remaining Tasks
- [ ] Implement user profile editing (avatar/bio).
- [ ] Activate "Likes" (Bench icons) and "Comments" UI in the Guestbook.
- [ ] Add image compression/resizing before upload to reduce storage costs.

---

# Project Progress - Session May 6, 2026 (Morning)

## Bug Fixes — Full Component Audit

### Overview
Performed a complete audit of all React components and hooks. Found and fixed 23 bugs across 11 files, ranging from critical rendering failures to race conditions and performance issues.

---

### Critical Fixes

**Escaped template literals (`\${}`) — `Guestbook.tsx` & `BenchDetailPage.tsx`**
Backtick template strings throughout the codebase used `\${}` instead of `${}`, causing React to render literal strings instead of interpolated values. Fixed by removing escape characters.

**Rules of Hooks violation — `ProgressTracker.tsx`**
Two `useMemo` calls were placed after an early `return`. Fixed by refactoring data flow.

... (rest of previous history)
