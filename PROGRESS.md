# Project Progress - Session May 6, 2026

## 🚀 Overview
Added stamp location data to the app. Parsed the official Big Bench passport PDF (`scripts/passaporti.pdf`) — which lists where to get passport stamps — cleaned the messy PDF-extracted CSV, and imported structured data into a new `stamp_locations` table in Supabase.

## ✅ Completed Features

### 1. `stamp_locations` Table
- **Schema**: Created with fields for `bench_id` (FK → `benches.id`), `name`, `address`, `phone`, `email`, `opening_hours`, `notes`, and `location_type`.
- **RLS**: Public SELECT enabled, authenticated INSERT/UPDATE policies.
- **Location types**: bar, ristorante, negozio, agriturismo, ufficio, albergo, cantina, circolo, rifugio, attrazione.

### 2. Data Import
- **Source**: `scripts/passaporti.pdf` → extracted via `scripts/import_pdf.py` (pdfplumber).
- **Parser**: `scripts/parse_passaporti.py` handles multi-line cell reconstruction, splits individual locations by business name patterns, and extracts structured fields (address, phone, email, hours, notes, type).
- **Results**: **1,222 locations** across **425 benches** imported.
  - 936 with address, 897 with phone, 270 with email, 775 with hours.

## 🛠 Technical Notes for Next Agent
- **Parser**: `scripts/parse_passaporti.py` can be re-run to regenerate `stamp_locations.json`. The SQL insert batches were cleaned up after import.
- **Bench linking**: `stamp_locations.bench_id` references `benches.id`. Benches 444 and 459 don't exist in the DB (gaps in the bench numbering) — their stamp locations were skipped.
- **Data quality**: The PDF extraction is inherently messy. Some locations have incomplete data or merged fields. The parser prioritizes getting the business name, address, and phone correct.

---

# Project Progress - Session May 5, 2026

## 🚀 Overview
In this session, we transitioned the Big Bench App from a static-data prototype to a fully dynamic, community-driven platform powered by Supabase. Key milestones include the implementation of the Bench Detail page, a community timeline with photo support, and a robust search/filter system for the map.

## ✅ Completed Features

### 1. Bench Detail & Database Integration
- **Dynamic Fetching**: Implemented `useBench` and `useBenches` hooks to fetch live data from Supabase.
- **Rich Detail Page**: Created `/bench/:id` route displaying bench numbers, locations, altitude, and history.
- **Map & Color Sync**: Mini-maps and markers now dynamically reflect the primary/secondary colors stored in the database.

### 2. Community System & Timeline
- **Community Feed**: Developed the `/community` page (Cronache della Comunità) showcasing a chronological timeline of user stories and photos.
- **Unified Posting**: Created a "Scrivi recensione" system allowing authenticated users to:
  - Rate benches (1-5 stars).
  - Write stories/reviews.
  - Upload photos directly to Supabase Storage.
- **Multi-Image Support**: Established a `community_post_images` table to allow multiple high-resolution photos per post.

### 3. Search & Filtering
- **Real-time Map Search**: Users can search by bench name, number, or location.
- **Geo-Filters**: Added dropdowns to filter by Country and Region, with the map automatically re-centering to fit filtered results.

### 4. Infrastructure & Security (MCP & Skills)
- **Database Schema**:
  - `community_posts`: Linked to `public.profiles` for user details.
  - `community_post_images`: Linked to posts for photo metadata.
  - `bench_photos` bucket: Configured storage policies for authenticated uploads.
- **RLS Policies**: Implemented strict security policies for SELECT, INSERT, and DELETE operations across all new tables.
- **MCP Setup**: Configured Supabase MCP server for direct schema management and agent-driven database tasks.

## 🛠 Technical Notes for Next Agent
- **Schema Cache**: If new tables or columns aren't appearing in the Data API, ensure the schema cache is refreshed.
- **Images**: Community images are served via Supabase Storage CDN. Transformation parameters (resizing) can be added to URLs for performance optimization.
- **Types**: Always use the `Bench` and `CommunityPost` interfaces from the hooks; avoid using the legacy `BigBench` static type.
- **Auth**: Posting and uploading require an active Supabase session.

## 📋 Remaining Tasks
- [ ] Implement user profile editing (avatar/bio).
- [ ] Add "Likes" or "Reactions" to community posts.
- [ ] Implement a "Leaderboard" for top explorers.
- [ ] Add image compression/resizing before upload.
