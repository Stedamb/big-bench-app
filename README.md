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
- **Mobile**: Capacitor (Android) wrapping the same web frontend — see below.

## 🚀 Getting Started

### 1. Clone the repo
```bash
git clone <your-repo-url>
cd BigBenchApp
```

### 2. Install dependencies
```bash
pnpm install
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
pnpm dev
```

## 📱 Mobile App (Android)

The native Android app is the **same web frontend** wrapped with
[Capacitor](https://capacitorjs.com) (`capacitor.config.ts`, `android/`) —
every feature shipped on the web lands in the app on the next sync, no
separate mobile codebase.

### Build & install

Requires the Android SDK (Android Studio, or
`brew install --cask android-commandlinetools`) and a JDK — Android Studio's
bundled one works:

```bash
pnpm cap:sync        # vite build + copy web assets into android/
cd android
JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home" \
  ./gradlew assembleDebug
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

Or `pnpm cap:android` to build, sync, and run on a connected device in one
step. Gradle reads the SDK path from `android/local.properties`
(`sdk.dir=...`, machine-specific, not committed).

### Native specifics

- **Google OAuth** cannot run inside the WebView (Google blocks it): on
  native, `src/lib/nativeAuth.ts` opens the system browser and returns via
  the `app.bigbench://auth-callback` deep link (PKCE code exchange). That
  redirect URL must be listed in Supabase → Authentication → URL
  Configuration, and is registered as an intent-filter in
  `android/app/src/main/AndroidManifest.xml`.
- **Geolocation** for the map's locate-me control works through the WebView;
  the required permissions are declared in the manifest.
- **iOS** is not set up yet — `npx cap add ios` (needs Xcode), then mirror
  the deep-link scheme in `Info.plist`.

### `mobile/` — superseded Expo app

`mobile/` contains a working React Native (Expo) port built as a proof of
concept before the Capacitor decision. It is **not maintained** — kept only
as reference for a possible future fully-native track. See
`docs/brainstorms/2026-07-02-expo-port-requirements.md` for the decision
history.

## 📂 Data Sources
This project uses data inspired by the Big Bench Community Project. The data is synchronized from GeoJSON sources and enriched with automated color extraction tools.

---
*Built with ❤️ for Big Bench enthusiasts.*
