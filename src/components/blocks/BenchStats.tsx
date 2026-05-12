import { Mountain, Calendar, Palette, User, MapPin } from "lucide-react";
import { parseLocalDate } from "@/lib/utils";
import type { Bench } from "@/hooks/useBenches";

interface BenchStatsProps {
  bench: Bench;
  visited?: boolean;
  className?: string;
  variant?: "grid" | "list";
}

const BenchStats = ({ bench, visited, className = "", variant = "grid" }: BenchStatsProps) => {
  const primaryColor = bench.colors?.[0] || "#C4572A";

  if (variant === "list") {
    return (
      <div className={`space-y-4 ${className}`}>
        {bench.installed_on && (
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-0.5">Inaugurata</p>
            <p className="text-sm font-medium">
              {parseLocalDate(bench.installed_on).toLocaleDateString("it-IT", {
                year: "numeric", month: "long", day: "numeric",
              })}
            </p>
          </div>
        )}
        {bench.artist && (
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-0.5">Artista</p>
            <p className="text-sm font-medium">{bench.artist}</p>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border p-3 bg-muted/40">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-0.5">Coordinate</p>
            <p className="text-xs font-medium font-sans tabular-nums">{bench.lat.toFixed(4)}°N</p>
            <p className="text-xs font-medium font-sans tabular-nums">{bench.lng.toFixed(4)}°E</p>
          </div>
          {visited !== undefined && (
            <div className="rounded-lg border border-border p-3 bg-muted/40">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-0.5">Stato</p>
              <p className={`text-xs font-medium ${visited ? "text-primary" : "text-muted-foreground"}`}>
                {visited ? "Visitata" : "Non visitata"}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-3 gap-4 py-4 border-y border-border ${className}`}>
      <div className="text-center">
        <Mountain className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
        <p className="text-sm font-bold">{bench.altitude_m || "—"}m</p>
        <p className="text-[10px] text-muted-foreground">Altitudine</p>
      </div>
      <div className="text-center">
        <Calendar className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
        <p className="text-sm font-bold">{bench.installed_on ? new Date(bench.installed_on).getFullYear() : "—"}</p>
        <p className="text-[10px] text-muted-foreground">Installata</p>
      </div>
      <div className="text-center">
        <Palette className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
        <div className="flex items-center justify-center gap-1">
          <div className="w-3 h-3 rounded-full border" style={{ backgroundColor: primaryColor }} />
          <p className="text-sm font-bold capitalize">{bench.colors?.[0] ? "Colori" : "—"}</p>
        </div>
        <p className="text-[10px] text-muted-foreground">Stile</p>
      </div>
    </div>
  );
};

export default BenchStats;
