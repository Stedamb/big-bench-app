import * as React from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { X, Camera, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Bench } from "@/hooks/useBenches";
import VisitedButton from "@/components/blocks/VisitedButton";
import BenchHeader from "./BenchHeader";
import NavigationButtons from "./NavigationButtons";
import BenchStats from "./BenchStats";

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

        {bench && (
            <div>
              <div className="max-w-2xl mx-auto px-4 sm:px-6 flex flex-col gap-6 sm:gap-8">

                {/* Color accent bar */}
                <div
                  className="h-1 w-16 rounded-full opacity-80"
                  style={{ background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}
                />

                {/* Title block */}
                <BenchHeader bench={bench} />

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
                    <BenchStats bench={bench} visited={visited} variant="list" />

                    <div className="flex flex-col gap-2">
                      <Button
                        size="lg"
                        className="w-full"
                        onClick={() => navigate(`/bench/${bench.id}`)}
                      >
                        Esplora <ExternalLink className="w-4 h-4" />
                      </Button>

                      <NavigationButtons lat={bench.lat} lng={bench.lng} />

                      <VisitedButton visited={visited} onToggleVisited={onToggleVisited} className="w-full" />
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
