import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useBenches, type Bench } from "@/hooks/useBenches";
import BenchPopup from "./BenchPopup";

// Fix default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;

const createBenchIcon = (colors: string[] = []) => {
  const primaryColor = colors[0] || "#C4572A";
  const secondaryColor = colors[1] || primaryColor;
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="28" height="42">
    <defs>
      <linearGradient id="grad-${primaryColor.replace('#', '')}-${secondaryColor.replace('#', '')}" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="50%" style="stop-color:${primaryColor};stop-opacity:1" />
        <stop offset="50%" style="stop-color:${secondaryColor};stop-opacity:1" />
      </linearGradient>
    </defs>
    <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="url(#grad-${primaryColor.replace('#', '')}-${secondaryColor.replace('#', '')})" stroke="#1a1a1a" stroke-width="1"/>
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
  visitedIds: number[];
  onToggleVisited: (id: number) => void;
  onSelectBench: (bench: Bench) => void;
}

const BenchMap = ({ visitedIds, onToggleVisited, onSelectBench }: BenchMapProps) => {
  const { data: benches = [], isLoading } = useBenches();

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-50">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-primary/20 rounded-full" />
          <p className="text-muted-foreground animate-bounce">Caricamento panchine...</p>
        </div>
      </div>
    );
  }

  return (
    <MapContainer
      center={[44.9, 9.5]}
      zoom={7}
      className="w-full h-full"
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      <FitBounds benches={benches} />
      {benches.map((bench) => {
        const visited = visitedIds.includes(bench.id);
        return (
          <Marker
            key={bench.id}
            position={[bench.lat, bench.lng]}
            icon={createBenchIcon(bench.colors)}
          >
            <Popup maxWidth={320} minWidth={280}>
              <BenchPopup
                bench={bench as any}
                visited={visited}
                onToggleVisited={() => onToggleVisited(bench.id)}
                onViewDetail={() => onSelectBench(bench)}
              />
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default BenchMap;
