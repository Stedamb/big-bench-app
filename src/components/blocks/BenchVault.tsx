import * as React from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { X, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useHaptics } from "@/lib/haptics";
import type { Bench } from "@/hooks/useBenches";
import VisitedButton from "@/components/blocks/VisitedButton";
import BenchHeader from "./BenchHeader";
import NavigationButtons from "./NavigationButtons";
import BenchStats from "./BenchStats";
import { cn } from "@/lib/utils";

interface BenchVaultProps {
  bench: Bench | null;
  visited: boolean;
  onClose: () => void;
  onToggleVisited: () => void;
}

/**
 * A bottom sheet drawer that displays detailed information about a selected bench.
 * Centralizes bench metadata, statistics, and navigation actions.
 */
const BenchVault = ({ bench, visited, onClose, onToggleVisited }: BenchVaultProps) => {
  const navigate = useNavigate();
  const { playHaptic } = useHaptics();
  const isOpen = !!bench;

  const handleDetails = () => {
    playHaptic("medium");
    if (bench) {
      onClose();
      // Small delay to let the drawer close animation start smoothly before unmounting
      setTimeout(() => {
        navigate(`/bench/${bench.id}`);
      }, 150);
    }
  };

  const primaryColor   = bench?.colors?.[0] || "hsl(var(--primary))";
  const secondaryColor = bench?.colors?.[1] || primaryColor;

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent 
        className="h-fit pb-8 border-t border-border shadow-[0_-8px_30px_rgb(0,0,0,0.12)]"
      >
        <DrawerHeader className="sr-only">
          <DrawerTitle>{bench?.name ?? "Bench Details"}</DrawerTitle>
          <DrawerDescription>Detailed view of the selected bench.</DrawerDescription>
        </DrawerHeader>

        {/* Close Button */}
        <div className="absolute top-6 right-6 z-20">
          <div className="max-w-4xl mx-auto relative">
            <button
              onClick={() => {
                playHaptic("light");
                onClose();
              }}
              className="w-10 h-10 rounded-full border border-border bg-background/80 backdrop-blur-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all shadow-sm"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {bench && (
          <div className="h-full overflow-y-auto pt-10">
            <div className="max-w-3xl mx-auto px-6 sm:px-8 flex flex-col gap-8 sm:gap-10">

              {/* Color accent bar */}
              <div
                className="h-1.5 w-24 rounded-full opacity-90"
                style={{ background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}
              />

              {/* Title block */}
              <BenchHeader bench={bench} className="sm:space-y-4" />

              {/* Main content */}
              <div className="flex flex-col gap-10">
                <BenchStats bench={bench} visited={visited} variant="list" />

                <div className="flex flex-col gap-4">
                  <Button
                    size="lg"
                    className="w-full h-14 text-lg font-semibold rounded-2xl shadow-md hover:shadow-lg transition-all"
                    onClick={handleDetails}
                  >
                    DETTAGLI <ExternalLink className="w-5 h-5 ml-2" />
                  </Button>

                  <VisitedButton 
                    visited={visited} 
                    onToggleVisited={onToggleVisited} 
                    className="w-full h-12 rounded-xl" 
                  />

                  <NavigationButtons lat={bench.lat} lng={bench.lng} />
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
