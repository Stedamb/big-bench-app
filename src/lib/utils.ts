import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/;

export function parseLocalDate(dateStr: string): Date {
  if (DATE_ONLY_RE.test(dateStr)) {
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) {
      throw new Error(`Invalid date: ${dateStr}`);
    }
    return date;
  }

  if (dateStr.includes("T")) {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid datetime: ${dateStr}`);
    }
    return date;
  }

  throw new Error(`Unsupported date format: ${dateStr}. Expected YYYY-MM-DD or ISO datetime.`);
}

export const regionTranslation: Record<string, string> = {
  "Piedmont": "Piemonte",
  "Lombardy": "Lombardia",
  "Tuscany": "Toscana",
  "Sicily": "Sicilia",
  "Sardinia": "Sardegna",
  "Apulia": "Puglia",
  "Aosta Valley": "Valle d'Aosta",
  "Marche": "Marche",
  "Basilicata": "Basilicata",
  "Abruzzo": "Abruzzo",
  "Friuli-Venezia Giulia": "Friuli-Venezia Giulia",
  "Trentino-Alto Adige": "Trentino-Alto Adige",
  "Lazio": "Lazio",
  "Molise": "Molise",
  "Umbria": "Umbria",
  "Veneto": "Veneto",
  "Liguria": "Liguria",
  "Calabria": "Calabria",
  "Emilia-Romagna": "Emilia-Romagna",
  "Campania": "Campania",
};

export const translateRegion = (region: string) => regionTranslation[region] || region;
