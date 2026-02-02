-- Permitir user_id nulo para comentários de visitantes
ALTER TABLE devotional_comments ALTER COLUMN user_id DROP NOT NULL;

-- Adicionar campo para nome do visitante
ALTER TABLE devotional_comments ADD COLUMN IF NOT EXISTS guest_name TEXT;

-- Atualizar Policies para permitir anônimos
DROP POLICY IF EXISTS "Usuários autenticados podem comentar" ON devotional_comments;

CREATE POLICY "Qualquer um pode comentar" ON devotional_comments
  FOR INSERT WITH CHECK (true);
