import { Search, X, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

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

  const hasFilters = searchQuery || selectedCountry !== "all" || selectedRegion !== "all";

  return (
    <div className="flex flex-col sm:flex-row gap-2 bg-card/90 backdrop-blur-sm p-2 rounded-lg border border-border shadow-[var(--shadow-elevated)] w-full max-w-4xl">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Cerca per nome, numero o luogo..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-9 border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>

      <div className="flex gap-2">
        <Select value={selectedCountry} onValueChange={onCountryChange}>
          <SelectTrigger className="h-9 w-[130px] border-none bg-transparent focus:ring-0 focus:ring-offset-0">
            <SelectValue placeholder="Nazione" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutte le nazioni</SelectItem>
            {countries.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedRegion} onValueChange={onRegionChange}>
          <SelectTrigger className="h-9 w-[130px] border-none bg-transparent focus:ring-0 focus:ring-offset-0">
            <SelectValue placeholder="Regione" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutte le regioni</SelectItem>
            {regions.map((r) => (
              <SelectItem key={r} value={r}>{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button
            variant="ghost"
            size="icon"
            onClick={clearFilters}
            className="h-9 w-9 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div className="hidden sm:flex items-center px-3 border-l border-border ml-2">
        <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground whitespace-nowrap">
          {totalResults} Risultati
        </span>
      </div>
    </div>
  );
};

export default MapFilters;
