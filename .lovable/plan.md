
# Plano de Implementação: Sistema Administrativo Completo com Segurança e CMS

## Visão Geral

Este plano implementa um sistema administrativo robusto e seguro com as seguintes funcionalidades:

1. **Autenticação Segura de Administrador** - Modal de login melhorado com recuperação de senha
2. **Setup Inicial (First-Time)** - Tela de configuração para criar o primeiro Super Admin
3. **Gerenciamento de Usuários e Permissões (RBAC)** - Sistema completo de controle de acesso baseado em roles
4. **CMS da Home Page** - Interface para editar todo o conteúdo da página inicial
5. **Automação de Devocionais** - Interface dedicada para geração de conteúdo via IA

---

## Análise da Situação Atual

### O que já existe:
- ✅ Sistema de autenticação básico com Supabase
- ✅ Tabela `user_roles` com enum `app_role` (admin, editor, member)
- ✅ Funções de segurança `has_role()` e `has_any_role()`
- ✅ Modal `AdminLoginDialog` básico
- ✅ Painel administrativo com CRUD para conteúdo (eventos, células, etc.)
- ✅ Geração automática de devocionais via edge function com Lovable AI
- ✅ Tabela `site_settings` para configurações globais

### O que precisa ser implementado:
- ❌ Recuperação de senha
- ❌ Detecção e setup do primeiro administrador
- ❌ Interface de gerenciamento de usuários administrativos
- ❌ Sistema de permissões granulares (definir quais páginas/módulos cada usuário pode acessar)
- ❌ CMS completo para edição da Home Page (textos, imagens, banners)
- ❌ Upload e gerenciamento de imagens via Storage
- ❌ Interface dedicada para geração de devocionais via IA

---

## Parte 1: Autenticação e Segurança

### 1.1 Recuperação de Senha

**Modificações no Modal de Login (`AdminLoginDialog.tsx`):**

Adicionar link "Esqueci minha senha" que abre um formulário de recuperação dentro do mesmo modal, alterando entre estados (login/resetPassword).

**Fluxo:**
1. Usuário clica em "Esqueci minha senha"
2. Modal muda para exibir campo de e-mail
3. Ao enviar, chamar `supabase.auth.resetPasswordForEmail()`
4. Supabase envia e-mail com link de redefinição
5. Após redefinir, usuário volta ao login

**Configuração necessária:**
- O link de redefinição redirecionará para uma nova rota `/auth/reset-password` que terá um formulário para nova senha
- Precisaremos criar esta página para capturar o token da URL e permitir definir nova senha

### 1.2 Setup Inicial (First-Time)

**Nova Página: `/admin/setup`**

**Lógica de Detecção:**
1. Criar edge function `check-admin-exists` que verifica se existe algum usuário com role `admin` na tabela `user_roles`
2. No `AdminLoginDialog`, antes de mostrar o formulário de login, verificar se existem admins
3. Se não houver nenhum admin, redirecionar para `/admin/setup`

**Funcionalidade da página de Setup:**
1. Formulário para criar primeiro Super Admin:
   - E-mail
   - Senha (com confirmação)
   - Nome completo (opcional, para criar perfil)
2. Ao submeter:
   - Criar usuário via `supabase.auth.signUp()`
   - Inserir role `admin` na tabela `user_roles` usando service role
   - Opcionalmente criar registro na tabela `profiles`
3. Após criação, fazer login automático e redirecionar para `/admin`

**Segurança:**
- Esta rota deve ser acessível apenas quando **não existem admins**
- Adicionar RLS policy ou verificação no backend para prevenir criação não autorizada após o primeiro admin

---

## Parte 2: Gerenciamento de Usuários e Permissões (RBAC)

### 2.1 Nova Tabela: `admin_users`

Criar tabela para armazenar usuários administrativos com suas permissões:

```sql
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(user_id)
);
```

### 2.2 Nova Tabela: `admin_permissions`

Tabela para permissões granulares:

```sql
CREATE TYPE permission_module AS ENUM (
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

CREATE TABLE admin_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  module permission_module NOT NULL,
  can_read BOOLEAN DEFAULT TRUE,
  can_write BOOLEAN DEFAULT FALSE,
  can_delete BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, module)
);
```

**Nota:** Super Admins (role `admin`) têm acesso total a tudo, sem necessidade de verificar permissões. Editores precisam ter permissões específicas definidas.

### 2.3 Nova Página: `/admin/usuarios`

**Funcionalidades:**

**Lista de Usuários:**
- Exibir todos os usuários administrativos (com role `admin` ou `editor`)
- Mostrar: Nome, E-mail, Role, Status (ativo/inativo), Data de criação
- Botões: Editar, Ativar/Desativar, Excluir (apenas para super admins)

**Criar Novo Usuário:**
- Modal/Formulário com:
  - E-mail
  - Nome completo
  - Role (admin ou editor)
  - Se for editor: checkboxes para selecionar módulos/páginas que pode acessar
  - Para cada módulo: opções de Ler, Editar, Excluir

**Fluxo de Criação:**
1. Admin preenche formulário
2. Ao salvar:
   - Gerar senha temporária aleatória
   - Criar usuário via `supabase.auth.admin.createUser()` (usando service role)
   - Inserir role na tabela `user_roles`
   - Se editor: inserir permissões na tabela `admin_permissions`
   - Enviar e-mail com link de "definir senha" (usando função de reset password)

**Editar Usuário:**
- Permitir alterar: Nome, Role, Permissões
- Super admins podem alterar qualquer coisa
- Editores não podem alterar suas próprias permissões

### 2.4 Sistema de Verificação de Permissões

**Criar hook: `usePermissions(module: string)`**

```typescript
// Exemplo de uso
const { canRead, canWrite, canDelete } = usePermissions('events');

if (!canWrite) {
  return <div>Você não tem permissão para editar eventos</div>;
}
```

**Lógica:**
1. Se usuário tem role `admin`: retorna tudo true
2. Se tem role `editor`: busca permissões na tabela `admin_permissions`
3. Se tem role `member` ou não autenticado: retorna tudo false

**Aplicar em:**
- Componentes de interface (mostrar/esconder botões)
- Funções de backend/edge functions (validação server-side)
- RLS policies (segurança no banco)

---

## Parte 3: CMS da Home Page

### 3.1 Nova Tabela: `home_content`

Tabela para armazenar todo o conteúdo editável da home:

```sql
CREATE TABLE home_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section TEXT NOT NULL UNIQUE, -- 'hero', 'cards', 'events', etc.
  content JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);
```

**Estrutura do JSONB para cada seção:**

```json
// section = 'hero'
{
  "title": "Um lugar para pertencer, crescer e servir.",
  "subtitle": "Acompanhe nossos cultos...",
  "welcome_text": "Bem-vindo(a)",
  "show_audio_toggle": true,
  "show_live_stream": true,
  "video_url": "hero-bg.mp4"
}

// section = 'buttons'
{
  "buttons": [
    {"label": "Cultos & Eventos", "link": "/cultos", "icon": "calendar"},
    {"label": "Células", "link": "/celulas", "icon": "users"},
    // ...
  ]
}

// section = 'carousel'
{
  "slides": [
    {"image_url": "storage/banners/familia.png", "alt": "Culto da Família", "order": 1},
    {"image_url": "storage/banners/maturidade.png", "alt": "Cultura da Maturidade", "order": 2}
  ]
}
```

### 3.2 Storage Bucket: `home-images`

Criar bucket no Supabase Storage para upload de imagens:

```sql
-- Configurar bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('home-images', 'home-images', true);

-- RLS para upload (apenas admins/editors)
CREATE POLICY "Admins can upload home images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'home-images' AND
  has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role])
);

-- RLS para leitura (público)
CREATE POLICY "Anyone can view home images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'home-images');

-- RLS para delete (apenas admins/editors)
CREATE POLICY "Admins can delete home images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'home-images' AND
  has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role])
);
```

### 3.3 Nova Página: `/admin/home-cms`

**Estrutura da Interface:**

Tabs/Seções organizadas por partes da home:

**Aba 1: Hero Section**
- Campo texto: Título principal
- Campo texto: Subtítulo
- Campo texto: Texto de boas-vindas
- Toggle: Mostrar botão de áudio
- Toggle: Mostrar transmissão ao vivo
- Upload de vídeo de fundo (ou URL)

**Aba 2: Botões de Ação**
- Lista editável de botões:
  - Texto do botão
  - Link de destino
  - Ícone (seletor dropdown)
  - Ordem de exibição
- Botão para adicionar novo
- Botão para remover/reordenar

**Aba 3: Carrossel de Banners**
- Lista de imagens atuais
- Para cada imagem:
  - Preview da imagem
  - Campo: Texto alternativo (alt)
  - Campo: Ordem
  - Botão: Substituir imagem
  - Botão: Excluir
- Botão: Adicionar novo banner (upload)
- Suporte a drag-and-drop para reordenar

**Aba 4: Textos Gerais**
- Outros textos da página (ex: "Próximos passos", descrições de cards)

**Funcionalidades:**

**Upload de Imagens:**
```typescript
const uploadImage = async (file: File) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = `banners/${fileName}`;
  
  const { data, error } = await supabase.storage
    .from('home-images')
    .upload(filePath, file);
    
  if (error) throw error;
  
  // Retornar URL pública
  const { data: { publicUrl } } = supabase.storage
    .from('home-images')
    .getPublicUrl(filePath);
    
  return publicUrl;
};
```

**Salvar Conteúdo:**
```typescript
const saveSection = async (section: string, content: any) => {
  const { error } = await supabase
    .from('home_content')
    .upsert({
      section,
      content,
      updated_by: user.id
    }, { onConflict: 'section' });
    
  if (error) throw error;
};
```

### 3.4 Modificar `src/pages/Index.tsx`

Substituir valores hard-coded por dados vindos da tabela `home_content`:

```typescript
// Hook personalizado
const useHomeContent = (section: string) => {
  return useQuery({
    queryKey: ['home_content', section],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('home_content')
        .select('content')
        .eq('section', section)
        .single();
      if (error) throw error;
      return data.content;
    }
  });
};

// Usar no componente
const { data: heroContent } = useHomeContent('hero');
const { data: carouselContent } = useHomeContent('carousel');

// Renderizar
<h1>{heroContent?.title || 'Um lugar para pertencer...'}</h1>

// Carrossel dinâmico
{carouselContent?.slides?.map((slide, index) => (
  <CarouselItem key={index}>
    <img src={slide.image_url} alt={slide.alt} />
  </CarouselItem>
))}
```

---

## Parte 4: Automação de Devocionais

### 4.1 Nova Página: `/admin/devocional-ia`

**Interface Dedicada para Geração de Devocionais:**

**Seção 1: Geração do Devocional do Dia**
- Exibir data de hoje
- Verificar se já existe devocional para hoje
- Se existir: mostrar preview e botão "Regenerar"
- Se não existir: mostrar formulário de geração

**Formulário de Geração:**
- Campo texto: Tema do Dia (ex: "Esperança em tempos difíceis")
- Dropdown: Livro da Bíblia sugerido (opcional)
- Dropdown: Tom do devocional (Pastoral, Encorajador, Reflexivo, etc.)
- Slider: Tamanho do texto (Curto: 800 chars, Médio: 1200 chars, Longo: 1500 chars)
- Botão: "Gerar Devocional"

**Processo de Geração:**
1. Ao clicar em "Gerar", fazer chamada para edge function `ebd-devotional`
2. Passar parâmetros personalizados:
   ```typescript
   const { data } = await supabase.functions.invoke('ebd-devotional', {
     body: {
       theme: "Esperança em tempos difíceis",
       bible_book: "Salmos",
       tone: "Encorajador",
       length: 1200
     }
   });
   ```
3. Edge function usa esses parâmetros no prompt para IA
4. Após geração, exibir preview do resultado
5. Permitir editar antes de publicar
6. Botão "Publicar" que salva no banco

**Seção 2: Histórico de Devocionais**
- Lista dos últimos 30 devocionais gerados
- Para cada um:
  - Data
  - Título
  - Preview do conteúdo
  - Botões: Visualizar, Editar, Excluir

**Seção 3: Configurações de IA**
- Configurar prompts base
- Definir temas/categorias favoritos
- Histórico de uso de créditos Lovable AI

### 4.2 Modificar Edge Function `ebd-devotional`

Aceitar parâmetros opcionais do body da requisição:

```typescript
const { theme, bible_book, tone, length } = await req.json();

const customPrompt = theme 
  ? `Tema de hoje: "${theme}".${bible_book ? ` Use o livro bíblico: ${bible_book}.` : ''}`
  : `O tema de hoje deve ser sobre: "${randomTheme}".`;

const user = `Crie o devocional do dia (${day}).

${customPrompt}

Tom: ${tone || 'Pastoral e encorajador'}.

Regras:
- Retorne APENAS JSON válido.
- Campos: title, bible_reference, body.
- body: ${length || 1200} caracteres aproximadamente.
- Inclua aplicação prática.
- Encerre com oração curta (2-3 linhas).
...`;
```

---

## Parte 5: Melhorias na Navegação Administrativa

### 5.1 Expandir Menu do Painel Admin

Adicionar novos itens no `AdminHome.tsx`:

```tsx
<Card>
  <CardHeader>
    <CardTitle>Gerenciamento</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="grid gap-3">
      <Button asChild variant="outline">
        <NavLink to="/admin/usuarios">
          <Users className="mr-2" />
          Usuários e Permissões
        </NavLink>
      </Button>
      <Button asChild variant="outline">
        <NavLink to="/admin/home-cms">
          <Layout className="mr-2" />
          Editor da Home Page
        </NavLink>
      </Button>
      <Button asChild variant="outline">
        <NavLink to="/admin/devocional-ia">
          <Sparkles className="mr-2" />
          Devocionais com IA
        </NavLink>
      </Button>
    </div>
  </CardContent>
</Card>
```

### 5.2 Breadcrumbs

Adicionar breadcrumbs em todas as páginas admin para facilitar navegação:

```tsx
<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Usuários</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
```

---

## Ordem de Implementação Sugerida

### Sprint 1: Autenticação e Segurança
1. Implementar recuperação de senha no `AdminLoginDialog`
2. Criar página `/auth/reset-password`
3. Criar edge function `check-admin-exists`
4. Criar página `/admin/setup` para primeiro admin
5. Testar fluxo completo de autenticação

### Sprint 2: Gerenciamento de Usuários (RBAC)
1. Criar tabelas `admin_users` e `admin_permissions`
2. Criar página `/admin/usuarios`
3. Implementar criação de novos usuários administrativos
4. Criar hook `usePermissions()`
5. Aplicar verificações de permissões nas páginas existentes
6. Testar criação e edição de usuários com diferentes roles

### Sprint 3: CMS da Home Page
1. Criar tabela `home_content`
2. Configurar Storage bucket `home-images`
3. Criar página `/admin/home-cms` com todas as abas
4. Implementar upload de imagens
5. Modificar `src/pages/Index.tsx` para consumir dados do CMS
6. Popular tabela com conteúdo atual como default
7. Testar edição completa da home

### Sprint 4: Automação de Devocionais
1. Criar página `/admin/devocional-ia`
2. Modificar edge function `ebd-devotional` para aceitar parâmetros
3. Implementar interface de geração customizada
4. Implementar preview e edição antes de publicar
5. Adicionar histórico e gerenciamento
6. Testar geração com diferentes temas

### Sprint 5: Melhorias Finais
1. Adicionar novos cards no `AdminHome`
2. Implementar breadcrumbs
3. Melhorar feedback visual (toasts, loading states)
4. Adicionar logs de auditoria (quem editou o quê e quando)
5. Documentação interna para administradores
6. Testes finais de segurança

---

## Detalhes Técnicos Importantes

### Segurança

**RLS Policies:**
- Todas as novas tabelas devem ter RLS habilitado
- Usar funções `has_role()` e `has_any_role()` nas policies
- Validar permissões tanto no frontend quanto no backend

**Validação de Dados:**
- Usar Zod para validar todos os inputs de formulários
- Sanitizar conteúdo HTML antes de salvar (se permitir rich text)
- Validar tamanhos de arquivos no upload (limite: 5MB por imagem)

**Auditoria:**
- Registrar `updated_by` em todas as tabelas editáveis
- Opcional: criar tabela `audit_log` para rastrear todas as alterações

### Performance

**Otimização de Queries:**
- Usar `.select()` específico em vez de `*` quando possível
- Implementar paginação na lista de usuários (se crescer muito)
- Cache de conteúdo da home com React Query

**Upload de Imagens:**
- Comprimir imagens antes do upload (usar biblioteca como `browser-image-compression`)
- Gerar thumbnails automáticos se necessário
- Limitar formatos aceitos: JPG, PNG, WebP

### UX/UI

**Feedback Visual:**
- Loading spinners durante requisições
- Toasts de sucesso/erro claros
- Confirmação antes de deletar (confirm dialogs)
- Preview de imagens antes de salvar

**Responsividade:**
- Todas as páginas admin devem funcionar bem em tablets
- Priorizar desktop, mas garantir usabilidade mobile

**Acessibilidade:**
- Labels claros em todos os campos
- Mensagens de erro descritivas
- Navegação por teclado funcional

---

## Estrutura de Arquivos Criados/Modificados

### Novos Arquivos

```
src/
  pages/
    admin/
      Setup.tsx                    # Setup inicial do primeiro admin
      Users.tsx                    # Gerenciamento de usuários
      HomeCMS.tsx                  # Editor da Home Page
      DevotionalAI.tsx             # Interface de devocionais com IA
    auth/
      ResetPassword.tsx            # Página de redefinir senha
  hooks/
    usePermissions.ts              # Hook de verificação de permissões
  components/
    admin/
      ImageUploader.tsx            # Componente de upload de imagens
      PermissionsEditor.tsx        # Editor de permissões granulares
      CarouselEditor.tsx           # Editor de carrossel de banners

supabase/
  functions/
    check-admin-exists/
      index.ts                     # Verifica se existe algum admin
    create-admin-user/
      index.ts                     # Cria novo usuário admin
```

### Arquivos Modificados

```
src/
  components/
    site/
      AdminLoginDialog.tsx         # + Recuperação de senha
  pages/
    Index.tsx                      # Consumir dados do CMS
    admin/
      AdminHome.tsx                # + Novos cards de navegação
  App.tsx                          # + Novas rotas

supabase/
  functions/
    ebd-devotional/
      index.ts                     # + Parâmetros customizáveis
```

---

## Migrações do Banco de Dados

### Migration 1: Tabelas de Gerenciamento

```sql
-- admin_users
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(user_id)
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all admin users"
ON admin_users FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Editors can view admin users"
ON admin_users FOR SELECT
TO authenticated
USING (has_any_role(auth.uid(), ARRAY['admin', 'editor']));

-- admin_permissions
CREATE TYPE permission_module AS ENUM (
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

CREATE TABLE admin_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  module permission_module NOT NULL,
  can_read BOOLEAN DEFAULT TRUE,
  can_write BOOLEAN DEFAULT FALSE,
  can_delete BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, module)
);

ALTER TABLE admin_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all permissions"
ON admin_permissions FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own permissions"
ON admin_permissions FOR SELECT
TO authenticated
USING (user_id = auth.uid());
```

### Migration 2: CMS da Home

```sql
-- home_content
CREATE TABLE home_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section TEXT NOT NULL UNIQUE,
  content JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

ALTER TABLE home_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view home content"
ON home_content FOR SELECT
TO public
USING (true);

CREATE POLICY "Admins/editors can manage home content"
ON home_content FOR ALL
TO authenticated
USING (has_any_role(auth.uid(), ARRAY['admin', 'editor']))
WITH CHECK (has_any_role(auth.uid(), ARRAY['admin', 'editor']));

-- Trigger para atualizar updated_at
CREATE TRIGGER update_home_content_updated_at
BEFORE UPDATE ON home_content
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Popular com dados iniciais
INSERT INTO home_content (section, content) VALUES
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
    {"image_url": "/assets/banner-familia.png", "alt": "Culto da Família", "order": 1},
    {"image_url": "/assets/banner-maturidade.png", "alt": "Cultura da Maturidade", "order": 2},
    {"image_url": "/assets/banner-homens.png", "alt": "Culto da Rede de Homens", "order": 3},
    {"image_url": "/assets/banner-ceia.png", "alt": "A Ceia do Senhor", "order": 4}
  ]
}'::jsonb);
```

### Migration 3: Storage Bucket

```sql
-- Criar bucket (executar via Supabase Dashboard ou edge function)
INSERT INTO storage.buckets (id, name, public)
VALUES ('home-images', 'home-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policies
CREATE POLICY "Admins can upload home images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'home-images' AND
  has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role])
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
  has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role])
);
```

---

## Considerações de Usabilidade

### Para Administradores

**Fluxo Simplificado:**
1. Login via modal seguro
2. Dashboard centralizado com cards intuitivos
3. Navegação por breadcrumbs
4. Feedback imediato em todas as ações

**Gerenciamento de Usuários:**
- Interface clara para adicionar/editar usuários
- Checkbox visual para permissões (não precisa entender código)
- Indicadores de status (ativo/inativo)

**Editor da Home:**
- Preview em tempo real (se possível)
- Drag-and-drop para reordenar
- Validação de campos antes de salvar

**Geração de Devocionais:**
- Interface amigável com campos claros
- Preview antes de publicar
- Histórico para referência

### Para Desenvolvedores

**Código Limpo:**
- Componentes reutilizáveis
- Hooks personalizados para lógica comum
- Tipos TypeScript bem definidos

**Manutenibilidade:**
- Comentários em partes complexas
- Separação clara entre lógica e UI
- Testes unitários para hooks críticos (opcional)

---

## Riscos e Mitigações

### Risco 1: Perda de Acesso Admin
**Problema:** Se único admin esquecer senha e e-mail não funcionar

**Mitigação:**
- Sempre ter pelo menos 2 super admins
- Documentar procedimento de recuperação via Supabase Dashboard
- Manter backup de credenciais em local seguro

### Risco 2: Upload de Imagens Muito Grandes
**Problema:** Lentidão no site por imagens pesadas

**Mitigação:**
- Limitar tamanho de upload (5MB)
- Comprimir imagens automaticamente no frontend
- Validar dimensões recomendadas (ex: 1920x1080 para banners)

### Risco 3: Conflitos de Conteúdo
**Problema:** Dois admins editando a mesma seção ao mesmo tempo

**Mitigação:**
- Indicar quem está editando cada seção (opcional, complexo)
- Sistema de "última gravação ganha" com timestamp
- Notificar quando conteúdo foi alterado recentemente

### Risco 4: Sobrecarga de Créditos Lovable AI
**Problema:** Geração excessiva de devocionais consumindo créditos

**Mitigação:**
- Limitar gerações por dia (ex: máximo 5)
- Exibir contador de créditos restantes
- Alertar quando próximo do limite

---

## Checklist de Conclusão

### Fase 1: Autenticação
- [ ] Recuperação de senha funcionando
- [ ] Setup inicial para primeiro admin testado
- [ ] E-mails de reset sendo enviados corretamente

### Fase 2: Gerenciamento
- [ ] Criação de novos usuários funcionando
- [ ] Sistema de permissões aplicado
- [ ] Edição de usuários sem bugs
- [ ] Verificações de segurança no backend

### Fase 3: CMS
- [ ] Upload de imagens funcionando
- [ ] Edição de textos salvando corretamente
- [ ] Carrossel dinâmico renderizando
- [ ] Preview visual conforme esperado

### Fase 4: Devocionais
- [ ] Geração com tema customizado funcionando
- [ ] Preview e edição antes de publicar
- [ ] Histórico acessível
- [ ] Integração com Lovable AI estável

### Fase 5: Testes Finais
- [ ] Navegação entre todas as páginas fluida
- [ ] Responsividade em mobile/tablet OK
- [ ] Mensagens de erro claras
- [ ] Performance aceitável
- [ ] Segurança validada (RLS, permissões)

---

## Resumo Executivo

Este plano implementa um sistema administrativo completo e profissional, com:

✅ **Segurança robusta:** Autenticação, recuperação de senha, setup inicial protegido

✅ **Controle granular:** RBAC com permissões por módulo para cada usuário

✅ **Flexibilidade total:** CMS completo para editar toda a home sem tocar no código

✅ **Automação inteligente:** Geração de devocionais com IA customizável

✅ **Usabilidade:** Interface intuitiva para administradores não-técnicos

O sistema é escalável, seguro e fácil de usar, permitindo que a igreja tenha controle total sobre seu site sem depender de desenvolvedores para tarefas cotidianas.
