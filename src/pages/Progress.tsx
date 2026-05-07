import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Check, ArrowLeft, Loader2, MapPin, ExternalLink } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useMemo } from "react";
import { useVisitedBenches } from "@/hooks/useVisitedBenches";
import { useBenches } from "@/hooks/useBenches";

const getExplorerGrade = (percentage: number) => {
  if (percentage >= 80) return "Master Explorer";
  if (percentage >= 50) return "Explorer Grade II";
  if (percentage >= 25) return "Explorer Grade III";
  if (percentage > 0) return "Novice Explorer";
  return "Newcomer";
};

// Deterministic shuffle seeded by sum of IDs — stable across renders for the same data set
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

  // Shuffled unvisited: first 2 go as "preview" in the badge section, rest go in todo list
  const shuffledUnvisited = useMemo(
    () => deterministicShuffle(unvisitedBenches),
    [unvisitedBenches]
  );
  const previewUnvisited = shuffledUnvisited.slice(0, 2);
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
      <main className="flex-1">
        <div className="container max-w-4xl py-8 sm:py-12">

          {/* Back link */}
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-xs text-black/40 hover:text-primary transition-colors mb-6 font-black uppercase tracking-widest"
          >
            <ArrowLeft className="w-3 h-3" />
            Torna alla mappa
          </Link>

          {/* Title */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-6">
            <div>
              <h1 className="text-4xl sm:text-6xl leading-none mb-1">
                Il tuo<br />
                <span className="font-editorial italic font-normal">Passaporto</span>
              </h1>
              <p className="text-sm text-black/50 font-editorial mt-3 max-w-sm">
                Il registro delle tue scoperte. Ogni timbro è una storia raggiunta.
              </p>
            </div>
            <div className="mt-4 sm:mt-0 text-right sm:text-right">
              <p className="text-xs text-black/40 font-bold uppercase tracking-widest capitalize">{currentDate}</p>
              <p className="font-black text-base uppercase tracking-widest text-primary mt-1">
                {getExplorerGrade(percentage)}
              </p>
            </div>
          </div>

          <div className="editorial-rule-thick mb-8" />

          {/* ── Stats row ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
            <div className="border-2 sm:border-4 border-black p-3 sm:p-4 bg-white shadow-neo">
              <p className="text-[9px] font-black uppercase tracking-widest text-black/40 mb-1">Visitate</p>
              <p className="text-3xl sm:text-4xl font-black leading-none">{visitedCount}</p>
              <p className="text-[9px] font-bold text-black/30 mt-1">su {total}</p>
            </div>
            <div className="border-2 sm:border-4 border-black p-3 sm:p-4 bg-white shadow-neo">
              <p className="text-[9px] font-black uppercase tracking-widest text-black/40 mb-1">Completamento</p>
              <p className="text-3xl sm:text-4xl font-black leading-none">
                {percentage}<span className="text-base font-bold">%</span>
              </p>
              <div className="mt-2">
                <Progress value={percentage} className="h-1.5" />
              </div>
            </div>
            <div className="border-2 sm:border-4 border-black p-3 sm:p-4 bg-white shadow-neo">
              <p className="text-[9px] font-black uppercase tracking-widest text-black/40 mb-1">Regioni</p>
              <p className="text-3xl sm:text-4xl font-black leading-none">{regionsVisited}</p>
              <p className="text-[9px] font-bold text-black/30 mt-1">su {totalRegions}</p>
            </div>
            <div className="border-2 sm:border-4 border-black p-3 sm:p-4 bg-white shadow-neo">
              <p className="text-[9px] font-black uppercase tracking-widest text-black/40 mb-1">Paesi</p>
              <p className="text-3xl sm:text-4xl font-black leading-none">{countriesVisited || 0}</p>
              <p className="text-[9px] font-bold text-black/30 mt-1">esplorati</p>
            </div>
          </div>

          {/* ── Two-column layout ── */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

            {/* ── Left: stamp collection + todo list ── */}
            <div className="lg:col-span-3 space-y-10">

              {/* Stamp collection */}
              <section>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-display text-xl font-bold uppercase">
                    Timbri Collezionati
                  </h3>
                  <span className="text-[10px] font-black uppercase tracking-widest text-black/30">
                    {visitedCount} / {total}
                  </span>
                </div>
                <div className="editorial-rule mb-5" />

                {visitedCount === 0 ? (
                  <div className="border-2 border-dashed border-black/20 p-8 text-center">
                    <p className="text-sm text-black/40 font-editorial italic">
                      Non hai ancora visitato nessuna panchina.<br />
                      Vai sulla mappa e inizia la tua avventura!
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {/* Visited — colored badges */}
                    {visitedBenches.map((bench) => {
                      const bColor = bench.colors?.[0] || "#C4572A";
                      return (
                        <Link key={bench.id} to={`/bench/${bench.id}`}>
                          <Badge
                            variant="outline"
                            className="gap-1 cursor-pointer hover:opacity-80 transition-opacity"
                            style={{ backgroundColor: bColor, borderColor: bColor, color: "#fff" }}
                          >
                            <Check className="w-3 h-3" />
                            #{bench.number} {bench.name}
                          </Badge>
                        </Link>
                      );
                    })}

                    {/* 2 random unvisited — dimmed outline */}
                    {previewUnvisited.map((bench) => (
                      <Badge
                        key={bench.id}
                        variant="outline"
                        className="opacity-25 cursor-default select-none"
                      >
                        #{bench.number} {bench.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </section>

              {/* Todo list */}
              <section>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-display text-xl font-bold uppercase">
                    Da Visitare
                  </h3>
                  <span className="text-[10px] font-black uppercase tracking-widest text-black/30">
                    selezione casuale
                  </span>
                </div>
                <div className="editorial-rule mb-5" />

                {todoList.length === 0 ? (
                  <div className="border-2 border-dashed border-black/20 p-8 text-center">
                    <p className="text-sm text-black/40 font-editorial italic">
                      Hai visitato tutte le panchine — complimenti!
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {todoList.map((bench) => {
                      const bColor = bench.colors?.[0] || "#C4572A";
                      return (
                        <div
                          key={bench.id}
                          className="flex items-center gap-3 border-2 border-black p-3 bg-white shadow-neo-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                        >
                          {/* Color swatch */}
                          <div
                            className="w-4 h-10 shrink-0 border-2 border-black"
                            style={{ backgroundColor: bColor }}
                          />
                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="font-black text-sm leading-tight truncate">
                              #{bench.number} {bench.name}
                            </p>
                            <p className="text-[10px] text-black/40 font-bold uppercase tracking-wider mt-0.5 flex items-center gap-1 truncate">
                              <MapPin className="w-3 h-3 shrink-0" />
                              {bench.location}{bench.region ? `, ${bench.region}` : ""}
                            </p>
                          </div>
                          {/* Mark as visited */}
                          <button
                            onClick={() => toggleVisited(bench.id)}
                            title="Segna come visitata"
                            className="shrink-0 w-8 h-8 border-2 border-black bg-white flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          {/* Go to detail */}
                          <Link
                            to={`/bench/${bench.id}`}
                            className="shrink-0 w-8 h-8 border-2 border-black bg-white flex items-center justify-center hover:bg-secondary transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>

            {/* ── Right: progress bars + country breakdown ── */}
            <div className="lg:col-span-2 space-y-6">

              {/* Overall progress */}
              <div className="border-2 sm:border-4 border-black p-5 bg-white shadow-neo space-y-5">
                <h3 className="font-black text-xs uppercase tracking-widest">Il tuo percorso</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-wider mb-1.5">
                      <span>Totale</span>
                      <span>{visitedCount} / {total}</span>
                    </div>
                    <Progress value={percentage} className="h-3" />
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-wider mb-1.5">
                      <span>Regioni</span>
                      <span>{regionsVisited} / {totalRegions}</span>
                    </div>
                    <Progress
                      value={totalRegions > 0 ? (regionsVisited / totalRegions) * 100 : 0}
                      className="h-3"
                    />
                  </div>
                </div>
                <div className="border-t-2 border-black pt-4">
                  <p className="text-[9px] font-black uppercase tracking-widest text-black/40 mb-1">
                    Grado esploratore
                  </p>
                  <p className="font-black text-lg uppercase text-primary">
                    {getExplorerGrade(percentage)}
                  </p>
                </div>
              </div>

              {/* Per-country breakdown — only if there's more than one country */}
              {allCountries.length > 1 && (
                <div className="border-2 border-black p-5 bg-white shadow-neo-sm space-y-4">
                  <h3 className="font-black text-xs uppercase tracking-widest">Per Paese</h3>
                  {allCountries.map(country => {
                    const totalC = benches.filter(b => b.country === country).length;
                    const visitedC = visitedBenches.filter(b => b.country === country).length;
                    return (
                      <div key={country}>
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-wider mb-1.5">
                          <span>{country}</span>
                          <span>{visitedC} / {totalC}</span>
                        </div>
                        <Progress value={totalC > 0 ? (visitedC / totalC) * 100 : 0} className="h-2" />
                      </div>
                    );
                  })}
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
