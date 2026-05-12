import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Check, CircleHelp } from "lucide-react";
import { useHaptics } from "@/lib/haptics";

interface VisitedButtonProps {
  visited: boolean;
  onToggleVisited: () => void;
  className?: string;
  benchId?: number;
}

const CONFIRM_TIMEOUT = 2000;

const VisitedButton = ({ visited, onToggleVisited, className = "", benchId }: VisitedButtonProps) => {
  const [confirming, setConfirming] = useState(false);
  const [visitKey, setVisitKey] = useState(0);
  const { playHaptic } = useHaptics();
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    clearTimer();
    setConfirming(false);
    return () => {
      clearTimer();
    };
  }, [benchId]);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }
  };

  const isJustVisited = visited && visitKey > 0;

  return (
    <Button
      variant={visited ? "accent" : "secondary"}
      className={`${confirming ? "text-amber-700" : ""} ${isJustVisited ? "animate-pop" : ""} relative overflow-hidden ${className}`}
      onClick={() => {
        playHaptic('light');
        if (!visited && !confirming) {
          setConfirming(true);
          timerRef.current = setTimeout(() => setConfirming(false), CONFIRM_TIMEOUT);
        } else {
          clearTimer();
          setConfirming(false);
          onToggleVisited();
          setVisitKey(k => k + 1);
        }
      }}
    >
      {confirming && (
        <span
          className="absolute inset-0 bg-foreground/10 animate-shrink-right"
          style={{ animationDuration: `${CONFIRM_TIMEOUT}ms` }}
        />
      )}
      <span className="relative z-10 flex items-center gap-2">
        {confirming ? (
          <><CircleHelp/> CONFERMI?</>
        ) : visited ? (
          <><Check /> VISITATA</>
        ) : (
          <>NON VISITATA</>
        )}
      </span>
    </Button>
  );
};

export default VisitedButton;
