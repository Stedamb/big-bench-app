import { X, MapPin, Mountain, Calendar, Palette, Camera, Check, ExternalLink } from "lucide-react";
import { benchColorMap, type BigBench } from "@/data/benches";
import { Button } from "@/components/ui/button";

interface BenchSidePanelProps {
  bench: BigBench | null;
  visited: boolean;
  onClose: () => void;
  onToggleVisited: () => void;
}

const BenchSidePanel = ({ bench, visited, onClose, onToggleVisited }: BenchSidePanelProps) => {
  if (!bench) return null;
  const color = benchColorMap[bench.color] || "#C4572A";

  return (
    <>
      {/* Mobile overlay */}
      <div className="fixed inset-0 bg-foreground/30 backdrop-blur-sm z-[1500] sm:hidden" onClick={onClose} />
      
      {/* Panel */}
      <div className={`
        fixed z-[1500] bg-card border-l border-border shadow-[var(--shadow-elevated)]
        transition-transform duration-300 ease-out
        /* Mobile: bottom sheet */
        inset-x-0 bottom-0 top-auto h-[75vh] rounded-t-xl
        sm:inset-y-0 sm:right-0 sm:left-auto sm:top-0 sm:bottom-0 sm:h-full sm:w-[420px] sm:rounded-none
      `}>
        {/* Color header bar */}
        <div className="h-1.5 sm:h-full sm:w-1.5 sm:absolute sm:left-0 sm:top-0" style={{ backgroundColor: color }} />

        {/* Mobile drag handle */}
        <div className="sm:hidden flex justify-center py-2">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 rounded-full bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Scrollable content */}
        <div className="overflow-y-auto h-full px-5 pb-6 pt-2 sm:pt-6 sm:pl-6">
          {/* Bench number label */}
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1 font-medium">
            Bench No. {bench.number}
          </p>

          {/* Title */}
          <h2 className="font-display text-2xl sm:text-3xl font-bold leading-tight mb-2">
            The {bench.name.replace("Panchina ", "")}
          </h2>

          {/* Location badge */}
          <div className="flex items-center gap-2 mb-4">
            <span
              className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-sm text-primary-foreground"
              style={{ backgroundColor: color }}
            >
              {bench.color}
            </span>
            <span className="text-xs text-muted-foreground">
              {bench.lat.toFixed(4)}°N, {bench.lng.toFixed(4)}°E
            </span>
          </div>

          {/* Photo placeholder */}
          <div className="relative rounded-lg overflow-hidden bg-muted mb-5 aspect-[4/3]">
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
              <Camera className="w-10 h-10 mb-2 opacity-40" />
              <p className="text-xs font-editorial italic opacity-60">Foto della comunità</p>
            </div>
            {/* Simulated photo border */}
            <div className="absolute inset-2 border border-border/40 rounded pointer-events-none" />
          </div>

          {/* Description with drop cap */}
          <p className="font-editorial text-sm leading-relaxed drop-cap mb-5">
            {bench.description}
          </p>

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-4 py-4 border-y border-border mb-5">
            <div>
              <p className="text-2xl font-display font-bold">{bench.altitude}<span className="text-sm font-normal text-muted-foreground">m</span></p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Altitudine</p>
            </div>
            <div>
              <p className="text-2xl font-display font-bold">{bench.installed}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Anno Vivo</p>
            </div>
          </div>

          {/* Installed info */}
          <p className="text-xs text-muted-foreground font-editorial leading-relaxed mb-6">
            Installata in {bench.installed} da Chris Bangle, questa panchina è parte del progetto Big Bench
            Community Project. Posizionata nei pressi di {bench.location}, offre una vista panoramica
            sulle bellezze del {bench.region}.
          </p>

          {/* Action buttons */}
          <div className="space-y-2">
            <Button
              className="w-full gap-2 h-11 font-medium"
              variant="default"
              onClick={() => {
                window.open(
                  `https://www.google.com/maps?q=${bench.lat},${bench.lng}`,
                  "_blank"
                );
              }}
            >
              <ExternalLink className="w-4 h-4" />
              View Full Details →
            </Button>
            <Button
              className="w-full gap-2 h-11"
              variant={visited ? "secondary" : "outline"}
              onClick={onToggleVisited}
            >
              <Check className="w-4 h-4" />
              {visited ? "✓ Panchina visitata!" : "Set Visited Status"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default BenchSidePanel;
