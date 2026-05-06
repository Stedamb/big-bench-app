import { X, MapPin, Mountain, Calendar, Palette, Camera, Check, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { parseLocalDate } from "@/lib/utils";
import type { Bench } from "@/hooks/useBenches";

interface BenchSidePanelProps {
  bench: Bench | null;
  visited: boolean;
  onClose: () => void;
  onToggleVisited: () => void;
}

const BenchSidePanel = ({ bench, visited, onClose, onToggleVisited }: BenchSidePanelProps) => {
  const navigate = useNavigate();
  if (!bench) return null;
  
  const primaryColor = bench.colors?.[0] || "#C4572A";
  const secondaryColor = bench.colors?.[1] || primaryColor;

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
        <div className="h-1.5 sm:h-full sm:w-1.5 sm:absolute sm:left-0 sm:top-0" style={{ background: `linear-gradient(to bottom, ${primaryColor}, ${secondaryColor})` }} />

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
            {bench.name}
          </h2>

          {/* Location badge */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex -space-x-1">
              {bench.colors?.map((c, i) => (
                <div
                  key={i}
                  className="w-4 h-4 rounded-full border border-white"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              {bench.lat.toFixed(4)}°N, {bench.lng.toFixed(4)}°E
            </span>
          </div>

          {/* Photo placeholder */}
          <div className="relative rounded-lg overflow-hidden bg-muted mb-5 aspect-[4/3]">
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
              <Camera className="w-10 h-10 mb-2 opacity-40" />
              <p className="text-xs font-editorial italic opacity-60">Guestbook</p>
            </div>
            {/* Simulated photo border */}
            <div className="absolute inset-2 border border-border/40 rounded pointer-events-none" />
          </div>

          {/* Installed info */}
          <p className="text-xs text-muted-foreground font-editorial leading-relaxed mb-6">
            {bench.installed_on ? `Installata il ${parseLocalDate(bench.installed_on).toLocaleDateString("it-IT", { year: 'numeric', month: 'long', day: 'numeric' })}` : "Parte del progetto Big Bench Community Project"}.
            {bench.artist ? ` Creata dall'artista ${bench.artist}, questa` : " Questa"} panchina è situata nei pressi di {bench.location}, offrendo una vista panoramica
            sulle bellezze del {bench.region}.
          </p>

          {/* Action buttons */}
          <div className="space-y-2">
            <Button
              className="w-full gap-2 h-11 font-medium"
              variant="default"
              onClick={() => navigate(`/bench/${bench.id}`)}
            >
              <ExternalLink className="w-4 h-4" />
              Vedi tutti i dettagli →
            </Button>
            <Button
              className="w-full gap-2 h-11"
              variant={visited ? "secondary" : "outline"}
              onClick={onToggleVisited}
            >
              <Check className="w-4 h-4" />
              {visited ? "✓ Panchina visitata!" : "Segna come visitata"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default BenchSidePanel;
