import { Progress } from "@/components/ui/progress";
import { useState, useMemo } from "react";
import { ChevronDown } from "lucide-react";
import { type Bench } from "@/hooks/useBenches";

interface ProgressTrackerProps {
  visitedIds: number[];
  benches:    Bench[];
  isLoading:  boolean;
}

const ProgressTracker = ({ visitedIds, benches, isLoading }: ProgressTrackerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const visitedSet = useMemo(() => new Set(visitedIds), [visitedIds]);

  const total        = benches.length;
  const visitedCount = useMemo(() => benches.filter(b => visitedSet.has(b.id)).length, [benches, visitedSet]);
  const regionsCount = useMemo(() => new Set(benches.filter(b => visitedSet.has(b.id)).map(b => b.region)).size, [benches, visitedSet]);
  const totalRegions = useMemo(() => new Set(benches.map(b => b.region)).size, [benches]);
  const visitedPct   = total ? (visitedCount / total) * 100 : 0;
  const regionsPct   = totalRegions ? (regionsCount / totalRegions) * 100 : 0;

  if (isLoading) return null;

  return (
    <div className="bg-background/90 backdrop-blur-md rounded-2xl border border-border shadow-md overflow-hidden w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between text-sm font-medium hover:bg-muted/40 transition-colors"
      >
        <span className="text-foreground">Il tuo percorso</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground tabular-nums">
              {visitedCount}/{total}
            </span>
            <div className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
          </div>
      </button>

      <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <div className="px-4 pb-4 pt-1 border-t border-border space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Panchine</span>
                <span className="tabular-nums">{visitedCount} / {total}</span>
              </div>
              <Progress value={visitedPct} />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Regioni</span>
                <span className="tabular-nums">{regionsCount} / {totalRegions}</span>
              </div>
              <Progress value={regionsPct} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;
