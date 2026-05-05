import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Check, Lock, ArrowLeft, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { parseLocalDate } from "@/lib/utils";
import { useVisitedBenches } from "@/hooks/useVisitedBenches";
import { useBenches } from "@/hooks/useBenches";

const quotes = [
  {
    text: "Distance is not just a measure of space, but of the clarity one finds in the silence of the high plains.",
    source: "From the Editor's Note, Vol. III"
  },
  {
    text: "Every bench is a window to a world we forgot to notice.",
    source: "Big Bench Community"
  },
];

const getExplorerGrade = (percentage: number) => {
  if (percentage >= 80) return "Master Explorer";
  if (percentage >= 50) return "Explorer Grade II";
  if (percentage >= 25) return "Explorer Grade III";
  if (percentage > 0) return "Novice Explorer";
  return "Newcomer";
};

const ProgressPage = () => {
  const { visitedIds, toggleVisited } = useVisitedBenches();
  const { data: benches = [], isLoading } = useBenches();

  const total = benches.length;
  const benchIds = new Set(benches.map(b => b.id));
  const visitedCount = visitedIds.filter(id => benchIds.has(id)).length;
  const percentage = total > 0 ? Math.round((visitedCount / total) * 100) : 0;

  const regionsVisited = new Set(
    benches.filter(b => visitedIds.includes(b.id)).map(b => b.region)
  ).size;
  const totalRegions = new Set(benches.map(b => b.region)).size;

  // Total altitude of visited benches
  const totalAltitude = benches
    .filter(b => visitedIds.includes(b.id))
    .reduce((sum, b) => sum + (b.altitude_m || 0), 0);

  // Recent visits (last 3 visited)
  const recentVisits = benches.filter(b => visitedIds.includes(b.id)).slice(-3);

  // Featured bench (random unvisited or first)
  const unvisited = benches.filter(b => !visitedIds.includes(b.id));
  const featured = unvisited.length > 0 ? unvisited[0] : benches[0];
  const featuredColor = featured?.colors?.[0] || "#C4572A";

  const currentDate = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const quote = quotes[visitedCount % quotes.length];

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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero section */}
        <div className="container max-w-4xl py-8 sm:py-12">
          {/* Back link */}
          <Link to="/" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors mb-6 uppercase tracking-widest">
            <ArrowLeft className="w-3 h-3" />
            Personal Archive Vol. IV
          </Link>

          {/* Title area */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-6">
            <div>
              <h1 className="text-4xl sm:text-6xl leading-none mb-1">
                Passport &<br />
                <span className="font-editorial italic font-normal">Progress</span>
              </h1>
              <p className="text-sm text-muted-foreground font-editorial mt-3 max-w-sm">
                A curated record of your high-altitude discoveries. Every stamp tells a story of the horizon reached and the stillness found.
              </p>
            </div>
            <div className="mt-4 sm:mt-0 text-right">
              <p className="text-sm text-muted-foreground">{currentDate}</p>
              <p className="text-sm font-display font-bold text-primary mt-1">{getExplorerGrade(percentage)}</p>
            </div>
          </div>

          <div className="editorial-rule-thick mb-8" />

          {/* Two column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left column */}
            <div className="lg:col-span-2 space-y-6">
              {/* The Ledger */}
              <div className="bg-card border border-border rounded-lg p-5 shadow-[var(--shadow-editorial)]">
                <h3 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4 font-medium">The Ledger</h3>
                
                <div className="space-y-4">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total Altitude Traversed</p>
                      <p className="text-3xl font-display font-bold leading-none mt-1">
                        {(totalAltitude / 1000).toFixed(1)} <span className="text-base font-normal text-muted-foreground">km</span>
                      </p>
                    </div>
                    <div className="flex gap-0.5">
                      {[...Array(Math.min(visitedCount, 8))].map((_, i) => (
                        <div key={i} className="w-2 h-6 bg-primary rounded-sm" style={{ height: `${12 + i * 3}px` }} />
                      ))}
                    </div>
                  </div>

                  <div className="editorial-rule" />

                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Benches Discovered</p>
                      <p className="text-3xl font-display font-bold leading-none mt-1">
                        {visitedCount} <span className="text-base font-normal text-muted-foreground">sites</span>
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">+{Math.min(visitedCount, 3)} this month</p>
                  </div>
                </div>
              </div>

              {/* Featured bench card */}
              {featured && (
                <div className="relative rounded-lg overflow-hidden border border-border shadow-[var(--shadow-card)]">
                  <div className="absolute top-3 left-3 z-10">
                    <span className="text-[9px] uppercase tracking-[0.2em] bg-card/90 px-2 py-1 rounded-sm font-medium">
                      Safe for Work
                    </span>
                  </div>
                  <div className="bg-muted aspect-[4/3] flex items-center justify-center">
                    <div className="text-center p-6">
                      <div
                        className="w-16 h-16 rounded-sm mx-auto mb-3 flex items-center justify-center text-xl font-bold"
                        style={{ backgroundColor: featuredColor, color: "#fff" }}
                      >
                        #{featured.number}
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-card">
                    <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mb-1">The Next Expedition</p>
                    <h3 className="font-display text-lg font-bold leading-tight">
                      {featured.name.replace("Panchina ", "")}:<br />
                      <span className="font-editorial italic font-normal">The Horizon</span>
                    </h3>
                    <p className="text-xs text-muted-foreground font-editorial mt-2 line-clamp-2">
                      {featured.description || "Questa panchina gigante invita i visitatori a fermarsi, sedersi e tornare bambini."}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-wider">
                      Difficulty: Moderate · {featured.region}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Right column */}
            <div className="lg:col-span-3 space-y-6">
              {/* The Stamp Collection */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-display text-xl font-bold">
                    The <span className="font-editorial italic font-normal">Stamp</span> Collection
                  </h3>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    Portfolio · Recent Passports
                  </p>
                </div>
                <div className="editorial-rule mb-5" />

                <div className="grid grid-cols-3 gap-4">
                  {benches.slice(0, 12).map((bench) => {
                    const isVisited = visitedIds.includes(bench.id);
                    const bColor = bench.colors?.[0] || "#C4572A";
                    return (
                      <div
                        key={bench.id}
                        className="text-center cursor-pointer group"
                        onClick={() => toggleVisited(bench.id)}
                      >
                        {/* Stamp circle */}
                        <div className={`
                          w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto mb-2
                          flex items-center justify-center
                          border-2 transition-all duration-300
                          ${isVisited
                            ? "border-transparent shadow-[var(--shadow-card)]"
                            : "border-dashed border-border opacity-50 group-hover:opacity-80"
                          }
                        `}
                        style={isVisited ? { backgroundColor: `${bColor}20`, borderColor: bColor } : {}}
                        >
                          {isVisited ? (
                            <Check className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: bColor }} />
                          ) : (
                            <Lock className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                        {/* Date label */}
                        <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-0.5">
                          {isVisited && bench.installed_on ? parseLocalDate(bench.installed_on).getFullYear() : "—"}
                        </p>
                        {/* Name */}
                        <p className={`text-xs font-editorial italic leading-tight ${
                          isVisited ? "text-foreground" : "text-muted-foreground"
                        }`}>
                          {bench.name.replace("Panchina ", "").replace(" di ", " d'").split(" ").slice(0, 2).join(" ")}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quote block */}
              <div className="bg-muted rounded-lg p-8 text-center my-6">
                <p className="text-primary text-2xl font-display mb-3">"</p>
                <p className="font-editorial italic text-lg sm:text-xl leading-relaxed max-w-md mx-auto text-foreground/80">
                  "{quote.text}"
                </p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-4">
                  — {quote.source}
                </p>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </main>
    </div>
  );
};

export default ProgressPage;
