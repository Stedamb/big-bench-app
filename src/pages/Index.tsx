import { useState, useMemo, useCallback, useRef } from "react";
import Header from "@/components/Header";
import BenchMap, { type BenchMapHandle } from "@/components/BenchMap";
import ProgressTracker from "@/components/ProgressTracker";
import BenchVault from "@/components/BenchVault";
import MapFilters from "@/components/MapFilters";
import { useVisitedBenches } from "@/hooks/useVisitedBenches";
import { useBenches, type Bench } from "@/hooks/useBenches";
import { Crosshair } from "lucide-react";

const Index = () => {
  const { visitedIds, toggleVisited } = useVisitedBenches();
  const { data: benches = [], isFetching } = useBenches();
  
  // Convert to Set for O(1) lookups
  const visitedSet = useMemo(() => new Set(visitedIds), [visitedIds]);
  const [selectedBench, setSelectedBench] = useState<Bench | null>(null);
  const benchMapRef = useRef<BenchMapHandle>(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [selectedRegion, setSelectedRegion] = useState("all");

  const filteredBenches = useMemo(() => {
    return benches.filter((bench) => {
      const searchLower = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !searchLower ||
        (bench.name?.toLowerCase().includes(searchLower)) ||
        (bench.location?.toLowerCase().includes(searchLower)) ||
        String(bench.number).includes(searchLower);

      const matchesCountry = selectedCountry === "all" || bench.country === selectedCountry;
      const matchesRegion = selectedRegion === "all" || bench.region === selectedRegion;

      return matchesSearch && matchesCountry && matchesRegion;
    });
  }, [benches, searchQuery, selectedCountry, selectedRegion]);

  const countries = useMemo(() => 
    Array.from(new Set(benches.map(b => b.country))).sort()
  , [benches]);

  const regions = useMemo(() => 
    Array.from(new Set(
      benches
        .filter(b => selectedCountry === "all" || b.country === selectedCountry)
        .map(b => b.region)
        .filter(Boolean) as string[]
    )).sort()
  , [benches, selectedCountry]);

  return (
    <div className="min-h-svh flex flex-col">
      <Header />
      
      <main className="flex-1 relative overflow-hidden">
        {/* Map */}
        <div className="absolute inset-0">
          <BenchMap
            ref={benchMapRef}
            benches={filteredBenches}
            isLoading={isFetching}
            visitedIds={visitedIds}
            onToggleVisited={toggleVisited}
            onSelectBench={setSelectedBench}
          />
        </div>

        {/* Filters Overlay */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] w-[90%] sm:w-auto">
          <MapFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCountry={selectedCountry}
            onCountryChange={(c) => {
              setSelectedCountry(c);
              setSelectedRegion("all"); // Reset region when country changes
            }}
            selectedRegion={selectedRegion}
            onRegionChange={(r) => {
              setSelectedRegion(r);
            }}
            countries={countries}
            regions={regions}
            totalResults={filteredBenches.length}
          />
        </div>

        {/* Progress overlay */}
        <div className="absolute top-4 left-4 z-[1000] w-72 hidden lg:block">
          <ProgressTracker visitedIds={visitedIds} benches={benches} isLoading={isFetching} />
        </div>

        {/* Mobile progress + GPS - bottom sheet style */}
        {!selectedBench && (
          <div className="absolute bottom-4 left-4 right-4 z-[1000] lg:hidden flex flex-col gap-2">
            <div className="flex justify-end">
              <button
                onClick={() => benchMapRef.current?.locate()}
                className="w-9 h-9 flex items-center justify-center bg-background/90 backdrop-blur-sm rounded-full shadow-sm border hover:bg-muted transition-colors"
                aria-label="Trova la mia posizione"
              >
                <Crosshair className="text-foreground" size={18} />
              </button>
            </div>
            <ProgressTracker visitedIds={visitedIds} benches={benches} isLoading={isFetching} />
          </div>
        )}
      </main>

      {/* Bench vault (drawer) */}
      <BenchVault
        bench={selectedBench}
        visited={selectedBench ? visitedSet.has(selectedBench.id) : false}
        onClose={() => setSelectedBench(null)}
        onToggleVisited={() => selectedBench && toggleVisited(selectedBench.id)}
      />
    </div>
  );
};

export default Index;
