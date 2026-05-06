import { useMemo, useState, useRef } from "react";
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
  Loader2,
  Image as ImageIcon,
  Clock,
  Phone,
  Mail,
  Info,
  Store,
  Coffee,
  Utensils,
  Hotel,
  Wine,
  Building,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { parseLocalDate } from "@/lib/utils";
import { useVisitedBenches } from "@/hooks/useVisitedBenches";
import { useBench } from "@/hooks/useBenches";
import { useGuestbook } from "@/hooks/useGuestbook";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const Stars = ({ value, onSelect }: { value: number; onSelect?: (v: number) => void }) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-3.5 h-3.5 ${
          i < value ? "fill-primary text-primary" : "text-muted-foreground/40"
        } ${onSelect ? "cursor-pointer" : ""}`}
        onClick={() => onSelect?.(i + 1)}
      />
    ))}
  </div>
);

const LocationIcon = ({ type }: { type: string }) => {
  switch (type?.toLowerCase()) {
    case "bar":
      return <Coffee className="w-3.5 h-3.5" />;
    case "ristorante":
      return <Utensils className="w-3.5 h-3.5" />;
    case "albergo":
      return <Hotel className="w-3.5 h-3.5" />;
    case "cantina":
      return <Wine className="w-3.5 h-3.5" />;
    case "ufficio":
      return <Building className="w-3.5 h-3.5" />;
    case "negozio":
      return <Store className="w-3.5 h-3.5" />;
    default:
      return <MapPin className="w-3.5 h-3.5" />;
  }
};

const BenchDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: bench, isLoading, error } = useBench(id);
  const { visitedIds, toggleVisited } = useVisitedBenches();
  const { posts, isLoading: isLoadingPosts, createPost } = useGuestbook(id ? parseInt(id) : undefined);

  const stampLocations = bench?.stamp_locations || [];

  // New post state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const visited = bench ? visitedIds.includes(bench.id) : false;
  const primaryColor = bench?.colors?.[0] || "#C4572A";
  const secondaryColor = bench?.colors?.[1] || primaryColor;

  const markerIcon = useMemo(() => {
    if (!bench) return null;
    return L.divIcon({
      className: "bench-detail-marker",
      html: `<div style="background:linear-gradient(135deg, ${primaryColor} 50%, ${secondaryColor} 50%);width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 28],
    });
  }, [primaryColor, secondaryColor, bench]);

  const communityPhotos = useMemo(() => 
    posts.flatMap(p => p.community_post_images.map(img => ({
      ...img,
      displayName: p.profiles?.display_name || "Anonimo"
    }))), 
    [posts]
  );
  const communityReviews = useMemo(() => posts.filter(p => p.content || p.rating), [posts]);

  const ratedReviews = communityReviews.filter(r => r.rating != null);
  const avgRating = ratedReviews.length > 0 
    ? ratedReviews.reduce((s, r) => s + r.rating!, 0) / ratedReviews.length 
    : 0;

  const handlePostSubmit = async () => {
    if (!user) {
      toast.error("Devi accedere per pubblicare un post.");
      navigate("/auth");
      return;
    }

    if (!newContent && selectedFiles.length === 0 && !newRating) {
      toast.error("Inserisci un testo, un'immagine o una valutazione.");
      return;
    }

    await createPost.mutateAsync({
      benchId: bench!.id,
      content: newContent,
      rating: newRating,
      imageFiles: selectedFiles,
    });

    setIsDialogOpen(false);
    setNewContent("");
    setSelectedFiles([]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  if (error || !bench) {
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
                  style={{ backgroundColor: primaryColor }}
                >
                  Bench No. {bench.number}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {bench.region} {bench.province ? `· \${bench.province}` : ""}
                </span>
              </div>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight mb-3">
                {bench.name}
              </h1>
              <p className="font-editorial italic text-lg text-muted-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {bench.location}, {bench.region} {bench.altitude_m ? `· \${bench.altitude_m}m s.l.m.` : ""}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="flex items-center gap-1 justify-end">
                  <Stars value={Math.round(avgRating)} />
                  <span className="font-display font-bold ml-1">
                    {avgRating > 0 ? avgRating.toFixed(1) : "—"}
                  </span>
                </div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">
                  {communityReviews.length} messaggi
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
              {bench.description || "Questa panchina gigante invita i visitatori a fermarsi, sedersi e tornare bambini di fronte alla meraviglia del paesaggio circostante."}
            </p>
            {bench.installed_on && (
              <p className="font-editorial text-base leading-relaxed mt-4 text-muted-foreground">
                Installata il {parseLocalDate(bench.installed_on).toLocaleDateString("it-IT", { year: 'numeric', month: 'long', day: 'numeric' })} come parte del Big Bench Community
                Project ideato da Chris Bangle.
              </p>
            )}
            {bench.artist && (
              <p className="font-editorial text-base leading-relaxed mt-2 text-muted-foreground">
                Artista: {bench.artist}
              </p>
            )}
          </section>

          {/* Photos */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xs uppercase tracking-[0.25em] text-muted-foreground">
                Galleria del Guestbook
              </h2>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="gap-1.5 h-8">
                    <Upload className="w-3.5 h-3.5" />
                    Carica foto
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle className="font-display text-xl">Firma il Guestbook</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Valutazione</p>
                      <Stars value={newRating} onSelect={setNewRating} />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Il tuo racconto</p>
                      <Textarea 
                        placeholder="Cosa ti ha lasciato questa vista? (opzionale)"
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                        className="font-editorial h-24"
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Le tue fotografie</p>
                      <div 
                        className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {selectedFiles.length > 0 ? (
                          <div className="flex flex-col items-center gap-2">
                            <div className="flex items-center justify-center gap-2">
                              <ImageIcon className="w-5 h-5 text-primary" />
                              <span className="text-sm font-medium">{selectedFiles.length} file selezionati</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground uppercase">Clicca per cambiare</p>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <Camera className="w-8 h-8 mx-auto text-muted-foreground/50" />
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Clicca per selezionare</p>
                          </div>
                        )}
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          className="hidden" 
                          accept="image/*"
                          multiple
                          onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
                        />
                      </div>
                    </div>
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={handlePostSubmit}
                    disabled={createPost.isPending}
                  >
                    {createPost.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Invia messaggio
                  </Button>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {communityPhotos.length > 0 ? (
                communityPhotos.map((p, i) => (
                  <div
                    key={p.id}
                    className="relative aspect-square rounded-md overflow-hidden bg-muted border border-border group"
                  >
                    <img 
                      src={p.image_url!} 
                      alt={`Bench detail \${i}`} 
                      className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                      <p className="text-[10px] text-white font-bold truncate">
                        di {p.displayName}
                      </p>
                    </div>
                  </div>
                ))
// ... rest of logic

              ) : (
                Array.from({ length: 6 }).map((_, i) => (
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
                        background: `linear-gradient(135deg, ${primaryColor} 0%, transparent 100%)`,
                      }}
                    />
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Reviews */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xs uppercase tracking-[0.25em] text-muted-foreground">
                Guestbook
              </h2>
              <Button size="sm" variant="outline" className="h-8" onClick={() => setIsDialogOpen(true)}>
                Lascia un messaggio
              </Button>
            </div>

            <div className="space-y-5">
              {isLoadingPosts ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : communityReviews.length > 0 ? (
                communityReviews.map((r) => (
                  <article
                    key={r.id}
                    className="border-b border-border pb-5 last:border-0"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0 overflow-hidden bg-muted"
                      >
                        {r.profiles?.avatar_url ? (
                          <img src={r.profiles.avatar_url} className="w-full h-full object-cover" />
                        ) : (
                          <span style={{ color: primaryColor === "#E5E7EB" ? "#000" : "#fff" }}>
                            {r.profiles?.display_name?.slice(0, 2).toUpperCase() || "BB"}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div>
                            <p className="font-display font-bold text-sm">
                              {r.profiles?.display_name || "Esploratore Anonimo"}
                            </p>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                              {new Date(r.created_at).toLocaleDateString("it-IT", { month: 'long', year: 'numeric' })}
                            </p>
                          </div>
                          {r.rating && <Stars value={r.rating} />}
                        </div>
                        {r.content && (
                          <p className="font-editorial text-base leading-relaxed mt-2 text-foreground/80">
                            {r.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="text-center py-10 border border-dashed border-border rounded-lg bg-card/50">
                   <p className="font-editorial italic text-muted-foreground">
                    Ancora nessuna recensione. Sii il primo a raccontare la tua esperienza.
                  </p>
                </div>
              )}
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
              onClick={() => toggleVisited(bench.id)}
            >
              <Check className="w-4 h-4" />
              {visited ? "✓ Panchina visitata" : "Segna come visitata"}
            </Button>
          </div>

          {/* Stats */}
          <div className="border border-border rounded-md bg-card overflow-hidden">
            <div className="p-5 grid grid-cols-2 gap-4">
              {bench.altitude_m && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                    Altitudine
                  </p>
                  <p className="font-display text-2xl font-bold flex items-baseline gap-1">
                    {bench.altitude_m}
                    <span className="text-xs font-normal text-muted-foreground">
                      m
                    </span>
                  </p>
                </div>
              )}
              {bench.installed_on && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                    Anno
                  </p>
                  <p className="font-display text-2xl font-bold">
                    {parseLocalDate(bench.installed_on).getFullYear()}
                  </p>
                </div>
              )}
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

          {/* Stamp Locations Sidebar Section */}
          {stampLocations.length > 0 && (
            <div className="border border-border rounded-md bg-card p-5 space-y-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Check className="w-4 h-4" />
                </div>
                <h3 className="font-display text-sm font-bold uppercase tracking-wider leading-tight">
                  Dove timbrare il passaporto
                </h3>
              </div>

              <div className="space-y-8">
                {stampLocations.map((loc, i) => (
                  <div key={i} className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 text-primary shrink-0">
                        <LocationIcon type={loc.location_type || ""} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-display text-base font-bold leading-snug mb-1.5">
                          {loc.name}
                        </h4>
                        {loc.address && (
                          <p className="text-sm text-muted-foreground font-editorial flex items-start gap-1.5 leading-relaxed">
                            <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                            {loc.address}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pl-7 space-y-3">
                      {loc.opening_hours && (
                        <div className="flex items-start gap-2.5 text-xs text-muted-foreground font-medium">
                          <Clock className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                          <span className="leading-normal">{loc.opening_hours}</span>
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        {loc.phone && (
                          <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                            <Phone className="w-3.5 h-3.5 shrink-0" />
                            <span>{loc.phone}</span>
                          </div>
                        )}
                        {loc.email && (
                          <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                            <Mail className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{loc.email}</span>
                          </div>
                        )}
                      </div>

                      {loc.notes && (
                        <div className="flex items-start gap-2 text-[11px] bg-primary/5 text-primary px-3 py-2 rounded-sm border border-primary/10 leading-tight">
                          <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                          <span className="font-bold uppercase tracking-wider">{loc.notes}</span>
                        </div>
                      )}
                    </div>
                    {i < stampLocations.length - 1 && <div className="border-b border-border/50 pt-2" />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mini map + directions */}
          <div className="border border-border rounded-md bg-card overflow-hidden">
            <div className="h-48 relative">
              {markerIcon && (
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
              )}
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

      <Footer />
    </div>
  );
};

export default BenchDetailPage;
