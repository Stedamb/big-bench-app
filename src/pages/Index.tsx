import { useState, useMemo } from "react";
import Header from "@/components/Header";
import BenchMap from "@/components/BenchMap";
import ProgressTracker from "@/components/ProgressTracker";
import BenchSidePanel from "@/components/BenchSidePanel";
import MapFilters from "@/components/MapFilters";
import { useVisitedBenches } from "@/hooks/useVisitedBenches";
import { useBenches, type Bench } from "@/hooks/useBenches";

const Index = () => {
  const { visitedIds, toggleVisited } = useVisitedBenches();
  const { data: benches = [], isFetching } = useBenches();
  const [selectedBench, setSelectedBench] = useState<Bench | null>(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [selectedRegion, setSelectedRegion] = useState("all");

  const filteredBenches = useMemo(() => {
    return benches.filter((bench) => {
      const matchesSearch =
        bench.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bench.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(bench.number).includes(searchQuery);

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
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 relative overflow-hidden">
        {/* Map */}
        <div className="absolute inset-0">
          <BenchMap
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
              if (r !== "all") {
                setSelectedCountry("IT");
              }
            }}
            countries={countries}
            regions={regions}
            totalResults={filteredBenches.length}
          />
        </div>

        {/* Progress overlay */}
        <div className="absolute top-4 left-4 z-[1000] w-72 hidden lg:block">
          <ProgressTracker visitedIds={visitedIds} />
        </div>

        {/* Mobile progress - bottom sheet style */}
        {!selectedBench && (
          <div className="absolute bottom-4 left-4 right-4 z-[1000] lg:hidden">
            <ProgressTracker visitedIds={visitedIds} />
          </div>
        )}
      </main>

      {/* Bench side panel */}
      <BenchSidePanel
        bench={selectedBench}
        visited={selectedBench ? visitedIds.includes(selectedBench.id) : false}
        onClose={() => setSelectedBench(null)}
        onToggleVisited={() => selectedBench && toggleVisited(selectedBench.id)}
      />
    </div>
  );
};

export default Index;
