import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import MarkerClusterGroup from "react-leaflet-cluster";
import "react-leaflet-cluster/lib/assets/MarkerCluster.css";
import "react-leaflet-cluster/lib/assets/MarkerCluster.Default.css";
import { useTheme } from "next-themes";
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

function ThemeAwareTileLayer() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <TileLayer
      key={isDark ? "dark" : "light"}
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      className={isDark ? "map-tiles-dark" : ""}
    />
  );
}

function FitBounds({ benches }: { benches: Bench[] }) {
  const map = useMap();
  useEffect(() => {
    if (benches.length > 0) {
      const bounds = L.latLngBounds(benches.map(b => [b.lat, b.lng]));
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [map, benches]);
  return null;
}

/** Requests geolocation, shows a "you are here" marker, and flies to the user's position. */
function UserLocation() {
  const map = useMap();
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const hasFlownRef = useRef(false);

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latlng = L.latLng(pos.coords.latitude, pos.coords.longitude);
        setPosition(latlng);
        if (!hasFlownRef.current) {
          hasFlownRef.current = true;
          map.flyTo(latlng, 13, { duration: 1.5 });
        }
      },
      () => {
        // Silently ignore denied / unavailable geolocation
      },
      { enableHighAccuracy: false, timeout: 10000 },
    );
  }, [map]);

  if (!position) return null;

  return (
    <Marker position={position} icon={locationIcon}>
      <Popup>La tua posizione</Popup>
    </Marker>
  );
}

interface BenchMarkersProps {
  benches: Bench[];
  visitedIds: number[];
  onToggleVisited: (id: number) => void;
  onSelectBench: (bench: Bench) => void;
}

/**
 * Renders only markers whose coordinates fall within the current map viewport
 * (padded by 50% to avoid pop-in at edges), wrapped in a cluster group so that
 * nearby markers merge into a single cluster circle on mobile zoom levels.
 */
function ViewportFilteredMarkers({ benches, visitedIds, onToggleVisited, onSelectBench }: BenchMarkersProps) {
  const map = useMap();

  const [paddedBounds, setPaddedBounds] = useState<L.LatLngBounds>(() =>
    map.getBounds().pad(0.5),
  );

  useMapEvents({
    moveend() { setPaddedBounds(map.getBounds().pad(0.5)); },
    zoomend() { setPaddedBounds(map.getBounds().pad(0.5)); },
  });

  // O(1) visited lookup
  const visitedSet = useMemo(() => new Set(visitedIds), [visitedIds]);

  // Only pass benches that are within the extended viewport to the cluster group
  const visibleBenches = useMemo(
    () => benches.filter(b => paddedBounds.contains([b.lat, b.lng])),
    [benches, paddedBounds],
  );

  return (
    <MarkerClusterGroup chunkedLoading disableClusteringAtZoom={9}>
      {visibleBenches.map((bench) => (
        <Marker
          key={bench.id}
          position={[bench.lat, bench.lng]}
          icon={createBenchIcon(bench.colors, bench.id)}
        >
          <Popup maxWidth={320} minWidth={280}>
            <BenchPopup
              bench={bench}
              visited={visitedSet.has(bench.id)}
              onToggleVisited={() => onToggleVisited(bench.id)}
              onViewDetail={() => onSelectBench(bench)}
            />
          </Popup>
        </Marker>
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
}

const BenchMap = ({ benches, isLoading, visitedIds, onToggleVisited, onSelectBench }: BenchMapProps) => {
  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute top-4 right-4 z-[1001] bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border flex items-center gap-2">
          <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium text-muted-foreground">Aggiornamento...</span>
        </div>
      )}

      <MapContainer
        center={[44.9, 9.5]}
        zoom={7}
        className="w-full h-full"
        zoomControl={true}
      >
        <ThemeAwareTileLayer />
        <FitBounds benches={benches} />
        <UserLocation />
        <ViewportFilteredMarkers
          benches={benches}
          visitedIds={visitedIds}
          onToggleVisited={onToggleVisited}
          onSelectBench={onSelectBench}
        />
      </MapContainer>
    </div>
  );
};

export default BenchMap;
