import { MapPin, Mountain, ArrowRight } from "lucide-react";
import type { Bench } from "@/hooks/useBenches";
import { Button } from "@/components/ui/button";
import VisitedButton from "@/components/VisitedButton";

interface BenchPopupProps {
  bench: Bench;
  visited: boolean;
  onToggleVisited: () => void;
  onViewDetail: () => void;
}

const BenchPopup = ({ bench, visited, onToggleVisited, onViewDetail }: BenchPopupProps) => {
  return (
    <div className="p-2 min-w-[280px] bg-white border-2 border-black">
      {/* Number & Name */}
      <div
        className="w-fit px-4 mb-3 h-10 rounded-none border-2 border-black flex items-center justify-center text-sm font-black shrink-0 shadow-neo-sm bg-white"
      >
        #{bench.number}
      </div>
      <div className="flex items-start gap-3 mb-1">
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
      <div className="flex items-center gap-2 pt-4 border-t-2 border-black">
        <VisitedButton visited={visited} onToggleVisited={onToggleVisited} className="text-[10px] h-9 px-3" />
        <Button
          size="sm"
          variant="default"
          className="text-[10px] h-9 px-3 gap-1 ml-auto"
          onClick={(e) => {
            e.stopPropagation();
            playHaptic('medium');
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
