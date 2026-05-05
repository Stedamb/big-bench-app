import { Link } from "react-router-dom";
import { Camera, MapPin, MessageSquare, Star, Loader2, ArrowLeft, Mountain } from "lucide-react";
import Header from "@/components/Header";
import { useCommunityPosts, type CommunityPost } from "@/hooks/useCommunityPosts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

const PostCard = ({ post }: { post: CommunityPost }) => {
  const hasImages = post.community_post_images && post.community_post_images.length > 0;
  
  return (
    <Card className="overflow-hidden border-border bg-card shadow-[var(--shadow-editorial)] group">
      <CardHeader className="p-4 flex flex-row items-center gap-3 space-y-0">
        <Avatar className="w-8 h-8 border border-border">
          <AvatarImage src={post.profiles?.avatar_url || ""} />
          <AvatarFallback className="text-[10px] bg-primary text-primary-foreground font-bold">
            {post.profiles?.display_name?.slice(0, 2).toUpperCase() || "BB"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 overflow-hidden">
          <p className="text-sm font-display font-bold truncate">
            {post.profiles?.display_name || "Esploratore Anonimo"}
          </p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
            {new Date(post.created_at).toLocaleDateString("it-IT", { 
              day: 'numeric', month: 'short', year: 'numeric' 
            })}
          </p>
        </div>
        {post.rating && <Stars value={post.rating} />}
      </CardHeader>

      {hasImages && (
        <div className={`grid ${post.community_post_images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-0.5 relative overflow-hidden bg-muted aspect-video`}>
          {post.community_post_images.slice(0, 4).map((img, i) => (
            <img 
              key={img.id}
              src={img.image_url} 
              alt="Community post" 
              className={`object-cover w-full h-full transition-transform duration-500 group-hover:scale-105 ${
                post.community_post_images.length === 3 && i === 0 ? 'row-span-2' : ''
              }`}
            />
          ))}
          {post.community_post_images.length > 4 && (
            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded-sm font-bold uppercase tracking-widest">
              +{post.community_post_images.length - 4} foto
            </div>
          )}
        </div>
      )}

      <CardContent className="p-4">
        <Link 
          to={`/bench/${post.bench_id}`}
          className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] font-bold text-primary hover:underline mb-3"
        >
          <MapPin className="w-3 h-3" />
          {post.benches?.name || `Bench No. ${post.bench_id}`}
        </Link>
        {post.content && (
          <p className="font-editorial text-base leading-relaxed text-foreground/90 italic">
            "{post.content}"
          </p>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 border-t border-border/50 mt-2">
        <div className="flex items-center gap-4 text-muted-foreground">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider">
            <MessageSquare className="w-3.5 h-3.5" />
            0 commenti
          </div>
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider">
            <Camera className="w-3.5 h-3.5" />
            {post.community_post_images.length} foto
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

const Community = () => {
  const { posts, isLoading } = useCommunityPosts();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero */}
        <div className="border-b border-border bg-card">
          <div className="container py-8 sm:py-12">
            <Link 
              to="/" 
              className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors mb-6"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Torna alla Mappa
            </Link>
            
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div>
                <h1 className="text-4xl sm:text-6xl font-bold leading-none mb-3">
                  Cronache della<br />
                  <span className="font-editorial italic font-normal">Comunità</span>
                </h1>
                <p className="text-sm text-muted-foreground font-editorial max-w-sm mt-4">
                  Un mosaico di orizzonti, passi e scoperte. Il diario collettivo di chi ha scelto di guardare il mondo da un'altra prospettiva.
                </p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-3xl font-display font-bold leading-none">{posts.length}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">Storie Pubblicate</p>
                </div>
                <div className="editorial-rule-vertical h-12" />
                <div className="text-right">
                  <p className="text-3xl font-display font-bold leading-none">
                    {posts.filter(p => p.image_url).length}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">Fotografie</p>
                </div>
              </div>
            </div>
            <div className="editorial-rule-thick mt-10" />
          </div>
        </div>

        <div className="container py-10 lg:py-16">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Caricamento cronache...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-border rounded-lg bg-card/50">
              <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="font-display text-xl font-bold mb-2">Ancora nessuna storia</h3>
              <p className="font-editorial italic text-muted-foreground mb-6">
                Sii il primo a raccontare la tua avventura su una Big Bench.
              </p>
              <Button asChild>
                <Link to="/">Inizia dalla Mappa</Link>
              </Button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-card">
        <div className="container text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Mountain className="w-5 h-5 text-primary" />
            <span className="font-display font-bold tracking-widest text-lg uppercase">Big Bench App</span>
          </div>
          <div className="editorial-rule max-w-xs mx-auto mb-6" />
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            © 2026 Cronache dell'Orizzonte · Archivio Pubblico
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Community;
