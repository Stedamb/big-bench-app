import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  ArrowLeft,
  Camera,
  Check,
  ExternalLink,
  MapPin,
  Mountain,
  Navigation,
  Star,
  Upload,
} from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { benchColorMap, bigBenches } from "@/data/benches";
import { useVisitedBenches } from "@/hooks/useVisitedBenches";

interface Review {
  id: string;
  author: string;
  initials: string;
  rating: number;
  date: string;
  text: string;
}

const sampleReviews: Review[] = [
  {
    id: "r1",
    author: "Marco R.",
    initials: "MR",
    rating: 5,
    date: "Aprile 2026",
    text: "Vista mozzafiato al tramonto. Il sentiero è ben segnalato e adatto anche ai bambini. Consigliatissimo per una gita domenicale.",
  },
  {
    id: "r2",
    author: "Giulia B.",
    initials: "GB",
    rating: 4,
    date: "Marzo 2026",
    text: "Posto magico, panchina perfettamente conservata. Solo un po' affollata nei weekend, meglio andare in settimana.",
  },
  {
    id: "r3",
    author: "Lorenzo T.",
    initials: "LT",
    rating: 5,
    date: "Febbraio 2026",
    text: "Una delle Big Bench più suggestive che abbia visitato. Il panorama vale ogni passo della camminata.",
  },
];

const Stars = ({ value }: { value: number }) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-3.5 h-3.5 ${
          i < value ? "fill-primary text-primary" : "text-muted-foreground/40"
        }`}
      />
    ))}
  </div>
);

const BenchDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const bench = useMemo(
    () => bigBenches.find((b) => String(b.id) === id),
    [id]
  );

  const { visitedIds, toggleVisited } = useVisitedBenches();

  if (!bench) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-20 text-center">
          <h1 className="font-display text-3xl font-bold mb-3">
            Panchina non trovata
          </h1>
          <p className="text-muted-foreground mb-6 font-editorial">
            La Big Bench che cerchi non è nel nostro registro.
          </p>
          <Button onClick={() => navigate("/")}>Torna alla mappa</Button>
        </main>
      </div>
    );
  }

  const visited = visitedIds.includes(bench.id);
  const color = benchColorMap[bench.color] || "#C4572A";

  const markerIcon = L.divIcon({
    className: "bench-detail-marker",
    html: `<div style="background:${color};width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  });

  const avgRating =
    sampleReviews.reduce((s, r) => s + r.rating, 0) / sampleReviews.length;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Hero */}
      <section className="border-b border-border bg-card">
        <div className="container py-6 sm:py-10">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Torna alla Mappa
          </Link>

          <div className="grid lg:grid-cols-[1fr_auto] gap-6 items-end">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="text-[10px] uppercase tracking-[0.2em] font-bold px-2 py-1 rounded-sm text-primary-foreground"
                  style={{ backgroundColor: color }}
                >
                  Bench No. {bench.number}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {bench.color} · {bench.region}
                </span>
              </div>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight mb-3">
                {bench.name}
              </h1>
              <p className="font-editorial italic text-lg text-muted-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {bench.location}, {bench.region} · {bench.altitude}m s.l.m.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="flex items-center gap-1 justify-end">
                  <Stars value={Math.round(avgRating)} />
                  <span className="font-display font-bold ml-1">
                    {avgRating.toFixed(1)}
                  </span>
                </div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">
                  {sampleReviews.length} recensioni
                </p>
              </div>
            </div>
          </div>

          <div className="editorial-rule-double mt-6" />
        </div>
      </section>

      <main className="container py-8 lg:py-12 grid lg:grid-cols-3 gap-10">
        {/* Left column — main */}
        <div className="lg:col-span-2 space-y-12">
          {/* Description */}
          <section>
            <h2 className="font-display text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">
              La Storia
            </h2>
            <p className="font-editorial text-lg leading-relaxed drop-cap">
              {bench.description}
            </p>
            <p className="font-editorial text-base leading-relaxed mt-4 text-muted-foreground">
              Installata nel {bench.installed} come parte del Big Bench Community
              Project ideato da Chris Bangle, questa panchina gigante invita i
              visitatori a fermarsi, sedersi e tornare bambini di fronte alla
              meraviglia del paesaggio circostante.
            </p>
          </section>

          {/* Photos */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xs uppercase tracking-[0.25em] text-muted-foreground">
                Galleria della Comunità
              </h2>
              <Button size="sm" variant="outline" className="gap-1.5 h-8">
                <Upload className="w-3.5 h-3.5" />
                Carica foto
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="relative aspect-square rounded-md overflow-hidden bg-muted border border-border group"
                >
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/40">
                    <Camera className="w-8 h-8" />
                  </div>
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      background: `linear-gradient(135deg, ${color} 0%, transparent 100%)`,
                    }}
                  />
                  <div className="absolute bottom-2 left-2 text-[10px] uppercase tracking-wider text-foreground/70 font-medium">
                    Foto #{i + 1}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Reviews */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xs uppercase tracking-[0.25em] text-muted-foreground">
                Recensioni dei Visitatori
              </h2>
              <Button size="sm" variant="outline" className="h-8">
                Scrivi recensione
              </Button>
            </div>

            <div className="space-y-5">
              {sampleReviews.map((r) => (
                <article
                  key={r.id}
                  className="border-b border-border pb-5 last:border-0"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0"
                      style={{ backgroundColor: color }}
                    >
                      {r.initials}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <p className="font-display font-bold text-sm">
                            {r.author}
                          </p>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            {r.date}
                          </p>
                        </div>
                        <Stars value={r.rating} />
                      </div>
                      <p className="font-editorial text-base leading-relaxed mt-2">
                        {r.text}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>

        {/* Right column — sidebar */}
        <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          {/* Visit action */}
          <div className="border border-border rounded-md p-5 bg-card">
            <Button
              className="w-full gap-2 h-11"
              variant={visited ? "secondary" : "default"}
              onClick={toggleVisited}
            >
              <Check className="w-4 h-4" />
              {visited ? "✓ Panchina visitata" : "Segna come visitata"}
            </Button>
          </div>

          {/* Stats */}
          <div className="border border-border rounded-md bg-card overflow-hidden">
            <div className="p-5 grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  Altitudine
                </p>
                <p className="font-display text-2xl font-bold flex items-baseline gap-1">
                  {bench.altitude}
                  <span className="text-xs font-normal text-muted-foreground">
                    m
                  </span>
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  Anno
                </p>
                <p className="font-display text-2xl font-bold">
                  {bench.installed}
                </p>
              </div>
              <div className="col-span-2 border-t border-border pt-4">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  Coordinate
                </p>
                <p className="font-mono text-xs">
                  {bench.lat.toFixed(5)}°N, {bench.lng.toFixed(5)}°E
                </p>
              </div>
            </div>
          </div>

          {/* Mini map + directions */}
          <div className="border border-border rounded-md bg-card overflow-hidden">
            <div className="h-48 relative">
              <MapContainer
                center={[bench.lat, bench.lng]}
                zoom={12}
                scrollWheelZoom={false}
                dragging={false}
                doubleClickZoom={false}
                zoomControl={false}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution=""
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker
                  position={[bench.lat, bench.lng]}
                  icon={markerIcon}
                />
              </MapContainer>
            </div>
            <div className="p-4 space-y-2">
              <h3 className="font-display text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2">
                Come Arrivare
              </h3>
              <Button
                className="w-full gap-2 h-10"
                variant="default"
                onClick={() =>
                  window.open(
                    `https://www.google.com/maps/dir/?api=1&destination=${bench.lat},${bench.lng}`,
                    "_blank"
                  )
                }
              >
                <Navigation className="w-4 h-4" />
                Indicazioni stradali
              </Button>
              <Button
                className="w-full gap-2 h-10"
                variant="outline"
                onClick={() =>
                  window.open(
                    `https://www.google.com/maps?q=${bench.lat},${bench.lng}`,
                    "_blank"
                  )
                }
              >
                <ExternalLink className="w-4 h-4" />
                Apri in Google Maps
              </Button>
            </div>
          </div>

          {/* Info card */}
          <div className="border border-border rounded-md bg-card p-5">
            <h3 className="font-display text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3">
              Informazioni Utili
            </h3>
            <ul className="space-y-2.5 text-sm font-editorial">
              <li className="flex items-start gap-2">
                <Mountain className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <span>Sentiero panoramico, scarponi consigliati</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <span>Parcheggio disponibile nelle vicinanze</span>
              </li>
              <li className="flex items-start gap-2">
                <Camera className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <span>Migliore luce: alba e tramonto</span>
              </li>
            </ul>
          </div>
        </aside>
      </main>

      <footer className="border-t border-border py-6 text-center text-xs uppercase tracking-[0.25em] text-muted-foreground">
        Big Bench Gazette · Est. 2010
      </footer>
    </div>
  );
};

export default BenchDetailPage;
