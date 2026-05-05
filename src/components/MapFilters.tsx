import { Search, X, Filter, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { translateRegion } from "@/lib/utils";

interface MapFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCountry: string;
  onCountryChange: (country: string) => void;
  selectedRegion: string;
  onRegionChange: (region: string) => void;
  countries: string[];
  regions: string[];
  totalResults: number;
}

const MapFilters = ({
  searchQuery,
  onSearchChange,
  selectedCountry,
  onCountryChange,
  selectedRegion,
  onRegionChange,
  countries,
  regions,
  totalResults,
}: MapFiltersProps) => {
  const clearFilters = () => {
    onSearchChange("");
    onCountryChange("all");
    onRegionChange("all");
  };

  const activeFiltersCount = 
    (selectedCountry !== "all" ? 1 : 0) + 
    (selectedRegion !== "all" ? 1 : 0);

  const hasSearch = searchQuery.length > 0;

  return (
    <div className="flex items-center gap-2 bg-card/90 backdrop-blur-md p-1.5 rounded-full border border-border shadow-[var(--shadow-elevated)] w-full max-w-2xl">
      <div className="relative flex-1 flex items-center">
        <Search className="absolute left-3 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Cerca panchina..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 pr-8 h-9 border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
        />
        {hasSearch && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-2 p-1 hover:bg-muted rounded-full transition-colors"
            aria-label="Clear search"
          >
            <X className="w-3 h-3 text-muted-foreground" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-1.5 px-1.5">
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9 rounded-full gap-2 border-border/50 bg-background/50"
            >
              <Filter className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Filtri</span>
              {activeFiltersCount > 0 && (
                <Badge variant="default" className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px]">
                  {activeFiltersCount}
                </Badge>
              )}
              <ChevronDown className="w-3 h-3 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-4" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-display font-bold text-sm">Filtra Risultati</h4>
                {(activeFiltersCount > 0 || hasSearch) && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearFilters}
                    className="h-7 px-2 text-[10px] uppercase tracking-wider"
                  >
                    Reset
                  </Button>
                )}
              </div>
              
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground ml-1">
                    Nazione
                  </label>
                  <Select value={selectedCountry} onValueChange={onCountryChange}>
                    <SelectTrigger className="h-9 bg-muted/50 border-border/50">
                      <SelectValue placeholder="Tutte le nazioni" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tutte le nazioni</SelectItem>
                      {countries.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground ml-1">
                    Regione
                  </label>
                  <Select value={selectedRegion} onValueChange={onRegionChange}>
                    <SelectTrigger className="h-9 bg-muted/50 border-border/50">
                      <SelectValue placeholder="Tutte le regioni" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tutte le regioni</SelectItem>
                      {regions.map((r) => (
                        <SelectItem key={r} value={r}>{translateRegion(r)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-2 border-t border-border mt-2">
                <p className="text-[10px] uppercase tracking-widest text-center text-muted-foreground font-bold">
                  {totalResults} Risultati trovati
                </p>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default MapFilters;
