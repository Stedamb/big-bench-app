-- Community Posts (unified for reviews, photos, and updates)
CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bench_id INTEGER NOT NULL, -- We don't use FK here just in case some benches are WIP and stored differently, but usually it links to 'benches'
  content TEXT,
  image_url TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add Foreign Key if 'benches' table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'benches') THEN
    ALTER TABLE public.community_posts 
    ADD CONSTRAINT fk_community_posts_bench_id 
    FOREIGN KEY (bench_id) REFERENCES public.benches(id) ON DELETE CASCADE;
  END IF;
END $$;

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Community posts are viewable by everyone" 
  ON public.community_posts FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create posts" 
  ON public.community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" 
  ON public.community_posts FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" 
  ON public.community_posts FOR DELETE USING (auth.uid() = user_id);

-- Storage bucket setup
INSERT INTO storage.buckets (id, name, public) 
VALUES ('bench-photos', 'bench-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access to bench-photos" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'bench-photos');

CREATE POLICY "Authenticated users can upload photos" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'bench-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own photos" 
  ON storage.objects FOR DELETE 
  USING (bucket_id = 'bench-photos' AND (select auth.uid()) = owner);
