import { useState } from "react";
import Header from "@/components/Header";
import BenchMap from "@/components/BenchMap";
import ProgressTracker from "@/components/ProgressTracker";
import BenchSidePanel from "@/components/BenchSidePanel";
import { type BigBench } from "@/data/benches";
import { useVisitedBenches } from "@/hooks/useVisitedBenches";

const Index = () => {
  const { visitedIds, toggleVisited } = useVisitedBenches();
  const [selectedBench, setSelectedBench] = useState<BigBench | null>(null);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 relative">
        {/* Map */}
        <div className="absolute inset-0">
          <BenchMap
            visitedIds={visitedIds}
            onToggleVisited={toggleVisited}
            onSelectBench={setSelectedBench}
          />
        </div>

        {/* Progress overlay */}
        <div className="absolute top-4 left-4 z-[1000] w-72 hidden sm:block">
          <ProgressTracker visitedIds={visitedIds} />
        </div>

        {/* Mobile progress - bottom sheet style */}
        {!selectedBench && (
          <div className="absolute bottom-4 left-4 right-4 z-[1000] sm:hidden">
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
