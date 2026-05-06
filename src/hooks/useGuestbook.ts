import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

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
  distance_km?: number;
}

export const useGuestbook = (benchId?: number) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: benchId ? ["guestbook-posts", benchId] : ["guestbook-posts"],
    queryFn: async () => {
      let query = supabase
        .from("community_posts")
        .select(`
          *,
          profiles:user_id (display_name, avatar_url),
          benches:bench_id (name, location, lat, lng),
          community_post_images (id, image_url)
        `)
        .order("created_at", { ascending: false });

      if (benchId) {
        query = query.eq("bench_id", benchId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as any[];
    },
  });

  const uploadImage = async (file: File) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `community/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("bench-photos")
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("bench-photos")
      .getPublicUrl(filePath);

    return { publicUrl, filePath };
  };

  const createPost = useMutation({
    mutationFn: async ({
      benchId,
      content,
      rating,
      imageFiles = [],
    }: {
      benchId: number;
      content?: string;
      rating?: number;
      imageFiles?: File[];
    }) => {
      if (!user) throw new Error("Must be logged in to post");

      // 1. Create the post
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
        if (postError.code === '23505') {
          throw new Error("Hai già lasciato una recensione per questa panchina.");
        }
        throw postError;
      }

      // 2. Upload images and link them
      if (imageFiles.length > 0) {
        const uploadPromises = imageFiles.map(async (file) => {
          const { publicUrl, filePath } = await uploadImage(file);
          return {
            post_id: post.id,
            image_url: publicUrl,
            storage_path: filePath,
          };
        });

        const imageData = await Promise.all(uploadPromises);
        const { error: imagesError } = await supabase
          .from("community_post_images")
          .insert(imageData);

        if (imagesError) throw imagesError;
      }

      return post;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guestbook-posts"] });
      toast.success("Messaggio aggiunto al Guestbook!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Errore durante la pubblicazione");
    },
  });

  return {
    posts: posts as GuestbookPost[],
    isLoading,
    createPost,
  };
};

// Helper for proximity
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
