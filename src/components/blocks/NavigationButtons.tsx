import { MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHaptics } from "@/lib/haptics";

interface NavigationButtonsProps {
  lat: number;
  lng: number;
  className?: string;
}

const NavigationButtons = ({ lat, lng, className = "" }: NavigationButtonsProps) => {
  const { playHaptic } = useHaptics();
  const openGoogleMaps = () => {
    playHaptic("light");
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
  };
  const openDirections = () => {
    playHaptic("light");
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");
  };

  return (
    <div className={`grid grid-cols-2 gap-2 ${className}`}>
      <Button
        variant="outline"
        className="w-full gap-2"
        onClick={openGoogleMaps}
      >
        <MapPin className="w-4 h-4" /> Google Maps
      </Button>
      <Button
        variant="outline"
        className="w-full gap-2"
        onClick={openDirections}
      >
        <Navigation className="w-4 h-4" /> Drive To
      </Button>
    </div>
  );
};

export default NavigationButtons;
