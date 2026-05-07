import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check, CircleHelp } from "lucide-react";
import { useHaptics } from "@/lib/haptics";

interface VisitedButtonProps {
  visited: boolean;
  onToggleVisited: () => void;
  className?: string;
  benchId?: number;
}

const VisitedButton = ({ visited, onToggleVisited, className = "", benchId }: VisitedButtonProps) => {
  const [confirming, setConfirming] = useState(false);
  const { playHaptic } = useHaptics();

  useEffect(() => {
    setConfirming(false);
  }, [benchId]);

  return (
    <Button
      variant={visited ? "accent" : "secondary"}
      className={`${confirming ? "text-amber-700" : ""} ${className}`}
      onClick={() => {
        playHaptic('light');
        if (!visited && !confirming) {
          setConfirming(true);
        } else {
          setConfirming(false);
          onToggleVisited();
        }
      }}
    >
      {confirming ? (
        <><CircleHelp/> CONFERMI?</>
      ) : visited ? (
        <><Check /> VISITATA</>
      ) : (
        <>NON VISITATA</>
      )}
    </Button>
  );
};

export default VisitedButton;
