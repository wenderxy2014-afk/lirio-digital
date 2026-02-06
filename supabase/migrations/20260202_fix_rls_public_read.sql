-- Permite SELECT público (anon) na tabela 'ebd_devotionals' para qualquer registro
DROP POLICY IF EXISTS "Public can read ebd" ON ebd_devotionals;
CREATE POLICY "Public can read ebd"
ON ebd_devotionals FOR SELECT
TO anon, authenticated
USING (true);

-- Permite SELECT público (anon) na tabela 'devotionals' (Pérolas) para qualquer registro publicado
DROP POLICY IF EXISTS "Public can read published devotionals" ON devotionals;
CREATE POLICY "Public can read published devotionals"
ON devotionals FOR SELECT
TO anon, authenticated
USING (is_published = true);
