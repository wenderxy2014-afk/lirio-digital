-- Tabela de likes para devocionais/pérolas do pastor
CREATE TABLE IF NOT EXISTS devotional_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  devotional_id UUID NOT NULL REFERENCES devotionals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(devotional_id, user_id)
);

-- Tabela de comentários para devocionais/pérolas do pastor
CREATE TABLE IF NOT EXISTS devotional_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  devotional_id UUID NOT NULL REFERENCES devotionals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_devotional_likes_devotional ON devotional_likes(devotional_id);
CREATE INDEX IF NOT EXISTS idx_devotional_likes_user ON devotional_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_devotional_comments_devotional ON devotional_comments(devotional_id);
CREATE INDEX IF NOT EXISTS idx_devotional_comments_created ON devotional_comments(created_at DESC);

-- RLS Policies para likes
ALTER TABLE devotional_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver todos os likes" ON devotional_likes
  FOR SELECT USING (true);

CREATE POLICY "Usuários autenticados podem dar like" ON devotional_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem remover próprio like" ON devotional_likes
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies para comentários
ALTER TABLE devotional_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver todos os comentários" ON devotional_comments
  FOR SELECT USING (true);

CREATE POLICY "Usuários autenticados podem comentar" ON devotional_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem editar próprios comentários" ON devotional_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar próprios comentários" ON devotional_comments
  FOR DELETE USING (auth.uid() = user_id);

-- View para contar likes por devocional
CREATE OR REPLACE VIEW devotional_likes_count AS
SELECT 
  devotional_id,
  COUNT(*) as likes_count
FROM devotional_likes
GROUP BY devotional_id;
