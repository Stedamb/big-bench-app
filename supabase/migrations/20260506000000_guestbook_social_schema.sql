-- Enforce one review per user per bench
ALTER TABLE public.community_posts 
ADD CONSTRAINT unique_user_bench_post UNIQUE (user_id, bench_id);

-- Background social tables for future use
CREATE TABLE IF NOT EXISTS public.community_post_likes (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, post_id)
);

CREATE TABLE IF NOT EXISTS public.community_post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.community_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_post_comments ENABLE ROW LEVEL SECURITY;

-- Policies for likes
CREATE POLICY "Likes are viewable by everyone" 
  ON public.community_post_likes FOR SELECT USING (true);

CREATE POLICY "Authenticated users can toggle their own likes" 
  ON public.community_post_likes FOR ALL 
  WITH CHECK (auth.uid() = user_id);

-- Policies for comments
CREATE POLICY "Comments are viewable by everyone" 
  ON public.community_post_comments FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage their own comments" 
  ON public.community_post_comments FOR ALL 
  WITH CHECK (auth.uid() = user_id);
