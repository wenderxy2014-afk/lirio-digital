# Igreja Batista Lírio dos Vales

## Project info

Aplicação web com frontend Vite/React e Edge Functions do Supabase.

## How can I edit this code?

There are several ways of editing your application.

## Desenvolvimento local

O único requisito local é Node.js com npm instalado.

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Supabase e IA

O projeto Supabase usado pelas Edge Functions é `dpxwkuztppsnzktxmnxe`.
Configure estes secrets em **Project Settings > Edge Functions > Secrets**:

```text
OPENAI_API_KEY
SERVICE_ROLE_KEY
ANON_KEY
```

`SERVICE_ROLE_KEY` é usado apenas no backend para operações administrativas. `ANON_KEY` é usado somente pelo `banner-image` para validar o usuário autenticado. A URL vem do secret padrão `SUPABASE_URL`.

As funções de IA são `ebd-devotional`, `kids-daily` e `banner-image`, usando a API oficial da OpenAI.

## Deploy das funções

```sh
npx supabase link --project-ref dpxwkuztppsnzktxmnxe
npx supabase db push
npx supabase functions deploy ebd-devotional
npx supabase functions deploy kids-daily
npx supabase functions deploy banner-image
```

## Deploy do frontend

```sh
npm run build
```
