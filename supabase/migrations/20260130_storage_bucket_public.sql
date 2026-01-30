-- Migration: Configurar bucket de imagens da home com acesso público
-- Data: 2026-01-30

-- Criar o bucket se não existir (ignorar se já existir)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'home-images',
  'home-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "home_images_public_read" ON storage.objects;
DROP POLICY IF EXISTS "home_images_authenticated_upload" ON storage.objects;
DROP POLICY IF EXISTS "home_images_authenticated_delete" ON storage.objects;

-- Política: Qualquer pessoa pode ler imagens do bucket home-images
CREATE POLICY "home_images_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'home-images');

-- Política: Usuários autenticados podem fazer upload
CREATE POLICY "home_images_authenticated_upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'home-images');

-- Política: Usuários autenticados podem atualizar
CREATE POLICY "home_images_authenticated_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'home-images');

-- Política: Usuários autenticados podem deletar
CREATE POLICY "home_images_authenticated_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'home-images');
