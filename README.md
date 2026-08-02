# Platformă SaaS — Asociații de Locatari

Aplicație pentru digitalizarea administrării cheltuielilor lunare,
comunicării locatar ↔ administrator și gestionării sesizărilor într-un bloc.

Stack: Next.js 16 (App Router) · TypeScript strict · Tailwind CSS v4 ·
Supabase (PostgreSQL, Auth, Storage) · Vitest.

Documentație:

- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — arhitectura aplicației (Clean Architecture, RBAC, securitate)
- [`docs/DATABASE.md`](./docs/DATABASE.md) — schema bazei de date și RLS
- [`docs/PLAN.md`](./docs/PLAN.md) — planul de implementare pe etape și stadiul curent

## Configurare locală

1. Creează un proiect [Supabase](https://supabase.com) (sau folosește Supabase CLI local).
2. Copiază `.env.example` în `.env.local` și completează cheile din
   Project Settings → API.
3. Aplică schema bazei de date: rulează conținutul din
   `supabase/migrations/0001_init_schema.sql` în SQL Editor-ul Supabase,
   sau, cu [Supabase CLI](https://supabase.com/docs/guides/cli) instalat:

   ```bash
   supabase link --project-ref <project-ref>
   supabase db push
   ```

4. Instalează dependențele și pornește serverul de dezvoltare:

   ```bash
   npm install
   npm run dev
   ```

   Aplicația rulează pe [http://localhost:3000](http://localhost:3000).

## Scripturi

```bash
npm run dev      # server de dezvoltare
npm run build    # build de producție
npm run lint     # ESLint
npm run test     # teste unitare (Vitest)
```

## Stadiul curent

Vezi [`docs/PLAN.md`](./docs/PLAN.md). ETAPA 1 (fundație: proiect, schema
bazei de date, autentificare, roluri) este implementată.
