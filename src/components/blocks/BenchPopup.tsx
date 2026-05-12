import { MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import VisitedButton from "@/components/blocks/VisitedButton";
import type { Bench } from "@/hooks/useBenches";
import { translateRegion } from "@/lib/constants";

interface BenchPopupProps {
  bench: Bench;
  visited: boolean;
  onToggleVisited: () => void;
  onViewDetail: () => void;
}

const BenchPopup = ({ bench, visited, onToggleVisited, onViewDetail }: BenchPopupProps) => {
  const color = bench.colors?.[0] || "hsl(var(--primary))";

  return (
    <div className="p-3 min-w-[240px] max-w-[280px]">
      {/* Number + name */}
        <div
          className="w-12 h-8 rounded-lg shrink-0 flex items-center justify-center text-xs font-medium text-white mb-2"
          style={{ backgroundColor: color }}
        >
          {bench.number}
        </div>
      <div className="flex items-start gap-2.5 mb-3">
        <div className="overflow-hidden">
          <h3 className="font-display text-base leading-tight truncate">{bench.name}</h3>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
            <MapPin className="w-3 h-3 shrink-0" />
            {bench.location}{bench.region ? `, ${translateRegion(bench.region)}` : ""}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-border">
        <VisitedButton visited={visited} onToggleVisited={onToggleVisited} className="text-xs h-8 flex-1" />
        <Button
          size="sm"
          variant="default"
          className="text-xs h-8 gap-1 flex-1"
          onClick={(e) => { e.stopPropagation(); onViewDetail(); }}
        >
          Info
          <ArrowRight className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
};

export default BenchPopup;
