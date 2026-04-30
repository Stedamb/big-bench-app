import { X, MapPin, Mountain, Calendar, Palette, Camera, Check } from "lucide-react";
import { benchColorMap, type BigBench } from "@/data/benches";
import { Button } from "@/components/ui/button";

interface BenchDetailProps {
  bench: BigBench;
  visited: boolean;
  onClose: () => void;
  onToggleVisited: () => void;
}

const BenchDetail = ({ bench, visited, onClose, onToggleVisited }: BenchDetailProps) => {
  const color = benchColorMap[bench.color] || "#C4572A";

  return (
    <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
      
      {/* Panel */}
      <div className="relative bg-card w-full sm:max-w-lg sm:rounded-lg overflow-hidden max-h-[90vh] flex flex-col animate-slide-up shadow-[var(--shadow-elevated)]">
        {/* Color header bar */}
        <div className="h-2" style={{ backgroundColor: color }} />
        
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-background/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content */}
        <div className="overflow-y-auto p-6">
          {/* Badge + Number */}
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-12 h-12 rounded-sm flex items-center justify-center text-sm font-bold"
              style={{ backgroundColor: color, color: bench.color === "Bianca" ? "#1a1a1a" : "#fff" }}
            >
              #{bench.number}
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold leading-tight">{bench.name}</h2>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5" />
                {bench.location}, {bench.region}
              </p>
            </div>
          </div>

          {/* Decorative rule */}
          <div className="editorial-rule-double mb-4" />

          {/* Description */}
          <p className="font-editorial text-base leading-relaxed drop-cap">
            {bench.description}
          </p>

          {/* Info grid */}
          <div className="grid grid-cols-3 gap-4 mt-6 py-4 border-y border-border">
            <div className="text-center">
              <Mountain className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
              <p className="text-sm font-bold">{bench.altitude}m</p>
              <p className="text-[10px] text-muted-foreground">Altitudine</p>
            </div>
            <div className="text-center">
              <Calendar className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
              <p className="text-sm font-bold">{bench.installed}</p>
              <p className="text-[10px] text-muted-foreground">Installata</p>
            </div>
            <div className="text-center">
              <Palette className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
              <div className="flex items-center justify-center gap-1">
                <div className="w-3 h-3 rounded-full border" style={{ backgroundColor: color }} />
                <p className="text-sm font-bold">{bench.color}</p>
              </div>
              <p className="text-[10px] text-muted-foreground">Colore</p>
            </div>
          </div>

          {/* Photos section */}
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-3">
              <Camera className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-display text-sm font-bold">Foto della Comunità</h3>
            </div>
            <div className="bg-muted rounded-lg p-8 text-center">
              <Camera className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground font-editorial italic">
                Nessuna foto ancora. Sii il primo a condividere!
              </p>
              <Button size="sm" variant="outline" className="mt-3 text-xs">
                Carica una foto
              </Button>
            </div>
          </div>

          {/* Visit action */}
          <div className="mt-6">
            <Button
              className="w-full gap-2"
              variant={visited ? "default" : "outline"}
              onClick={onToggleVisited}
            >
              <Check className="w-4 h-4" />
              {visited ? "✓ Panchina visitata!" : "Segna come visitata"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BenchDetail;
