import { MapPin } from "lucide-react";
import type { Bench } from "@/hooks/useBenches";
import { translateRegion } from "@/lib/constants";

interface BenchHeaderProps {
  bench: Bench;
  className?: string;
}

/**
 * Shared component for bench headers, displaying the bench number,
 * colored badges, name, and translated location/region.
 */
const BenchHeader = ({ bench, className = "" }: BenchHeaderProps) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground font-sans tracking-widest uppercase">
          No. {bench.number}
        </span>
        <div className="flex gap-1">
          {bench.colors?.map((c, i) => (
            <div key={i} className="w-3 h-3 rounded-full border border-border/50" style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>
      <h2 className="font-display text-3xl sm:text-5xl leading-none">{bench.name}</h2>
      <p className="text-sm text-muted-foreground flex items-center gap-1.5">
        <MapPin className="w-3.5 h-3.5 shrink-0" />
        {bench.location}{bench.region ? `, ${translateRegion(bench.region)}` : ""}
      </p>
    </div>
  );
};

export default BenchHeader;
