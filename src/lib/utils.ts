import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseLocalDate(dateStr: string): Date {
  if (dateStr.includes("T")) return new Date(dateStr);
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}
