import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Check, CircleHelp } from "lucide-react";
import { useHaptics } from "@/lib/haptics";
import { useAuth } from "@/contexts/AuthContext";

interface VisitedButtonProps {
  visited: boolean;
  onToggleVisited: () => void;
  className?: string;
  benchId?: number;
}

const CONFIRM_TIMEOUT = 2000;

const VisitedButton = ({ visited, onToggleVisited, className = "", benchId }: VisitedButtonProps) => {
  const { user } = useAuth();
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
      disabled={!user && !visited}
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
      <div className="relative z-10 w-full flex items-center justify-center">
        {confirming ? (
          <span className="flex items-center gap-2"><CircleHelp className="w-4 h-4" /> CONFERMI?</span>
        ) : visited ? (
          <span className="flex items-center gap-2"><Check className="w-4 h-4" /> VISITATA</span>
        ) : !user ? (
          <div className="w-full overflow-hidden whitespace-nowrap">
            <div className="animate-marquee inline-block px-4">
              ACCEDI PER SALVARE I PROGRESSI &nbsp; · &nbsp; ACCEDI PER SALVARE I PROGRESSI &nbsp; · &nbsp;
            </div>
          </div>
        ) : (
          <span>NON VISITATA</span>
        )}
      </div>
    </Button>
  );
};

export default VisitedButton;
