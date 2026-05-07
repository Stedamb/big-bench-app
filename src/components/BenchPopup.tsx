import { MapPin, Mountain, Check, ArrowRight } from "lucide-react";
import type { Bench } from "@/hooks/useBenches";
import { Button } from "@/components/ui/button";

interface BenchPopupProps {
  bench: Bench;
  visited: boolean;
  onToggleVisited: () => void;
  onViewDetail: () => void;
}

const BenchPopup = ({ bench, visited, onToggleVisited, onViewDetail }: BenchPopupProps) => {
  const color = bench.colors?.[0] || "#C4572A";

  return (
    <div className="p-2 min-w-[280px] bg-white border-2 border-black">
      {/* Color bar */}
      
      {/* Number & Name */}
        <div
          className="w-fit px-4 mb-3 h-10 rounded-none border-2 border-black flex items-center justify-center text-sm font-black shrink-0 shadow-neo-sm bg-white"
        >
          #{bench.number}
        </div>
      <div className="flex items-start gap-3 mb-3">
        <div className="overflow-hidden">
          <h3 className="font-display text-lg font-black uppercase leading-none truncate">
            {bench.name}
          </h3>
          <p className="text-[10px] text-black/60 font-black uppercase tracking-widest flex items-center gap-1 mt-1 truncate">
            <MapPin className="w-3 h-3 shrink-0" />
            {bench.location}{bench.region ? `, ${bench.region}` : ''}
          </p>
        </div>
      </div>
      {/* Actions */}
      <div className="flex items-center gap-2 mt-4 pt-4 border-t-2 border-black">
        <Button
          size="sm"
          variant={visited ? "secondary" : "outline"}
          className="text-[10px] h-9 px-3 gap-1"
          onClick={(e) => {
            e.stopPropagation();
            onToggleVisited();
          }}
        >
          <Check className="w-3 h-3" />
          {visited ? "VISITATA" : "VISITATA?"}
        </Button>
        <Button
          size="sm"
          variant="default"
          className="text-[10px] h-9 px-3 gap-1 ml-auto"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetail();
          }}
        >
          INFO
          <ArrowRight className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
};

export default BenchPopup;
