import { useTheme } from "next-themes";
import { startThemeTransition } from "@/lib/themeTransition";

export function useThemeTransition() {
  const { setTheme, ...rest } = useTheme();

  const transitionSetTheme = (theme: string) => {
    startThemeTransition(() => setTheme(theme));
  };

  return { setTheme: transitionSetTheme, ...rest };
}
