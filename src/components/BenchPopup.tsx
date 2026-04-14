import { MapPin, Mountain, Check, ArrowRight } from "lucide-react";
import { benchColorMap, type BigBench } from "@/data/benches";
import { Button } from "@/components/ui/button";

interface BenchPopupProps {
  bench: BigBench;
  visited: boolean;
  onToggleVisited: () => void;
  onViewDetail: () => void;
}

const BenchPopup = ({ bench, visited, onToggleVisited, onViewDetail }: BenchPopupProps) => {
  const color = benchColorMap[bench.color] || "#C4572A";

  return (
    <div className="p-4 min-w-[260px]">
      {/* Color bar */}
      <div className="h-1.5 rounded-full mb-3" style={{ backgroundColor: color }} />
      
      {/* Number & Name */}
      <div className="flex items-start gap-3 mb-2">
        <div
          className="w-8 h-8 rounded-sm flex items-center justify-center text-xs font-bold shrink-0"
          style={{ backgroundColor: color, color: bench.color === "Bianca" ? "#1a1a1a" : "#fff" }}
        >
          #{bench.number}
        </div>
        <div>
          <h3 className="font-display text-base font-bold leading-tight">
            {bench.name}
          </h3>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3" />
            {bench.location}, {bench.region}
          </p>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-muted-foreground font-editorial leading-relaxed mt-2 line-clamp-3">
        {bench.description}
      </p>

      {/* Altitude */}
      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
        <Mountain className="w-3 h-3" />
        {bench.altitude}m s.l.m.
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
        <Button
          size="sm"
          variant={visited ? "default" : "outline"}
          className="text-xs h-7 gap-1"
          onClick={onToggleVisited}
        >
          <Check className="w-3 h-3" />
          {visited ? "Visitata" : "Segna visitata"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="text-xs h-7 gap-1 ml-auto"
          onClick={onViewDetail}
        >
          Dettagli
          <ArrowRight className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
};

export default BenchPopup;
