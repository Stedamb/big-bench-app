import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { Camera, MapPin, MessageSquare, Star, Loader2, ArrowLeft, Navigation2, ThumbsUp } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useGuestbook, type GuestbookPost, calculateDistance } from "@/hooks/useGuestbook";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const Stars = ({ value }: { value: number }) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 \${
          i < value ? "fill-primary text-primary" : "text-muted-foreground/30"
        }`}
      />
    ))}
  </div>
);

const BenchIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M4 18v3h2v-3h12v3h2v-3h1a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1h-1V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v6H3a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h1zM6 6h12v5H6V6z" />
  </svg>
);

const PostCard = ({ post }: { post: GuestbookPost }) => {
  const hasImages = post.community_post_images && post.community_post_images.length > 0;
  
  return (
    <Card className="overflow-hidden border-none bg-card shadow-sm group">
      <CardHeader className="p-4 flex flex-row items-center gap-3 space-y-0">
        <Avatar className="w-10 h-10 border border-border/50">
          <AvatarImage src={post.profiles?.avatar_url || ""} />
          <AvatarFallback className="text-xs bg-muted text-muted-foreground font-bold font-display">
            {post.profiles?.display_name?.slice(0, 2).toUpperCase() || "BB"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-display font-bold truncate leading-none">
              {post.profiles?.display_name || "Esploratore Anonimo"}
            </p>
            {post.rating && <Stars value={post.rating} />}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wider mt-1">
             <time>{new Date(post.created_at).toLocaleDateString("it-IT", { day: 'numeric', month: 'short' })}</time>
             <span>·</span>
             <Link 
              to={`/bench/\${post.bench_id}`}
              className="font-bold text-primary hover:underline flex items-center gap-1"
            >
              <MapPin className="w-2.5 h-2.5" />
              {post.benches?.name || `Bench No. \${post.bench_id}`}
            </Link>
          </div>
        </div>
      </CardHeader>

      {hasImages && (
        <div className={`grid \${post.community_post_images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-0.5 relative overflow-hidden bg-muted`}>
          {post.community_post_images.slice(0, 4).map((img, i) => (
            <div key={img.id} className={`relative aspect-square \${post.community_post_images.length === 3 && i === 0 ? 'row-span-2' : ''}`}>
              <img 
                src={img.image_url} 
                alt="Guestbook photo" 
                className="object-cover w-full h-full"
              />
            </div>
          ))}
          {post.community_post_images.length > 4 && (
            <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-sm font-bold uppercase tracking-widest">
              +\${post.community_post_images.length - 4} foto
            </div>
          )}
        </div>
      )}

      <CardContent className="p-4 pt-3">
        {post.content && (
          <p className="font-editorial text-base leading-relaxed text-foreground/90">
            {post.content}
          </p>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center gap-4">
        <button className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors">
          <BenchIcon className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Mi piace</span>
        </button>
        <button className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors">
          <MessageSquare className="w-3.5 h-3.5" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Commenta</span>
        </button>
        
        {post.distance_km != null && (
          <div className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground font-bold uppercase bg-muted/50 px-2 py-1 rounded-full">
            <Navigation2 className="w-2.5 h-2.5" />
            {post.distance_km < 1 ? '< 1 km' : `\${Math.round(post.distance_km)} km`}
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

const Guestbook = () => {
  const { posts, isLoading } = useGuestbook();
  const [showNearYou, setShowNearYou] = useState(false);
  const [userCoords, setUserCoords] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    if (showNearYou && !userCoords) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
        },
        (err) => {
          console.error("Geolocation error:", err);
          setShowNearYou(false);
        }
      );
    }
  }, [showNearYou, userCoords]);

  const filteredPosts = useMemo(() => {
    let result = posts;

    if (showNearYou && userCoords) {
      result = result.map(post => {
        if (!post.benches) return post;
        return {
          ...post,
          distance_km: calculateDistance(userCoords.lat, userCoords.lng, post.benches.lat, post.benches.lng)
        };
      }).sort((a, b) => (a.distance_km || 9999) - (b.distance_km || 9999));
      
      // Filter within 100km for "Near You"
      result = result.filter(p => (p.distance_km || 9999) < 100);
    }

    return result;
  }, [posts, showNearYou, userCoords]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Header />
      
      <main className="flex-1">
        {/* Hero */}
        <div className="bg-white border-b border-border/60">
          <div className="container py-8 sm:py-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2 font-bold">Registro Esploratori</p>
                <h1 className="text-4xl sm:text-5xl font-display font-bold leading-tight tracking-tight">
                  Guestbook
                </h1>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 bg-muted/40 p-2 rounded-lg border border-border/50 px-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="near-you" className="text-xs font-bold uppercase tracking-wider">Vicine a te</Label>
                    <p className="text-[10px] text-muted-foreground leading-none">Entro 100km</p>
                  </div>
                  <Switch 
                    id="near-you" 
                    checked={showNearYou} 
                    onCheckedChange={setShowNearYou} 
                  />
                </div>

                <div className="hidden sm:flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-display font-bold leading-none">{posts.length}</p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Messaggi</p>
                  </div>
                  <div className="editorial-rule-vertical h-10" />
                  <div className="text-right">
                    <p className="text-2xl font-display font-bold leading-none">
                      {posts.reduce((acc, p) => acc + (p.community_post_images?.length || 0), 0)}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Fotografie</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container py-8 lg:py-12">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Sintonizzazione...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-24 border-2 border-dashed border-border/60 rounded-xl bg-white/50">
              <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground/20 mb-4" />
              <h3 className="font-display text-xl font-bold mb-2">Nessun messaggio trovato</h3>
              <p className="font-editorial italic text-muted-foreground mb-8">
                {showNearYou ? "Non ci sono messaggi da panchine nelle tue vicinanze." : "Il guestbook è ancora intonso. Vuoi essere il primo?"}
              </p>
              <Button asChild className="rounded-full px-8">
                <Link to="/">Inizia il viaggio</Link>
              </Button>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {filteredPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Guestbook;
