import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { bigBenches, benchColorMap, type BigBench } from "@/data/benches";
import BenchPopup from "./BenchPopup";

// Fix default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;

const createBenchIcon = (color: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="28" height="42">
    <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="${color}" stroke="#1a1a1a" stroke-width="1"/>
    <circle cx="12" cy="11" r="5" fill="white" fill-opacity="0.9"/>
    <rect x="8" y="9.5" width="8" height="1.5" rx="0.5" fill="${color}"/>
    <rect x="9" y="11.5" width="1.5" height="3" rx="0.3" fill="${color}"/>
    <rect x="13.5" y="11.5" width="1.5" height="3" rx="0.3" fill="${color}"/>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: "bench-marker",
    iconSize: [28, 42],
    iconAnchor: [14, 42],
    popupAnchor: [0, -42],
  });
};

function FitBounds() {
  const map = useMap();
  useEffect(() => {
    const bounds = L.latLngBounds(bigBenches.map(b => [b.lat, b.lng]));
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [map]);
  return null;
}

interface BenchMapProps {
  visitedIds: number[];
  onToggleVisited: (id: number) => void;
  onSelectBench: (bench: BigBench) => void;
}

const BenchMap = ({ visitedIds, onToggleVisited, onSelectBench }: BenchMapProps) => {
  return (
    <MapContainer
      center={[44.9, 9.5]}
      zoom={7}
      className="w-full h-full"
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | Stamen'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      <FitBounds />
      {bigBenches.map((bench) => {
        const color = benchColorMap[bench.color] || "#C4572A";
        const visited = visitedIds.includes(bench.id);
        return (
          <Marker
            key={bench.id}
            position={[bench.lat, bench.lng]}
            icon={createBenchIcon(color)}
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
  );
};

export default BenchMap;
