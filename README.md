# Big Bench App

A modern web application to discover, track, and visit the Big Benches (Panchine Giganti) across Italy and Europe.

## ✨ Features
- **Live Interactive Map**: Explore 450+ official benches with real-time data.
- **Custom Markers**: Markers reflect the actual colors of each bench.
- **WIP Tracking**: See which benches are currently under construction.
- **Personal Progress**: Log in to mark benches as visited and track your progress.
- **Rich Details**: View descriptions, artists, and locations for every installation.

## 🛠️ Tech Stack
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, shadcn/ui.
- **Maps**: Leaflet, React-Leaflet.
- **Data**: Supabase (PostgreSQL), TanStack Query.

## 🚀 Getting Started

### 1. Clone the repo
```bash
git clone <your-repo-url>
cd BigBenchApp
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

### 4. Database Setup
1.  Create a Supabase project.
2.  Run the migrations found in `supabase/migrations`.
3.  Apply the RLS policies to allow public reading of the `benches`, `bench_colors`, and `bench_wip` tables.

### 5. Run development server
```bash
npm run dev
```

## 📂 Data Sources
This project uses data inspired by the Big Bench Community Project. The data is synchronized from GeoJSON sources and enriched with automated color extraction tools.

---
*Built with ❤️ for Big Bench enthusiasts.*
