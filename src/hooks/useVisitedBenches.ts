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

      if (cancelled) return;
      if (error) {
        setLoading(false);
        return;
      }

      const cloudIds = data.map((r) => r.bench_id);
      const toUpload = local.filter((id) => !cloudIds.includes(id));
      if (toUpload.length > 0) {
        const { error: uploadError } = await supabase.from("visited_benches").upsert(
          toUpload.map((bench_id) => ({ user_id: user.id, bench_id })),
          { onConflict: "user_id,bench_id" }
        );
        if (cancelled) return;
        // Only clear local once the merge is confirmed persisted, so a
        // failed/partial upload never silently destroys guest visit history.
        if (!uploadError) {
          localStorage.removeItem(LOCAL_KEY);
        }
      }

      const merged = Array.from(new Set([...cloudIds, ...local]));
      if (cancelled) return;
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
      // Compute isVisited and next state atomically via functional updater
      // so we never read a stale closure value of visitedIds.
      let isVisited = false;
      let next: number[] = [];
      setVisitedIds((prev) => {
        isVisited = prev.includes(id);
        next = isVisited ? prev.filter((v) => v !== id) : [...prev, id];
        return next;
      });

      if (user) {
        const { error } = isVisited
          ? await supabase
              .from("visited_benches")
              .delete()
              .eq("user_id", user.id)
              .eq("bench_id", id)
          : await supabase
              .from("visited_benches")
              .insert({ user_id: user.id, bench_id: id });

        if (error) {
          // Roll back the optimistic update so UI and DB don't silently diverge.
          setVisitedIds((prev) =>
            isVisited ? [...prev, id] : prev.filter((v) => v !== id)
          );
        }
      } else {
        // next is set synchronously inside setVisitedIds updater above
        localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
      }
    },
    [user]
  );

  return { visitedIds, toggleVisited, loading };
};
