-- Kids daily AI-generated content
CREATE TABLE IF NOT EXISTS public.kids_daily_contents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  day TEXT NOT NULL,
  title TEXT NOT NULL,
  bible_reference TEXT,
  lesson_body TEXT NOT NULL,
  activity TEXT NOT NULL,
  quiz JSONB NOT NULL DEFAULT '[]'::jsonb,
  model TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT kids_daily_contents_day_unique UNIQUE (day)
);

CREATE INDEX IF NOT EXISTS idx_kids_daily_contents_day ON public.kids_daily_contents(day);

ALTER TABLE public.kids_daily_contents ENABLE ROW LEVEL SECURITY;

-- Public can read (page /kids is public)
DO $$ BEGIN
  CREATE POLICY "Kids daily contents are viewable by everyone"
  ON public.kids_daily_contents
  FOR SELECT
  USING (is_published = true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Admin/editor can manage
DO $$ BEGIN
  CREATE POLICY "Admins and editors can insert kids daily contents"
  ON public.kids_daily_contents
  FOR INSERT
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','editor']::public.app_role[]));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins and editors can update kids daily contents"
  ON public.kids_daily_contents
  FOR UPDATE
  USING (public.has_any_role(auth.uid(), ARRAY['admin','editor']::public.app_role[]));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins and editors can delete kids daily contents"
  ON public.kids_daily_contents
  FOR DELETE
  USING (public.has_any_role(auth.uid(), ARRAY['admin','editor']::public.app_role[]));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- updated_at trigger
DROP TRIGGER IF EXISTS update_kids_daily_contents_updated_at ON public.kids_daily_contents;
CREATE TRIGGER update_kids_daily_contents_updated_at
BEFORE UPDATE ON public.kids_daily_contents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Extensions needed for scheduled function invocation
CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_cron;
