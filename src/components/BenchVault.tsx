import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { X, MapPin, Camera, Check, ExternalLink } from "lucide-react";
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

  const primaryColor   = bench?.colors?.[0] || "hsl(var(--primary))";
  const secondaryColor = bench?.colors?.[1] || primaryColor;

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="rounded-t-2xl h-[92vh] sm:h-[80vh] border-t border-border">
        <DrawerHeader className="sr-only">
          <DrawerTitle>{bench?.name ?? "Bench Details"}</DrawerTitle>
          <DrawerDescription>Detailed view of the selected bench.</DrawerDescription>
        </DrawerHeader>

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full border border-border bg-background flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <AnimatePresence mode="wait">
          {bench && (
            <motion.div
              key={bench.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-y-auto flex-1 min-h-0 px-5 sm:px-8 pb-8 pt-4"
            >
              <div className="max-w-2xl mx-auto flex flex-col gap-6 sm:gap-8">

                {/* Color accent bar */}
                <div
                  className="h-1 w-16 rounded-full opacity-80"
                  style={{ background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}
                />

                {/* Title block */}
                <div className="space-y-1.5">
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
                    {bench.location}{bench.region ? `, ${bench.region}` : ""}
                  </p>
                </div>

                {/* Main grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Image placeholder */}
                  <div className="rounded-xl border border-border bg-muted aspect-[4/3] flex flex-col items-center justify-center relative overflow-hidden">
                    <Camera className="w-8 h-8 text-muted-foreground/30 mb-2" />
                    <p className="text-xs text-muted-foreground/40 font-sans tracking-wider uppercase">No photo</p>
                    <div
                      className="absolute bottom-0 left-0 right-0 h-1"
                      style={{ background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}
                    />
                  </div>

                  {/* Info + actions */}
                  <div className="flex flex-col justify-between gap-5">
                    <div className="space-y-4">
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
                          <p className="text-xs font-medium font-sans tabular-nums">
                            {bench.lat.toFixed(4)}°N
                          </p>
                          <p className="text-xs font-medium font-sans tabular-nums">
                            {bench.lng.toFixed(4)}°E
                          </p>
                        </div>
                        <div className="rounded-lg border border-border p-3 bg-muted/40">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-0.5">Stato</p>
                          <p className={`text-xs font-medium ${visited ? "text-primary" : "text-muted-foreground"}`}>
                            {visited ? "Visitata" : "Non visitata"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        size="lg"
                        className="w-full"
                        onClick={() => navigate(`/bench/${bench.id}`)}
                      >
                        Esplora <ExternalLink className="w-4 h-4" />
                      </Button>
                      <Button
                        size="lg"
                        variant={visited ? "secondary" : "outline"}
                        className="w-full"
                        onClick={onToggleVisited}
                      >
                        <Check className="w-4 h-4" />
                        {visited ? "Visitata" : "Segna visitata"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DrawerContent>
    </Drawer>
  );
};

export default BenchVault;
