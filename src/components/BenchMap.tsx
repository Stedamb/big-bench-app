import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useTheme } from "next-themes";
import { useBenches, type Bench } from "@/hooks/useBenches";
import BenchPopup from "./BenchPopup";

// Fix default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;

const createBenchIcon = (colors: string[] = [], benchId: number) => {
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

  return L.divIcon({
    html: svg,
    className: "bench-marker",
    iconSize: [28, 42],
    iconAnchor: [14, 42],
    popupAnchor: [0, -42],
  });
};

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
        {benches.map((bench) => {
          const visited = visitedIds.includes(bench.id);
          return (
            <Marker
              key={bench.id}
              position={[bench.lat, bench.lng]}
              icon={createBenchIcon(bench.colors, bench.id)}
            >
              <Popup maxWidth={320} minWidth={280}>
                 <BenchPopup
                  bench={bench}
                  visited={visited}
                  onToggleVisited={() => onToggleVisited(bench.id)}
                  onViewDetail={() => onSelectBench(bench)}
                />
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default BenchMap;
