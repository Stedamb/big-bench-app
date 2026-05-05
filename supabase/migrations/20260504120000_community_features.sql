-- Community Posts (reviews and updates)
CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bench_id INTEGER NOT NULL REFERENCES public.benches(id) ON DELETE CASCADE,
  content TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Community Post Images (allows multiple photos per post)
CREATE TABLE IF NOT EXISTS public.community_post_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_post_images ENABLE ROW LEVEL SECURITY;

-- Posts Policies
CREATE POLICY "Community posts are viewable by everyone" 
  ON public.community_posts FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create posts" 
  ON public.community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" 
  ON public.community_posts FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" 
  ON public.community_posts FOR DELETE USING (auth.uid() = user_id);

-- Images Policies
CREATE POLICY "Post images are viewable by everyone" 
  ON public.community_post_images FOR SELECT USING (true);

CREATE POLICY "Users can add images to their own posts" 
  ON public.community_post_images FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.community_posts 
      WHERE id = post_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete images from their own posts" 
  ON public.community_post_images FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.community_posts 
      WHERE id = post_id AND user_id = auth.uid()
    )
  );

-- Storage bucket setup
INSERT INTO storage.buckets (id, name, public) 
VALUES ('bench-photos', 'bench-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
-- Note: 'upsert' requires INSERT + SELECT + UPDATE
CREATE POLICY "Public Access to bench-photos" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'bench-photos');

CREATE POLICY "Authenticated users can upload photos" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'bench-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own photos" 
  ON storage.objects FOR UPDATE 
  USING (bucket_id = 'bench-photos' AND (select auth.uid()) = owner);

CREATE POLICY "Users can delete their own photos" 
  ON storage.objects FOR DELETE 
  USING (bucket_id = 'bench-photos' AND (select auth.uid()) = owner);
