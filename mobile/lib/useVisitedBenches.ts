import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "./supabase";
import { useAuth } from "../contexts/AuthContext";

const LOCAL_KEY = "bigbench-visited";

// Ported from src/hooks/useVisitedBenches.ts, including its data-safety
// behavior: local guest visits are only cleared once the cloud merge is
// confirmed persisted, and optimistic toggles roll back on write failure.
// localStorage (sync) becomes AsyncStorage (async), so local reads move
// inside effects.
const readLocal = async (): Promise<number[]> => {
  const saved = await AsyncStorage.getItem(LOCAL_KEY);
  return saved ? JSON.parse(saved) : [];
};

export const useVisitedBenches = () => {
  const { user } = useAuth();
  const [visitedIds, setVisitedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const sync = async () => {
      setLoading(true);
      const local = await readLocal();
      if (cancelled) return;

      if (!user) {
        setVisitedIds(local);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("visited_benches")
        .select("bench_id")
        .eq("user_id", user.id);

      if (cancelled) return;
      if (error) {
        setLoading(false);
        return;
      }

      const cloudIds = data.map((r: { bench_id: number }) => r.bench_id);
      const toUpload = local.filter((id) => !cloudIds.includes(id));
      if (toUpload.length > 0) {
        const { error: uploadError } = await supabase.from("visited_benches").upsert(
          toUpload.map((bench_id) => ({ user_id: user.id, bench_id })),
          { onConflict: "user_id,bench_id" }
        );
        if (cancelled) return;
        if (!uploadError) {
          await AsyncStorage.removeItem(LOCAL_KEY);
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
          setVisitedIds((prev) =>
            isVisited ? [...prev, id] : prev.filter((v) => v !== id)
          );
        }
      } else {
        await AsyncStorage.setItem(LOCAL_KEY, JSON.stringify(next));
      }
    },
    [user]
  );

  return { visitedIds, toggleVisited, loading };
};
