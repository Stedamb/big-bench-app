import { Search, X, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { translateCountry, translateRegion } from "@/lib/constants";

interface MapFiltersProps {
  searchQuery:      string;
  onSearchChange:   (v: string) => void;
  selectedCountry:  string;
  onCountryChange:  (v: string) => void;
  selectedRegion:   string;
  onRegionChange:   (v: string) => void;
  countries:        string[];
  regions:          string[];
  totalResults:     number;
}

const MapFilters = ({
  searchQuery, onSearchChange,
  selectedCountry, onCountryChange,
  selectedRegion, onRegionChange,
  countries, regions, totalResults,
}: MapFiltersProps) => {
  const hasSearch = searchQuery.length > 0;

  return (
    <div className="flex items-center gap-1.5 bg-background/70 backdrop-blur-md px-2 py-1.5 rounded-2xl border border-border shadow-md w-full max-w-xl">
      {/* Search */}
      <div className="relative flex-1 flex items-center">
        <Search className="absolute left-2.5 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Cerca panchina…"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8 pr-7 h-8 border-none bg-transparent shadow-none focus-visible:ring-0 text-sm placeholder:text-foreground/60 rounded-xl"
        />
        {hasSearch && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      <div className="w-px h-5 bg-border shrink-0" />

      {/* Country filter */}
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-muted whitespace-nowrap">
          {selectedCountry === "all" ? "Paese" : translateCountry(selectedCountry)}
          <ChevronDown className="w-3 h-3" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="z-[1100] min-w-[120px]">
          <DropdownMenuItem onClick={() => onCountryChange("all")}>Tutti</DropdownMenuItem>
          {countries.map(c => (
            <DropdownMenuItem key={c} onClick={() => onCountryChange(c)}>{translateCountry(c)}</DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Region filter */}
      {regions.length > 0 && (
        <>
          <div className="w-px h-5 bg-border shrink-0" />
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-muted whitespace-nowrap">
              {selectedRegion === "all" ? "Regione" : translateRegion(selectedRegion)}
              <ChevronDown className="w-3 h-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="z-[1100] min-w-[140px] max-h-64 overflow-y-auto">
              <DropdownMenuItem onClick={() => onRegionChange("all")}>Tutte</DropdownMenuItem>
              {regions.map(r => (
                <DropdownMenuItem key={r} onClick={() => onRegionChange(r)}>{translateRegion(r)}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}

      {/* Result count */}
      <div className="w-px h-5 bg-border shrink-0" />
      <span className="text-xs text-muted-foreground px-1 tabular-nums whitespace-nowrap">{totalResults}</span>
    </div>
  );
};

export default MapFilters;
