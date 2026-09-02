import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useTheme } from "next-themes";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import MarkerClusterGroup from "react-leaflet-cluster";
import "react-leaflet-cluster/dist/assets/MarkerCluster.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.Default.css";
import { Crosshair } from "lucide-react";
import { toast } from "sonner";
import { type Bench } from "@/hooks/useBenches";
import BenchPopup from "./BenchPopup";

// Fix default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;

// Module-level cache: avoids recreating 461 SVG strings on every render
const iconCache = new Map<number, L.DivIcon>();

const createBenchIcon = (colors: string[] = [], benchId: number) => {
  if (iconCache.has(benchId)) return iconCache.get(benchId)!;

  const primaryColor = colors[0] || "#C4572A";
  const secondaryColor = colors[1] || primaryColor;
  // Include benchId in gradient IDs to prevent collisions when multiple SVGs
  // with the same colors exist in the DOM simultaneously (browser resolves
  // gradient by ID and can pick the wrong element in Firefox/Safari).
  const gradId = `grad-${benchId}-${primaryColor.replace('#', '')}-${secondaryColor.replace('#', '')}`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="28" height="42">
    <defs>
      <linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="50%" style="stop-color:${primaryColor};stop-opacity:1" />
        <stop offset="50%" style="stop-color:${secondaryColor};stop-opacity:1" />
      </linearGradient>
    </defs>
    <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="url(#${gradId})" stroke="#1a1a1a" stroke-width="1"/>
    <circle cx="12" cy="11" r="5" fill="white" fill-opacity="0.9"/>
    <rect x="8" y="9.5" width="8" height="1.5" rx="0.5" fill="${primaryColor}"/>
    <rect x="9" y="11.5" width="1.5" height="3" rx="0.3" fill="${primaryColor}"/>
    <rect x="13.5" y="11.5" width="1.5" height="3" rx="0.3" fill="${secondaryColor}"/>
  </svg>`;

  const icon = L.divIcon({
    html: svg,
    className: "bench-marker",
    iconSize: [28, 42],
    iconAnchor: [14, 42],
    popupAnchor: [0, -42],
  });

  iconCache.set(benchId, icon);
  return icon;
};

// "You are here" pulsing dot
const locationIcon = L.divIcon({
  html: `<div style="
    width:16px;height:16px;
    background:#3b82f6;
    border:3px solid white;
    border-radius:50%;
    box-shadow:0 0 0 3px rgba(59,130,246,0.4),0 2px 8px rgba(0,0,0,0.3);
  "></div>`,
  className: "",
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

// CARTO basemaps require an API key as of 2026; unauthenticated tiles come
// back stamped "API KEY REQUIRED". The free tier (5M tiles/month) is enough
// for this app. Key is website-restricted, so shipping it to the client is
// expected. See https://carto.com/basemaps/apikey
const CARTO_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

const cartoTileUrl = (style: "light_all" | "dark_all") => {
  const key = import.meta.env.VITE_CARTO_API_KEY;
  const base = `https://{s}.basemaps.cartocdn.com/${style}/{z}/{x}/{y}.png`;
  return key ? `${base}?key=${key}` : base;
};

function DarkTileLayer() {
  return (
    <TileLayer
      attribution={CARTO_ATTRIBUTION}
      url={cartoTileUrl("dark_all")}
      subdomains="abcd"
      maxZoom={20}
    />
  );
}

function LightTileLayer() {
  return (
    <TileLayer
      attribution={CARTO_ATTRIBUTION}
      url={cartoTileUrl("light_all")}
      subdomains="abcd"
      maxZoom={20}
    />
  );
}

function FitBounds({ benches, disabled }: { benches: Bench[]; disabled?: boolean }) {
  const map = useMap();
  const lastSignatureRef = useRef<string | null>(null);
  // A stable signature of which benches are shown, independent of array
  // identity, so a background refetch that returns the same benches (just a
  // new array reference) doesn't re-trigger fitBounds and snap the viewport
  // back after the user has panned/zoomed away.
  const signature = useMemo(
    () => benches.map((b) => b.id).sort((a, b) => a - b).join(","),
    [benches]
  );

  useEffect(() => {
    // If disabled (popup/drawer open), we mark the current benches as "handled"
    // so we don't snap to them when the drawer/popup finally closes.
    if (disabled) {
      if (benches.length > 0) {
        lastSignatureRef.current = signature;
      }
      return;
    }

    // Only fit bounds if:
    // 1. Not disabled
    // 2. We have benches
    // 3. The set of benches has actually changed (e.g. filters updated)
    if (benches.length > 0 && signature !== lastSignatureRef.current) {
      const bounds = L.latLngBounds(benches.map(b => [b.lat, b.lng]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 10 });
      lastSignatureRef.current = signature;
    }
  }, [map, benches, disabled, signature]);
  return null;
}

/** Stores the Leaflet map instance in a ref so the outer component can access it. */
function StoreMapRef({ mapRef }: { mapRef: React.MutableRefObject<L.Map | null> }) {
  const map = useMap();
  useEffect(() => { 
    mapRef.current = map; 
  }, [map, mapRef]);
  return null;
}

/** Shows a "you are here" marker when the user has manually located themselves. */
function UserMarker({ position }: { position: L.LatLng | null }) {
  if (!position) return null;
  return (
    <Marker position={position} icon={locationIcon}>
      <Popup>La tua posizione</Popup>
    </Marker>
  );
}

/** Component to handle programmatic map movements (centering, zoom) */
function MapController({ centerId, benches, zoom }: { centerId: number | null; benches: Bench[]; zoom: number }) {
  const map = useMap();
  const lastId = useRef<number | null>(null);

  useEffect(() => {
    if (centerId && benches.length > 0 && lastId.current !== centerId) {
      const bench = benches.find(b => b.id === centerId);
      if (bench) {
        map.setView([bench.lat, bench.lng], zoom);
        lastId.current = centerId;
      }
    }
  }, [centerId, benches, zoom, map]);

  return null;
}

interface BenchMarkersProps {
  benches: Bench[];
  visitedIds: number[];
  onToggleVisited: (id: number) => void;
  onSelectBench: (bench: Bench) => void;
  openPopupId?: number | null;
  onPopupClose?: (id: number) => void;
}

function MarkerWithPopup({
  bench,
  visited,
  onToggleVisited,
  onViewDetail,
  shouldOpen,
  onPopupClose,
}: {
  bench: Bench;
  visited: boolean;
  onToggleVisited: () => void;
  onViewDetail: () => void;
  shouldOpen: boolean;
  onPopupClose?: (id: number) => void;
}) {
  const markerRef = useRef<L.Marker>(null);

  useEffect(() => {
    if (shouldOpen && markerRef.current) {
      // Use a timeout to ensure the map has finished moving and the marker is rendered.
      // This is more robust than moveend which might not fire if map is already centered.
      const timer = setTimeout(() => {
        if (markerRef.current) {
          markerRef.current.openPopup();
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [shouldOpen]);

  return (
    <Marker
      ref={markerRef}
      position={[bench.lat, bench.lng]}
      icon={createBenchIcon(bench.colors, bench.id)}
      eventHandlers={{
        popupclose: () => onPopupClose?.(bench.id),
      }}
    >
      <Popup maxWidth={320} minWidth={280}>
        <BenchPopup
          bench={bench}
          visited={visited}
          onToggleVisited={onToggleVisited}
          onViewDetail={onViewDetail}
        />
      </Popup>
    </Marker>
  );
}

function BenchMarkers({ benches, visitedIds, onToggleVisited, onSelectBench, openPopupId, onPopupClose, initialZoom = 8 }: BenchMarkersProps & { initialZoom?: number }) {
  const visitedSet = useMemo(() => new Set(visitedIds), [visitedIds]);

  const disableClusteringAtZoom = openPopupId ? Math.min(initialZoom, 10) : 9;

  return (
    <MarkerClusterGroup
      // react-leaflet-cluster's prop-update handler is still an unimplemented
      // //TODO as of 3.1.1, so
      // changing disableClusteringAtZoom on an existing instance has no
      // effect; force a remount by keying on the value it should take.
      key={disableClusteringAtZoom}
      chunkedLoading
      disableClusteringAtZoom={disableClusteringAtZoom}
    >
      {benches.map((bench) => (
        <MarkerWithPopup
          key={bench.id}
          bench={bench}
          visited={visitedSet.has(bench.id)}
          onToggleVisited={() => onToggleVisited(bench.id)}
          onViewDetail={() => onSelectBench(bench)}
          shouldOpen={openPopupId === bench.id}
          onPopupClose={onPopupClose}
        />
      ))}
    </MarkerClusterGroup>
  );
}

interface BenchMapProps {
  benches: Bench[];
  isLoading: boolean;
  visitedIds: number[];
  onToggleVisited: (id: number) => void;
  onSelectBench: (bench: Bench) => void;
  openPopupId?: number | null;
  onPopupClose?: (id: number) => void;
  isDrawerOpen?: boolean;
  initialZoom?: number;
}

export interface BenchMapHandle {
  locate: () => void;
  locating: boolean;
  flyTo: (latlng: [number, number], zoom?: number) => void;
}

const BenchMap = forwardRef<BenchMapHandle, BenchMapProps>(({ benches, isLoading, visitedIds, onToggleVisited, onSelectBench, openPopupId, onPopupClose, isDrawerOpen, initialZoom = 8 }, ref) => {
  const { resolvedTheme } = useTheme();
  const mapRef = useRef<L.Map | null>(null);
  const [userPosition, setUserPosition] = useState<L.LatLng | null>(null);
  const [locating, setLocating] = useState(false);

  const handleLocate = useCallback(() => {
    if (!navigator.geolocation || !mapRef.current || locating) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latlng = L.latLng(pos.coords.latitude, pos.coords.longitude);
        setUserPosition(latlng);
        setLocating(false);
        mapRef.current?.flyTo(latlng, 13, { duration: 1.5 });
      },
      (err) => {
        setLocating(false);
        const msg =
          err.code === err.PERMISSION_DENIED
            ? "Posizione non disponibile: permesso negato"
            : err.code === err.TIMEOUT
              ? "Posizione non disponibile: richiesta scaduta"
              : "Posizione non disponibile: errore sconosciuto";
        toast.error(msg);
      },
      { enableHighAccuracy: false, timeout: 10000 },
    );
  }, [locating]);

  const flyTo = useCallback((latlng: [number, number], zoom: number = 13) => {
    mapRef.current?.flyTo(latlng, zoom, { duration: 1.5 });
  }, []);

  useImperativeHandle(ref, () => ({ locate: handleLocate, locating, flyTo }), [handleLocate, locating, flyTo]);

  return (
    <div className="relative w-full h-full">
      {/* Desktop: indicators + GPS button */}
      <div className="absolute top-4 right-4 z-[1001] hidden lg:flex items-center gap-2">
        {isLoading && (
          <div className="bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-medium text-muted-foreground">Aggiornamento...</span>
          </div>
        )}
        <button
          onClick={handleLocate}
          disabled={locating}
          className="w-9 h-9 flex items-center justify-center bg-background/90 backdrop-blur-sm rounded-full shadow-sm border hover:bg-muted transition-colors disabled:opacity-50"
          aria-label="Trova la mia posizione"
        >
          {locating ? (
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            <Crosshair className="text-foreground" size={18} />
          )}
        </button>
      </div>

      {/* Mobile: loading indicator */}
      {isLoading && (
        <div className="absolute top-4 right-4 z-[1001] flex items-center lg:hidden">
          <div className="bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-medium text-muted-foreground">Aggiornamento...</span>
          </div>
        </div>
      )}

      <MapContainer
        center={[44.9, 9.5]}
        zoom={6}
        className="w-full h-full"
        zoomControl={true}
      >
        {resolvedTheme === "dark" ? <DarkTileLayer /> : <LightTileLayer />}
        <FitBounds benches={benches} disabled={!!openPopupId || isDrawerOpen} />
        <StoreMapRef mapRef={mapRef} />
        <MapController centerId={openPopupId || null} benches={benches} zoom={initialZoom} />
        <UserMarker position={userPosition} />
        <BenchMarkers
          benches={benches}
          visitedIds={visitedIds}
          onToggleVisited={onToggleVisited}
          onSelectBench={onSelectBench}
          openPopupId={openPopupId}
          onPopupClose={onPopupClose}
          initialZoom={initialZoom}
        />
      </MapContainer>
    </div>
  );
});

export default BenchMap;
