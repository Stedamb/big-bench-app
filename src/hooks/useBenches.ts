import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  number: number;
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
  source_marker_id: number | null;
  colors?: string[];
  stamp_locations?: StampLocation[];
}

export const useBenches = () => {
  return useQuery({
    queryKey: ["benches"],
    staleTime: 1000 * 60 * 5, // 5 minutes
    queryFn: async () => {
      const { data, error } = await supabase
        .from("benches")
        .select(`
          *,
          bench_colors (
            color_hex,
            sort_order
          )
        `)
        .order("id");

      if (error) throw error;

      return (data || []).map((bench: any) => ({
        ...bench,
        // The migration script stored the bench number in the 'id' field
        // for official benches.
        number: bench.id,
        colors: bench.bench_colors
          ?.sort((a: any, b: any) => a.sort_order - b.sort_order)
          .map((c: any) => c.color_hex) || []
      })) as Bench[];
    },
  });
};

export const useBench = (id: string | undefined) => {
  return useQuery({
    queryKey: ["bench", id],
    enabled: !!id && /^\d+$/.test(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
    queryFn: async () => {
      if (!id || !/^\d+$/.test(id)) return null;
      
      const { data, error } = await supabase
        .from("benches")
        .select(`
          *,
          bench_colors (
            color_hex,
            sort_order
          ),
          stamp_locations (*)
        `)
        .eq("id", parseInt(id, 10))
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      const benchData = data as any;

      return {
        ...benchData,
        number: benchData.id,
        colors: (benchData.bench_colors || [])
          .sort((a: any, b: any) => a.sort_order - b.sort_order)
          .map((c: any) => c.color_hex),
        stamp_locations: (benchData.stamp_locations || [])
      } as Bench;
    },
  });
};
