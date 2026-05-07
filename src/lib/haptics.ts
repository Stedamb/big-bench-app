import { useWebHaptics } from "web-haptics/react";

/**
 * Since this is a hook-based library, haptic triggers must be used within React components.
 * This utility acts as a type-safe wrapper for the hook's trigger function.
 */
export const useHaptics = () => {
  const { trigger } = useWebHaptics();

  const playHaptic = (type: 'light' | 'medium' | 'heavy' | 'success' | 'error' = 'light') => {
    if (typeof window === 'undefined' || !('vibrate' in navigator)) return;
    trigger(type);
  };

  return { playHaptic };
};
