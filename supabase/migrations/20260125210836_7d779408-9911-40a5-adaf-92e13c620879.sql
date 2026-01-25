-- Migration 1: Admin Users and Permissions Tables

-- Create admin_users table
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  full_name TEXT,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  is_active BOOLEAN DEFAULT TRUE
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all admin users"
ON public.admin_users FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Editors can view admin users"
ON public.admin_users FOR SELECT
TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role]));

-- Create permission_module enum
DO $$ BEGIN
  CREATE TYPE public.permission_module AS ENUM (
    'home_cms',
    'events',
    'cells',
    'devotionals',
    'studies',
    'missions',
    'departments',
    'kids',
    'testimonials',
    'ebd_daily',
    'settings',
    'users'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create admin_permissions table
CREATE TABLE IF NOT EXISTS public.admin_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  module permission_module NOT NULL,
  can_read BOOLEAN DEFAULT TRUE,
  can_write BOOLEAN DEFAULT FALSE,
  can_delete BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, module)
);

ALTER TABLE public.admin_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all permissions"
ON public.admin_permissions FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view own permissions"
ON public.admin_permissions FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Migration 2: Home Content CMS Table

-- Create home_content table
CREATE TABLE IF NOT EXISTS public.home_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section TEXT NOT NULL UNIQUE,
  content JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID
);

ALTER TABLE public.home_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view home content"
ON public.home_content FOR SELECT
TO public
USING (true);

CREATE POLICY "Admins/editors can manage home content"
ON public.home_content FOR ALL
TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role]))
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role]));

-- Trigger for updated_at
CREATE TRIGGER update_home_content_updated_at
BEFORE UPDATE ON public.home_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default home content
INSERT INTO public.home_content (section, content) VALUES
('hero', '{
  "title": "Um lugar para pertencer, crescer e servir.",
  "subtitle": "Acompanhe nossos cultos e eventos, encontre uma célula perto de você e participe da vida da igreja.",
  "welcome_text": "Bem-vindo(a)",
  "show_audio_toggle": true,
  "show_live_stream": true,
  "video_url": "hero-bg.mp4"
}'::jsonb),
('carousel', '{
  "slides": [
    {"image_url": "/src/assets/banner-familia.png", "alt": "Culto da Família", "order": 1},
    {"image_url": "/src/assets/banner-maturidade.png", "alt": "Cultura da Maturidade", "order": 2},
    {"image_url": "/src/assets/banner-homens.png", "alt": "Culto da Rede de Homens", "order": 3},
    {"image_url": "/src/assets/banner-ceia.png", "alt": "A Ceia do Senhor", "order": 4}
  ]
}'::jsonb)
ON CONFLICT (section) DO NOTHING;

-- Migration 3: Storage Bucket for Home Images

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('home-images', 'home-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Admins can upload home images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'home-images' AND
  public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role])
);

CREATE POLICY "Anyone can view home images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'home-images');

CREATE POLICY "Admins can delete home images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'home-images' AND
  public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role])
);

CREATE POLICY "Admins can update home images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'home-images' AND
  public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role])
);