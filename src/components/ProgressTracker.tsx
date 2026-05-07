import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "motion/react";
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
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 border-t border-border space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Panchine</span>
                  <span className="tabular-nums">{visitedCount} / {total}</span>
                </div>
                <Progress value={(visitedCount / total) * 100} />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Regioni</span>
                  <span className="tabular-nums">{regionsCount} / {totalRegions}</span>
                </div>
                <Progress value={(regionsCount / totalRegions) * 100} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProgressTracker;
