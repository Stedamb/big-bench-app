import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { randomUUID } from "expo-crypto";
import { supabase } from "./supabase";
import { useAuth } from "../contexts/AuthContext";

export interface GuestbookPost {
  id: string;
  user_id: string;
  bench_id: number;
  content: string | null;
  rating: number | null;
  created_at: string;
  profiles: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
  benches: {
    name: string;
    location: string;
    lat: number;
    lng: number;
  } | null;
  community_post_images: {
    id: string;
    image_url: string;
  }[];
}

export interface PickedImage {
  uri: string;
  mimeType: string | null;
}

const extForMime = (mime: string | null): string => {
  switch (mime) {
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    default:
      return "jpg";
  }
};

// Ported from src/hooks/useGuestbook.ts. Web File objects become picker
// assets ({uri, mimeType}); RN has no Blob-from-file, so uploads go through
// fetch(uri) → ArrayBuffer, the Supabase-documented Expo pattern. Order
// preserved from the web fix: images upload BEFORE the post row is inserted,
// so a failed upload can't strand a post that the one-review-per-bench
// unique constraint then makes unrepairable.
export const useGuestbook = (benchId?: number) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: benchId ? ["guestbook-posts", benchId] : ["guestbook-posts"],
    queryFn: async () => {
      let query = supabase
        .from("community_posts")
        .select(
          `
          *,
          profiles:user_id (display_name, avatar_url),
          benches:bench_id (name, location, lat, lng),
          community_post_images (id, image_url)
        `
        )
        .order("created_at", { ascending: false });

      if (benchId) {
        query = query.eq("bench_id", benchId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as GuestbookPost[];
    },
  });

  const uploadImage = async (image: PickedImage) => {
    const contentType = image.mimeType ?? "image/jpeg";
    // expo-crypto instead of crypto.randomUUID — not guaranteed on Hermes.
    const fileName = `${randomUUID()}.${extForMime(image.mimeType)}`;
    const filePath = `community/${fileName}`;

    const arrayBuffer = await fetch(image.uri).then((res) => res.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from("bench-photos")
      .upload(filePath, arrayBuffer, { contentType });

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from("bench-photos").getPublicUrl(filePath);

    return { publicUrl, filePath };
  };

  const createPost = useMutation({
    mutationFn: async ({
      benchId,
      content,
      rating,
      images = [],
    }: {
      benchId: number;
      content?: string;
      rating?: number;
      images?: PickedImage[];
    }) => {
      if (!user) throw new Error("Devi accedere per pubblicare");

      const uploads =
        images.length > 0 ? await Promise.all(images.map(uploadImage)) : [];

      const { data: post, error: postError } = await supabase
        .from("community_posts")
        .insert({
          user_id: user.id,
          bench_id: benchId,
          content,
          rating,
        })
        .select()
        .single();

      if (postError) {
        if (postError.code === "23505") {
          throw new Error("Hai già lasciato una recensione per questa panchina.");
        }
        throw postError;
      }

      if (uploads.length > 0) {
        const imageData = uploads.map(({ publicUrl, filePath }) => ({
          post_id: post.id,
          image_url: publicUrl,
          storage_path: filePath,
        }));

        const { error: imagesError } = await supabase
          .from("community_post_images")
          .insert(imageData);

        if (imagesError) throw imagesError;
      }

      return post;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guestbook-posts"] });
    },
  });

  return { posts, isLoading, createPost };
};
