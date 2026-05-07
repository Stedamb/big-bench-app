import { Progress } from "@/components/ui/progress";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState, useMemo } from "react";
import { type Bench } from "@/hooks/useBenches";

interface ProgressTrackerProps {
  visitedIds: number[];
  benches: Bench[];
  isLoading: boolean;
}

const ProgressTracker = ({ visitedIds, benches, isLoading }: ProgressTrackerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const visitedSet = useMemo(() => new Set(visitedIds), [visitedIds]);

  const total = benches.length;
  const visitedCount = useMemo(() => 
    benches.filter(b => visitedSet.has(b.id)).length,
    [benches, visitedSet]
  );
  
  const regionsVisitedCount = useMemo(() => 
    new Set(benches.filter(b => visitedSet.has(b.id)).map(b => b.region)).size,
    [benches, visitedSet]
  );
  
  const totalRegions = useMemo(() => 
    new Set(benches.map(b => b.region)).size,
    [benches]
  );

  if (isLoading) return null;

  return (
    <div className="bg-white rounded-none border-2 sm:border-4 border-black shadow-neo w-full overflow-hidden transition-all duration-300 ease-in-out">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 sm:p-4 flex items-center justify-between font-black uppercase tracking-widest text-sm"
        aria-expanded={isOpen}
        aria-controls="progress-tracker-content"
      >
        <span>Il tuo percorso</span>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      <div
        id="progress-tracker-content"
        className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
        aria-hidden={!isOpen}
      >
        <div className="overflow-hidden">
          <div className="p-4 sm:p-6 border-t-2 border-black space-y-6">
            {/* Total Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-black uppercase tracking-wider">
                <span>Totale</span>
                <span>{visitedCount} di {total} visitate</span>
              </div>
              <Progress value={total > 0 ? (visitedCount / total) * 100 : 0} className="h-4" />
            </div>

            {/* Regional Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-black uppercase tracking-wider">
                <span>Regionale</span>
                <span>{regionsVisitedCount} di {totalRegions} regioni</span>
              </div>
              <Progress value={totalRegions > 0 ? (regionsVisitedCount / totalRegions) * 100 : 0} className="h-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;
