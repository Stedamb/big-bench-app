import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const LOCAL_KEY = "bigbench-visited";

const readLocal = (): number[] => {
  const saved = localStorage.getItem(LOCAL_KEY);
  return saved ? JSON.parse(saved) : [];
};

export const useVisitedBenches = () => {
  const { user } = useAuth();
  const [visitedIds, setVisitedIds] = useState<number[]>(() => readLocal());
  const [loading, setLoading] = useState(false);

  // Load from cloud when user logs in; merge local into cloud once
  useEffect(() => {
    if (!user) {
      setVisitedIds(readLocal());
      return;
    }

    let cancelled = false;
    const sync = async () => {
      setLoading(true);
      const local = readLocal();

      const { data, error } = await supabase
        .from("visited_benches")
        .select("bench_id")
        .eq("user_id", user.id);

      if (error || cancelled) {
        setLoading(false);
        return;
      }

      const cloudIds = data.map((r) => r.bench_id);
      const toUpload = local.filter((id) => !cloudIds.includes(id));
      if (toUpload.length > 0) {
        await supabase.from("visited_benches").insert(
          toUpload.map((bench_id) => ({ user_id: user.id, bench_id }))
        );
        // Clear local once merged
        localStorage.removeItem(LOCAL_KEY);
      }

      const merged = Array.from(new Set([...cloudIds, ...local]));
      setVisitedIds(merged);
      setLoading(false);
    };

    sync();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const toggleVisited = useCallback(
    async (id: number) => {
      const isVisited = visitedIds.includes(id);
      const next = isVisited ? visitedIds.filter((v) => v !== id) : [...visitedIds, id];
      setVisitedIds(next);

      if (user) {
        if (isVisited) {
          await supabase
            .from("visited_benches")
            .delete()
            .eq("user_id", user.id)
            .eq("bench_id", id);
        } else {
          await supabase
            .from("visited_benches")
            .insert({ user_id: user.id, bench_id: id });
        }
      } else {
        localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
      }
    },
    [user, visitedIds]
  );

  return { visitedIds, toggleVisited, loading };
};
