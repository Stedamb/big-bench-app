import { useBenches } from "@/hooks/useBenches";
import { Progress } from "@/components/ui/progress";
import { Trophy, MapPin, TrendingUp, Loader2 } from "lucide-react";
import { useMemo } from "react";

interface ProgressTrackerProps {
  visitedIds: number[];
}

const ProgressTracker = ({ visitedIds }: ProgressTrackerProps) => {
  const { data: benches = [], isLoading } = useBenches();

  if (isLoading) {
    return (
      <div className="bg-card rounded-lg p-4 shadow-[var(--shadow-editorial)] border border-border flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
      </div>
    );
  }

  // Convert to Set for O(1) lookups
  const visitedSet = useMemo(() => new Set(visitedIds), [visitedIds]);

  const total = benches.length;
  const benchIds = new Set(benches.map(b => b.id));
  const visitedCount = benches.filter(b => visitedSet.has(b.id) && benchIds.has(b.id)).length;
  const percentage = total > 0 ? Math.round((visitedCount / total) * 100) : 0;

  const regionsVisited = useMemo(() => 
    new Set(
      benches.filter(b => visitedSet.has(b.id)).map(b => b.region)
    ).size,
    [benches, visitedSet]
  );

  return (
    <div className="bg-card rounded-lg p-4 shadow-[var(--shadow-editorial)] border border-border">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Trophy className="w-4 h-4 text-primary" />
        <h3 className="font-display text-sm font-bold">Il Tuo Progresso</h3>
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground font-editorial">Panchine visitate</span>
          <span className="font-bold">{visitedCount}/{total}</span>
        </div>
        <Progress value={percentage} className="h-2" />
        <p className="text-xs text-muted-foreground text-right">{percentage}%</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-border">
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-accent" />
          <div>
            <p className="text-lg font-display font-bold leading-none">{regionsVisited}</p>
            <p className="text-[10px] text-muted-foreground">Regioni</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-3.5 h-3.5 text-primary" />
          <div>
            <p className="text-lg font-display font-bold leading-none">{percentage}%</p>
            <p className="text-[10px] text-muted-foreground">Completato</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;
