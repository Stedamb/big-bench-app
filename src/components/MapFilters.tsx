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
    <div className="flex items-center gap-1 sm:gap-2 bg-white p-1.5 sm:p-2 rounded-none border-2 sm:border-4 border-black shadow-neo w-full max-w-2xl">
      <div className="relative flex-1 flex items-center">
        <Search className="absolute left-2 sm:left-3 w-4 h-4 sm:w-5 sm:h-5 text-black" />
        <Input
          placeholder="CERCA..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8 sm:pl-10 pr-6 sm:pr-8 h-8 sm:h-10 border-none bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-black/40 font-black uppercase tracking-tight sm:tracking-wider text-xs sm:text-base"
        />
        {hasSearch && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-1 sm:right-2 p-1 hover:bg-secondary rounded-none transition-colors border-2 border-transparent hover:border-black"
            aria-label="Clear search"
          >
            <X className="w-3 h-3 sm:w-4 sm:h-4 text-black" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-1 sm:gap-2 px-1 border-l-2 sm:border-l-4 border-black">
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 sm:h-10 rounded-none gap-1 sm:gap-2 border-2 border-black bg-white shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none px-2 sm:px-4"
            >
              <Filter className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline uppercase font-black tracking-tight">Filtri</span>
              {activeFiltersCount > 0 && (
                <Badge variant="default" className="h-4 w-4 sm:h-6 sm:w-6 p-0 flex items-center justify-center rounded-none shadow-none border-2 border-black text-[8px] sm:text-xs font-black">
                  {activeFiltersCount}
                </Badge>
              )}
              <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-6 rounded-none border-4 border-black shadow-neo" align="end">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b-2 border-black pb-2">
                <h4 className="font-display font-black text-xl uppercase italic">Filtra</h4>
                {(activeFiltersCount > 0 || hasSearch) && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearFilters}
                    className="h-8 px-2 text-[10px] font-black uppercase tracking-widest border-2 border-transparent hover:border-black"
                  >
                    Reset
                  </Button>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest font-black text-black">
                    Nazione
                  </label>
                  <Select value={selectedCountry} onValueChange={onCountryChange}>
                    <SelectTrigger className="h-10 rounded-none border-2 border-black bg-white font-bold uppercase">
                      <SelectValue placeholder="Tutte le nazioni" />
                    </SelectTrigger>
                    <SelectContent className="rounded-none border-2 border-black shadow-neo-sm">
                      <SelectItem value="all">Tutte le nazioni</SelectItem>
                      {countries.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest font-black text-black">
                    Regione
                  </label>
                  <Select value={selectedRegion} onValueChange={onRegionChange}>
                    <SelectTrigger className="h-10 rounded-none border-2 border-black bg-white font-bold uppercase">
                      <SelectValue placeholder="Tutte le regioni" />
                    </SelectTrigger>
                    <SelectContent className="rounded-none border-2 border-black shadow-neo-sm">
                      <SelectItem value="all">Tutte le regioni</SelectItem>
                      {regions.map((r) => (
                        <SelectItem key={r} value={r}>{translateRegion(r)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-4 border-t-2 border-black mt-2">
                <p className="text-xs uppercase tracking-widest text-center text-black font-black">
                  {totalResults} Risultati
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
