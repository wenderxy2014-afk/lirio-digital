-- Public likes + comments (no login)

-- Likes
CREATE TABLE IF NOT EXISTS public.devotional_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  devotional_id uuid NOT NULL REFERENCES public.devotionals(id) ON DELETE CASCADE,
  visitor_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS devotional_likes_unique_visitor
  ON public.devotional_likes (devotional_id, visitor_id);

ALTER TABLE public.devotional_likes ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Public can read devotional likes"
  ON public.devotional_likes
  FOR SELECT
  USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can like devotionals"
  ON public.devotional_likes
  FOR INSERT
  WITH CHECK (
    devotional_id IS NOT NULL
    AND visitor_id IS NOT NULL
    AND btrim(visitor_id) <> ''
    AND char_length(visitor_id) <= 80
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Note: no DELETE policy by design (prevents abuse without auth)


-- Comments
CREATE TABLE IF NOT EXISTS public.devotional_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  devotional_id uuid NOT NULL REFERENCES public.devotionals(id) ON DELETE CASCADE,
  visitor_id text NOT NULL,
  author_name text NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS devotional_comments_devotional_id_idx
  ON public.devotional_comments (devotional_id, created_at DESC);

ALTER TABLE public.devotional_comments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Public can read devotional comments"
  ON public.devotional_comments
  FOR SELECT
  USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can comment"
  ON public.devotional_comments
  FOR INSERT
  WITH CHECK (
    devotional_id IS NOT NULL
    AND visitor_id IS NOT NULL
    AND btrim(visitor_id) <> ''
    AND char_length(visitor_id) <= 80
    AND content IS NOT NULL
    AND btrim(content) <> ''
    AND char_length(content) <= 2000
    AND (author_name IS NULL OR char_length(author_name) <= 60)
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;