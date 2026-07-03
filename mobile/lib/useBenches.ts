import { useQuery } from "@tanstack/react-query";
import { supabase } from "./supabase";

export interface StampLocation {
  id: string;
  bench_id: number;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  opening_hours: string | null;
  notes: string | null;
  location_type: string | null;
}

export interface Bench {
  id: number;
  name: string;
  slug: string;
  location: string;
  province: string | null;
  region: string | null;
  country: string;
  lat: number;
  lng: number;
  altitude_m: number | null;
  description: string | null;
  artist: string | null;
  installed_on: string | null;
  is_official: boolean;
  image_url: string | null;
  colors: string[];
  stamp_locations?: StampLocation[];
}

interface BenchColorRow {
  color_hex: string;
  sort_order: number;
}

const flattenColors = (rows: BenchColorRow[] | null | undefined): string[] =>
  (rows ?? []).sort((a, b) => a.sort_order - b.sort_order).map((c) => c.color_hex);

// Ported from src/hooks/useBenches.ts — same queries, same staleTime.
export const useBenches = () => {
  return useQuery({
    queryKey: ["benches"],
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("benches")
        .select("*, bench_colors ( color_hex, sort_order )")
        .order("id");

      if (error) throw error;

      return (data ?? []).map((bench: Record<string, unknown>) => ({
        ...bench,
        colors: flattenColors(bench.bench_colors as BenchColorRow[]),
      })) as Bench[];
    },
  });
};

export const useBench = (id: number | undefined) => {
  return useQuery({
    queryKey: ["bench", id],
    enabled: id != null,
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("benches")
        .select("*, bench_colors ( color_hex, sort_order ), stamp_locations (*)")
        .eq("id", id!)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return {
        ...data,
        colors: flattenColors(data.bench_colors as BenchColorRow[]),
        stamp_locations: data.stamp_locations ?? [],
      } as Bench;
    },
  });
};
