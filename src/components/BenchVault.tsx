import * as React from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { X, MapPin, Mountain, Calendar, Palette, Camera, Check, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { parseLocalDate } from "@/lib/utils";
import type { Bench } from "@/hooks/useBenches";

interface BenchVaultProps {
  bench: Bench | null;
  visited: boolean;
  onClose: () => void;
  onToggleVisited: () => void;
}

const BenchVault = ({ bench, visited, onClose, onToggleVisited }: BenchVaultProps) => {
  const navigate = useNavigate();
  
  const isOpen = !!bench;

  const primaryColor = bench?.colors?.[0] || "#C4572A";
  const secondaryColor = bench?.colors?.[1] || primaryColor;

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="border-t-4 border-black rounded-none h-[90vh] sm:h-[80vh]">
        <DrawerHeader className="sr-only">
          <DrawerTitle>{bench?.name || "Bench Details"}</DrawerTitle>
          <DrawerDescription>Detailed view of the selected bench.</DrawerDescription>
        </DrawerHeader>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 border-2 border-black bg-white shadow-neo-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        
        {bench && (
          <div className="overflow-y-auto flex-1 min-h-0 px-4 sm:px-8 py-6 sm:py-10">
            <div className="flex flex-col gap-4 sm:gap-8">
              {/* Header section */}
              <div className="space-y-2 sm:space-y-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="px-2 py-0.5 sm:px-3 sm:py-1 border-2 border-black font-black text-xs sm:text-sm shadow-neo-sm bg-white"
                  >
                    NO. {bench.number}
                  </div>
                  <div className="flex -space-x-1">
                    {bench.colors?.map((c, i) => (
                      <div
                        key={i}
                        className="w-4 h-4 sm:w-6 sm:h-6 rounded-none border-2 border-black"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
                
                <h2 className="text-3xl sm:text-6xl font-black uppercase leading-none tracking-tight break-words">
                  {bench.name}
                </h2>
                
                <p className="text-base sm:text-xl font-black flex items-center gap-2 text-black/60 uppercase">
                  <MapPin className="w-4 h-4 sm:w-6 sm:h-6" />
                  {bench.location}, {bench.region}
                </p>
              </div>

              {/* Main content grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10">
                <div className="relative border-4 border-black bg-white p-1.5 sm:p-3 shadow-neo">
                  <div className="aspect-video sm:aspect-square lg:aspect-[4/3] bg-muted flex flex-col items-center justify-center border-2 border-black overflow-hidden relative">
                     <Camera className="w-10 h-10 sm:w-16 sm:h-16 mb-2 opacity-20" />
                     <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest opacity-30">No Image Available</p>
                     {/* Color strip */}
                     <div className="absolute bottom-0 left-0 right-0 h-3 sm:h-6" style={{ background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }} />
                  </div>
                </div>

                <div className="flex flex-col justify-between gap-6 sm:gap-10">
                  <div className="space-y-4 sm:space-y-8">
                    <p className="text-lg sm:text-2xl font-bold leading-tight italic">
                      "{bench.installed_on ? `Installata il ${parseLocalDate(bench.installed_on).toLocaleDateString("it-IT", { year: 'numeric', month: 'long', day: 'numeric' })}` : "Parte del progetto Big Bench Community Project"}.
                      {bench.artist ? ` Creata dall'artista ${bench.artist}.` : ""} Questa panchina offre una vista panoramica unica."
                    </p>
                    
                    <div className="grid grid-cols-2 gap-3 sm:gap-6">
                      <div className="border-2 border-black p-2 sm:p-4 bg-secondary/30">
                        <p className="text-[8px] sm:text-[10px] font-black uppercase opacity-60">Coordinates</p>
                        <p className="font-black text-xs sm:text-lg">{bench.lat.toFixed(4)}°N, {bench.lng.toFixed(4)}°E</p>
                      </div>
                      <div className="border-2 border-black p-2 sm:p-4 bg-secondary/30">
                        <p className="text-[8px] sm:text-[10px] font-black uppercase opacity-60">Status</p>
                        <p className="font-black text-xs sm:text-lg">{visited ? "VISITED" : "NOT VISITED"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:gap-5 pb-8 sm:pb-0">
                    <Button
                      size="lg"
                      className="w-full text-base sm:text-xl h-14 sm:h-20"
                      onClick={() => navigate(`/bench/${bench.id}`)}
                    >
                      EXPLORE FULL STORY <ExternalLink className="ml-2 w-5 h-5 sm:w-8 sm:h-8" />
                    </Button>
                    
                    <Button
                      size="lg"
                      variant={visited ? "secondary" : "outline"}
                      className="w-full text-base sm:text-xl h-14 sm:h-20"
                      onClick={onToggleVisited}
                    >
                      {visited ? (
                        <>CHECKED IN <Check className="ml-2 w-5 h-5 sm:w-8 sm:h-8" /></>
                      ) : (
                        <>MARK AS VISITED</>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
};

export default BenchVault;
