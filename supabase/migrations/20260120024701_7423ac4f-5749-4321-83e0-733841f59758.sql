-- EBD: devocional diário gerado automaticamente
CREATE TABLE IF NOT EXISTS public.ebd_devotionals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day date NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  bible_reference text,
  model text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS ebd_devotionals_day_uidx ON public.ebd_devotionals(day);

ALTER TABLE public.ebd_devotionals ENABLE ROW LEVEL SECURITY;

-- Public can read the daily devotional
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ebd_devotionals' AND policyname = 'Public can read EBD devotionals'
  ) THEN
    CREATE POLICY "Public can read EBD devotionals"
    ON public.ebd_devotionals
    FOR SELECT
    USING (true);
  END IF;
END $$;

-- Only admin/editor can manage manually (optional)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ebd_devotionals' AND policyname = 'Admin/editor can manage EBD devotionals'
  ) THEN
    CREATE POLICY "Admin/editor can manage EBD devotionals"
    ON public.ebd_devotionals
    FOR ALL
    USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role]))
    WITH CHECK (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role]));
  END IF;
END $$;

-- updated_at trigger helper
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS update_ebd_devotionals_updated_at ON public.ebd_devotionals;
CREATE TRIGGER update_ebd_devotionals_updated_at
BEFORE UPDATE ON public.ebd_devotionals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
