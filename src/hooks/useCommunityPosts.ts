import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface CommunityPost {
  id: string;
  user_id: string;
  bench_id: number;
  content: string | null;
  image_url: string | null;
  rating: number | null;
  created_at: string;
  profiles: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
  benches: {
    name: string;
  } | null;
}

export const useCommunityPosts = (benchId?: number) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: benchId ? ["community-posts", benchId] : ["community-posts"],
    queryFn: async () => {
      let query = supabase
        .from("community_posts")
        .select(`
          *,
          profiles:user_id (display_name, avatar_url),
          benches:bench_id (name)
        `)
        .order("created_at", { ascending: false });

      if (benchId) {
        query = query.eq("bench_id", benchId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CommunityPost[];
    },
  });

  const uploadImage = async (file: File) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `community/${fileName}`;

    const { error: uploadError, data } = await supabase.storage
      .from("bench-photos")
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("bench-photos")
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const createPost = useMutation({
    mutationFn: async ({
      benchId,
      content,
      rating,
      imageFile,
    }: {
      benchId: number;
      content?: string;
      rating?: number;
      imageFile?: File;
    }) => {
      if (!user) throw new Error("Must be logged in to post");

      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const { data, error } = await supabase.from("community_posts").insert({
        user_id: user.id,
        bench_id: benchId,
        content,
        rating,
        image_url: imageUrl,
      }).select().single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
      toast.success("Post pubblicato con successo!");
    },
    onError: (error: any) => {
      toast.error("Errore durante la pubblicazione: " + error.message);
    },
  });

  return {
    posts,
    isLoading,
    createPost,
  };
};
