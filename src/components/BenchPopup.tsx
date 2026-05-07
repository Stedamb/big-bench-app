import { motion } from "motion/react";
import { MapPin, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Bench } from "@/hooks/useBenches";

interface BenchPopupProps {
  bench: Bench;
  visited: boolean;
  onToggleVisited: () => void;
  onViewDetail: () => void;
}

const BenchPopup = ({ bench, visited, onToggleVisited, onViewDetail }: BenchPopupProps) => {
  const color = bench.colors?.[0] || "hsl(var(--primary))";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="p-3 min-w-[240px] max-w-[280px]"
    >
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
            {bench.location}{bench.region ? `, ${bench.region}` : ""}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-border">
        <Button
          size="sm"
          variant={visited ? "secondary" : "outline"}
          className="text-xs h-8 gap-1 flex-1"
          onClick={(e) => { e.stopPropagation(); onToggleVisited(); }}
        >
          <Check className="w-3 h-3" />
          {visited ? "Visitata" : "Segna"}
        </Button>
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
    </motion.div>
  );
};

export default BenchPopup;
