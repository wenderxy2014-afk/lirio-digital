# Plano: Migração Autenticação Membros (Enuves)

Migrar o sistema de autenticação interno (Supabase) para o portal externo Enuves, conforme solicitação do usuário.

## 👥 Objetivos
- Atualizar o componente `MemberAuthDialog` para exibir apenas dois botões de redirecionamento.
- Adicionar a logo da igreja como marca d'água/fundo no modal.
- Remover lógica de autenticação do Supabase que não será mais utilizada nesta área.

## 🛠️ Alterações Sugeridas

### 1. Modificar `src/components/site/MemberAuthDialog.tsx`
- **Remover**: Estados `mode`, `form`, `loading`.
- **Remover**: Função `submit` e importações do `supabase`, `authSchema`, `useToast`.
- **Adicionar**: Importação da logo (`import logo from "@/assets/iblv-logo.png"`).
- **Layout**: 
    - Container centralizado com os dois botões (`Fazer Login` e `Fazer Cadastro`).
    - Estilização premium com a logo no fundo (opacidade baixa ou marca d'água).

#### Links de Destino:
- **Login**: `https://app.enuves.com/authentication/login?returnUrl=%2Fdashboard%2Foverview`
- **Cadastro**: `https://app.enuves.com/institutions/92340/people/register`

## 🚀 Tarefas

- [ ] Criar backup/backup mental do comportamento atual.
- [ ] Implementar novo layout no `MemberAuthDialog.tsx`.
- [ ] Verificar responsividade no `SiteHeader.tsx`.
- [ ] Testar links em nova aba (`target="_blank"`).

## 📋 Critérios de Sucesso
- [ ] Clique em "Membros" abre o modal.
- [ ] Modal exibe os dois botões e a logo ao fundo.
- [ ] Botões levam aos links do Enuves corretamente.
