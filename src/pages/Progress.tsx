import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Check, Lock, ArrowLeft, Loader2, MapPin, ExternalLink } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useMemo } from "react";
import { motion } from "motion/react";
import { useVisitedBenches } from "@/hooks/useVisitedBenches";
import { useBenches } from "@/hooks/useBenches";

const getExplorerGrade = (percentage: number) => {
  if (percentage >= 80) return "Master Explorer";
  if (percentage >= 50) return "Explorer Grade II";
  if (percentage >= 25) return "Explorer Grade III";
  if (percentage > 0) return "Novice Explorer";
  return "Newcomer";
};

function deterministicShuffle<T extends { id: number }>(arr: T[]): T[] {
  const copy = [...arr];
  let seed = copy.reduce((s, b) => s + b.id, 0) || 1;
  for (let i = copy.length - 1; i > 0; i--) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    const j = seed % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const ProgressPage = () => {
  const { visitedIds, toggleVisited } = useVisitedBenches();
  const { data: benches = [], isLoading } = useBenches();

  const visitedSet = useMemo(() => new Set(visitedIds), [visitedIds]);

  const visitedBenches = useMemo(
    () => benches.filter(b => visitedSet.has(b.id)),
    [benches, visitedSet]
  );
  const unvisitedBenches = useMemo(
    () => benches.filter(b => !visitedSet.has(b.id)),
    [benches, visitedSet]
  );

  const total = benches.length;
  const visitedCount = visitedBenches.length;
  const percentage = total > 0 ? Math.round((visitedCount / total) * 100) : 0;

  const regionsVisited = useMemo(
    () => new Set(visitedBenches.map(b => b.region)).size,
    [visitedBenches]
  );
  const totalRegions = useMemo(
    () => new Set(benches.map(b => b.region)).size,
    [benches]
  );
  const countriesVisited = useMemo(
    () => new Set(visitedBenches.map(b => b.country)).size,
    [visitedBenches]
  );
  const allCountries = useMemo(
    () => Array.from(new Set(benches.map(b => b.country))).sort(),
    [benches]
  );

  const shuffledUnvisited = useMemo(
    () => deterministicShuffle(unvisitedBenches),
    [unvisitedBenches]
  );
  // First 2 shown as locked stamps after the visited collection
  const previewUnvisited = shuffledUnvisited.slice(0, 2);
  // Next 8 for the todo list
  const todoList = shuffledUnvisited.slice(2, 10);

  const currentDate = new Date().toLocaleDateString("it-IT", { month: "long", year: "numeric" });

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
      <main className="flex-1 animate-fade-in">
        <div className="container max-w-4xl py-8 sm:py-14">

          {/* Back link */}
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mb-8 uppercase tracking-widest"
          >
            <ArrowLeft className="w-3 h-3" />
            Torna alla mappa
          </Link>

          {/* ── Title ── */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8">
            <div>
              <h1 className="font-display text-5xl sm:text-7xl font-bold leading-none mb-3">
                Il tuo<br />
                <span className="font-editorial italic font-normal">Passaporto</span>
              </h1>
              <p className="text-sm text-muted-foreground font-editorial italic max-w-xs leading-relaxed">
                Il registro delle tue scoperte. Ogni timbro è una storia raggiunta.
              </p>
            </div>
            <div className="mt-5 sm:mt-0 text-left sm:text-right">
              <p className="text-xs text-muted-foreground capitalize tracking-widest uppercase">{currentDate}</p>
              <p className="font-display text-sm font-bold text-primary mt-1">{getExplorerGrade(percentage)}</p>
            </div>
          </div>

          <div className="editorial-rule-thick mb-10" />

          {/* ── Stats row — thin bordered cells ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 border border-border divide-y sm:divide-y-0 divide-x divide-border mb-12">
            {[
              { label: "Visitate", value: visitedCount, sub: `su ${total}` },
              { label: "Completamento", value: `${percentage}%`, sub: null },
              { label: "Regioni", value: regionsVisited, sub: `su ${totalRegions}` },
              { label: "Paesi", value: countriesVisited || 0, sub: "esplorati" },
            ].map(({ label, value, sub }) => (
              <div key={label} className="px-5 py-6">
                <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-2">{label}</p>
                <p className="font-display text-4xl sm:text-5xl font-bold leading-none">{value}</p>
                {sub && <p className="text-xs text-muted-foreground mt-1.5">{sub}</p>}
              </div>
            ))}
          </div>

          {/* ── Two-column layout ── */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">

            {/* ── Left: stamp collection + todo list ── */}
            <div className="lg:col-span-3 space-y-12">

              {/* Stamp collection */}
              <section>
                <div className="flex items-baseline justify-between mb-4">
                  <h3 className="font-display text-xl font-bold">
                    The <span className="font-editorial italic font-normal">Stamp</span> Collection
                  </h3>
                  <span className="text-xs text-muted-foreground">{visitedCount} / {total}</span>
                </div>
                <div className="border-b border-border mb-6" />

                {visitedCount === 0 ? (
                  <div className="py-10 text-center">
                    <div className="flex justify-center gap-4 mb-6 opacity-30">
                      {shuffledUnvisited.slice(0, 3).map((bench) => (
                        <div key={bench.id} className="text-center">
                          <div className="w-14 h-14 rounded-full mx-auto mb-1 flex items-center justify-center border-2 border-dashed border-border">
                            <Lock className="w-4 h-4 text-muted-foreground" />
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground font-editorial italic">
                      Non hai ancora visitato nessuna panchina.<br />Vai sulla mappa e inizia!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-x-4 gap-y-6">
                    {/* Visited stamps */}
                    {visitedBenches.map((bench, i) => {
                      const bColor = bench.colors?.[0] || "#C4572A";
                      return (
                        <motion.div
                          key={bench.id}
                          initial={{ opacity: 0, scale: 0.85 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.35, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                        >
                          <Link to={`/bench/${bench.id}`} className="text-center group block">
                            <div
                              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto mb-2 flex items-center justify-center border-2 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-md"
                              style={{ backgroundColor: `${bColor}20`, borderColor: bColor }}
                            >
                              <Check className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 group-hover:scale-110" style={{ color: bColor }} />
                            </div>
                            <p className="text-xs font-editorial italic leading-tight text-foreground line-clamp-2">
                              {bench.name}
                            </p>
                            <p className="text-[9px] text-muted-foreground mt-0.5 truncate">
                              {bench.location}
                            </p>
                          </Link>
                        </motion.div>
                      );
                    })}

                    {/* 2 random unvisited — dimmed locked stamps */}
                    {previewUnvisited.map((bench) => (
                      <div key={bench.id} className="text-center opacity-25 select-none">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto mb-2 flex items-center justify-center border-2 border-dashed border-border">
                          <Lock className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <p className="text-xs font-editorial italic leading-tight text-muted-foreground line-clamp-2">
                          {bench.name}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Todo list */}
              <section>
                <div className="flex items-baseline justify-between mb-4">
                  <h3 className="font-display text-xl font-bold">
                    Da <span className="font-editorial italic font-normal">Visitare</span>
                  </h3>
                  <span className="text-xs text-muted-foreground">selezione casuale</span>
                </div>
                <div className="border-b border-border mb-2" />

                {todoList.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground font-editorial italic">
                    Hai visitato tutte le panchine — complimenti!
                  </p>
                ) : (
                  <div className="divide-y divide-border/40">
                    {todoList.map((bench, i) => {
                      const bColor = bench.colors?.[0] || "#C4572A";
                      return (
                        <motion.div
                          key={bench.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                          className="flex items-center gap-3 py-3.5 px-1 hover:bg-muted/30 -mx-1 transition-colors"
                        >
                          <div
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: bColor }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-display text-sm font-bold leading-tight truncate">
                              {bench.name}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1 truncate">
                              <MapPin className="w-3 h-3 shrink-0" />
                              {bench.location}{bench.region ? `, ${bench.region}` : ""}
                            </p>
                          </div>
                          <Button
                            size="icon"
                            variant="outline"
                            className="shrink-0 h-8 w-8"
                            onClick={() => toggleVisited(bench.id)}
                            title="Segna come visitata"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="shrink-0 h-8 w-8"
                            asChild
                          >
                            <Link to={`/bench/${bench.id}`} aria-label="Vedi dettagli panchina">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          </Button>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>

            {/* ── Right: progress sidebar ── */}
            <div className="lg:col-span-2 space-y-8">

              {/* Overall progress */}
              <div>
                <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-5">
                  Il tuo percorso
                </p>
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-2">
                      <span>Panchine</span>
                      <span>{visitedCount} / {total}</span>
                    </div>
                    <Progress value={percentage} className="h-px border-0 rounded-none" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-2">
                      <span>Regioni</span>
                      <span>{regionsVisited} / {totalRegions}</span>
                    </div>
                    <Progress
                      value={totalRegions > 0 ? (regionsVisited / totalRegions) * 100 : 0}
                      className="h-px border-0 rounded-none"
                    />
                  </div>
                </div>
                <div className="border-t border-border/50 mt-6 pt-6">
                  <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1.5">
                    Grado esploratore
                  </p>
                  <p className="font-display text-lg font-bold text-primary">
                    {getExplorerGrade(percentage)}
                  </p>
                </div>
              </div>

              {/* Per-country breakdown */}
              {allCountries.length > 1 && (
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-5">
                    Per Paese
                  </p>
                  <div className="space-y-4">
                    {allCountries.map(country => {
                      const totalC = benches.filter(b => b.country === country).length;
                      const visitedC = visitedBenches.filter(b => b.country === country).length;
                      return (
                        <div key={country}>
                          <div className="flex justify-between text-xs text-muted-foreground mb-2">
                            <span>{country}</span>
                            <span>{visitedC} / {totalC}</span>
                          </div>
                          <Progress
                            value={totalC > 0 ? (visitedC / totalC) * 100 : 0}
                            className="h-px border-0 rounded-none"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        <Footer />
      </main>
    </div>
  );
};

export default ProgressPage;
