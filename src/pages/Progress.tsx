import { useState, useCallback } from "react";
import Header from "@/components/Header";
import { bigBenches, benchColorMap } from "@/data/benches";
import { Check, MapPin, Mountain, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";

const ProgressPage = () => {
  const [visitedIds, setVisitedIds] = useState<number[]>(() => {
    const saved = localStorage.getItem("bigbench-visited");
    return saved ? JSON.parse(saved) : [];
  });

  const toggleVisited = useCallback((id: number) => {
    setVisitedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id];
      localStorage.setItem("bigbench-visited", JSON.stringify(next));
      return next;
    });
  }, []);

  const total = bigBenches.length;
  const visited = visitedIds.length;
  const percentage = Math.round((visited / total) * 100);

  // Group by region
  const byRegion = bigBenches.reduce((acc, b) => {
    if (!acc[b.region]) acc[b.region] = [];
    acc[b.region].push(b);
    return acc;
  }, {} as Record<string, typeof bigBenches>);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8 max-w-2xl">
        {/* Back */}
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
          <ArrowLeft className="w-3.5 h-3.5" />
          Torna alla mappa
        </Link>

        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl mb-2">Il Tuo Viaggio</h1>
          <div className="editorial-rule-double mb-4" />
          <p className="font-editorial text-lg text-muted-foreground italic">
            Tieni traccia delle panchine giganti che hai visitato e scopri quelle che ti mancano.
          </p>
        </div>

        {/* Overall progress */}
        <div className="bg-card rounded-lg p-6 border border-border shadow-[var(--shadow-editorial)] mb-8">
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="text-sm text-muted-foreground">Progresso totale</p>
              <p className="text-4xl font-display font-bold">{visited}<span className="text-lg text-muted-foreground font-normal">/{total}</span></p>
            </div>
            <p className="text-5xl font-display font-bold text-primary">{percentage}%</p>
          </div>
          <Progress value={percentage} className="h-3" />
        </div>

        {/* By region */}
        {Object.entries(byRegion).map(([region, benches]) => {
          const regionVisited = benches.filter(b => visitedIds.includes(b.id)).length;
          return (
            <div key={region} className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-display font-bold">{region}</h2>
                <span className="text-xs text-muted-foreground">
                  {regionVisited}/{benches.length}
                </span>
              </div>
              <div className="editorial-rule mb-4" />
              <div className="space-y-2">
                {benches.map(bench => {
                  const color = benchColorMap[bench.color] || "#C4572A";
                  const isVisited = visitedIds.includes(bench.id);
                  return (
                    <div
                      key={bench.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                        isVisited
                          ? "bg-accent/10 border-accent/30"
                          : "bg-card border-border hover:border-primary/30"
                      }`}
                      onClick={() => toggleVisited(bench.id)}
                    >
                      <div
                        className="w-8 h-8 rounded-sm flex items-center justify-center text-xs font-bold shrink-0"
                        style={{ backgroundColor: color, color: bench.color === "Bianca" ? "#1a1a1a" : "#fff" }}
                      >
                        #{bench.number}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{bench.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {bench.location}
                          <span className="mx-1">·</span>
                          <Mountain className="w-3 h-3" />
                          {bench.altitude}m
                        </p>
                      </div>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors ${
                        isVisited ? "bg-accent border-accent" : "border-border"
                      }`}>
                        {isVisited && <Check className="w-3.5 h-3.5 text-accent-foreground" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
};

export default ProgressPage;
