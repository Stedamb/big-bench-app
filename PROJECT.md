# Big Bench App - Project Status & Architecture

## 🚀 Overview
The Big Bench App has been transitioned from a static React application to a dynamic, database-driven platform. It now fetches live data from Supabase, featuring over 450 official benches and 70+ benches under construction.

## 🏗️ Technical Architecture

### Frontend
- **Framework**: React 18 with TypeScript & Vite.
- **State Management**: TanStack Query (React Query) for efficient caching of database results.
- **Map Engine**: Leaflet (React-Leaflet) using custom SVG markers.
- **Styling**: Tailwind CSS + shadcn/ui.

### Backend (Supabase)
- **Database**: PostgreSQL with Row Level Security (RLS) enabled.
- **Authentication**: Managed via Supabase Auth.
- **Storage**: (Planned) For user-uploaded photos.

## 📊 Database Schema

### `benches`
The main catalog of official Big Benches.
- `id`: Unique identifier (matches official bench number).
- `name`, `slug`, `location`, `lat`, `lng`: Core spatial and descriptive data.
- `colors`: Array of primary/secondary hex codes.
- `is_official`: Boolean flag (true).

### `bench_colors`
Detailed color metadata for every bench.
- `bench_id`: Reference to `benches.id`.
- `color_name`: Human-readable color (e.g., "red", "blue").
- `color_hex`: Precise hex code extracted from source markers.

### `bench_wip`
Tracking benches currently under construction.
- `source_marker_id`: ID from the community GeoJSON.
- `notes`: Progress updates or community reports.

### `visited_benches`
User-specific interaction data.
- `user_id`: Reference to Auth profile.
- `bench_id`: Reference to bench.

## 🔄 Data Migration Logic
The migration from `benches.geojson` to Supabase involved a specialized Node.js script (`migrate.js`) that:
1.  **Parsed HTML**: Extracted clean names and numbers from embedded HTML strings.
2.  **Color Extraction**: Used `jimp` to analyze the pixels of the original marker icons to determine the primary and secondary colors of the physical bench.
3.  **Geo-Inference**: Automatically mapped Italian provinces to their respective Regions.
4.  **Deduplication**: Handled overlapping entries between the GeoJSON and existing manual records.

## 🗺️ Map Implementation
- **Custom Bicolor Markers**: Markers support dual-color gradients for benches with multiple colors.
- **Dynamic Bounds**: The map automatically adjusts its viewport to include all benches in the current dataset.
- **Performance**: Marker rendering is optimized for 500+ points on the map.
