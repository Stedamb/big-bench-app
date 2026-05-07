import { Progress } from "@/components/ui/progress";
import { Trophy, MapPin, TrendingUp, Loader2 } from "lucide-react";
import { useMemo } from "react";
import { type Bench } from "@/hooks/useBenches";

interface ProgressTrackerProps {
  visitedIds: number[];
  benches: Bench[];
  isLoading: boolean;
}

const ProgressTracker = ({ visitedIds, benches, isLoading }: ProgressTrackerProps) => {
  const visitedSet = useMemo(() => new Set(visitedIds), [visitedIds]);

  const total = benches.length;
  const benchIds = useMemo(() => new Set(benches.map(b => b.id)), [benches]);
  const visitedCount = useMemo(() => 
    benches.filter(b => visitedSet.has(b.id) && benchIds.has(b.id)).length,
    [benches, visitedSet, benchIds]
  );
  const percentage = total > 0 ? Math.round((visitedCount / total) * 100) : 0;

  const regionsVisited = useMemo(() => 
    new Set(
      benches.filter(b => visitedSet.has(b.id)).map(b => b.region)
    ).size,
    [benches, visitedSet]
  );

  if (isLoading) {
    return (
      <div className="bg-white rounded-none p-4 shadow-neo border-4 border-black flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-black" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-none p-4 sm:p-6 shadow-neo border-2 sm:border-4 border-black">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3 sm:mb-4 border-b-2 border-black pb-1.5 sm:pb-2">
        <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
        <h3 className="font-display text-lg sm:text-xl font-black uppercase">Il Tuo Progresso</h3>
      </div>

      {/* Progress bar */}
      <div className="space-y-1 sm:space-y-2">
        <div className="flex justify-between text-xs sm:text-sm font-black uppercase tracking-wider">
          <span className="text-black/60">Visitato</span>
          <span className="font-black">{visitedCount}/{total}</span>
        </div>
        <Progress value={percentage} className="h-4 sm:h-6" />
        <p className="text-xs sm:text-sm font-black text-right mt-0.5 sm:mt-1">{percentage}%</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t-2 border-black">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-black flex items-center justify-center bg-accent/20">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-black leading-none">{regionsVisited}</p>
            <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-black/60">Regioni</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-black flex items-center justify-center bg-primary/20">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-black leading-none">{percentage}%</p>
            <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-black/60">Status</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;
