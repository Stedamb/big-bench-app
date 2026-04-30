import { bigBenches } from "@/data/benches";
import { Progress } from "@/components/ui/progress";
import { Trophy, MapPin, TrendingUp } from "lucide-react";

interface ProgressTrackerProps {
  visitedIds: number[];
}

const ProgressTracker = ({ visitedIds }: ProgressTrackerProps) => {
  const total = bigBenches.length;
  const visited = visitedIds.length;
  const percentage = Math.round((visited / total) * 100);

  const regionsVisited = new Set(
    bigBenches.filter(b => visitedIds.includes(b.id)).map(b => b.region)
  ).size;

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
          <span className="font-bold">{visited}/{total}</span>
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
