-- Fix: avatar path takeover. The previous "Authenticated users can upload
-- photos" policy only checked auth.role() = 'authenticated', not ownership of
-- the target path, while avatars live at the guessable path
-- avatars/{user_id}.<ext>. Any authenticated user could upload to another
-- user's avatar path first, permanently blocking the victim's own upload and
-- controlling the image shown as their avatar. Avatars now live at
-- avatars/{user_id}/avatar.<ext> and uploads to that prefix are scoped to the
-- owning user; the community/ prefix (guestbook photos) remains open to any
-- authenticated user since those objects aren't tied to a specific identity.
DROP POLICY IF EXISTS "Authenticated users can upload photos" ON storage.objects;

CREATE POLICY "Users can upload their own avatar or community photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'bench-photos'
    AND auth.role() = 'authenticated'
    AND (
      (storage.foldername(name))[1] = 'community'
      OR (
        (storage.foldername(name))[1] = 'avatars'
        AND (storage.foldername(name))[2] = auth.uid()::text
      )
    )
  );

-- Restrict the public bucket to reasonably sized images and safe MIME types.
-- Previously unrestricted, so the client's 2MB check was trivially bypassable
-- with the anon key, and script-bearing SVGs could be uploaded.
UPDATE storage.buckets
SET file_size_limit = 5242880, -- 5MB
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
WHERE id = 'bench-photos';

-- Fix: likes/comments policies had no USING clause, so FOR ALL ... WITH CHECK
-- only gated inserts. Without USING, nobody could unlike a post or delete
-- their own comment (WITH CHECK is not evaluated for SELECT/DELETE and old
-- rows are unrestricted for UPDATE without USING, which Postgres treats as
-- always-false for existing-row visibility on FOR ALL policies).
DROP POLICY IF EXISTS "Authenticated users can toggle their own likes" ON public.community_post_likes;
CREATE POLICY "Authenticated users can toggle their own likes"
  ON public.community_post_likes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users can manage their own comments" ON public.community_post_comments;
CREATE POLICY "Authenticated users can manage their own comments"
  ON public.community_post_comments FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Data integrity: visited_benches.bench_id had no FK to benches, and free-text
-- columns had no length limits, leaving both open to API-level abuse.
ALTER TABLE public.visited_benches
  ADD CONSTRAINT visited_benches_bench_id_fkey
  FOREIGN KEY (bench_id) REFERENCES public.benches(id) ON DELETE CASCADE;

ALTER TABLE public.community_posts
  ADD CONSTRAINT community_posts_content_length CHECK (char_length(content) <= 2000);

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_bio_length CHECK (char_length(bio) <= 500);

ALTER TABLE public.community_post_comments
  ADD CONSTRAINT community_post_comments_content_length CHECK (char_length(content) <= 1000);
