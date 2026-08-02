# Arhitectură — Platformă SaaS Asociații de Locatari

## 1. Viziune

Aplicație multi-tenant pentru administrarea blocurilor: cheltuieli lunare,
comunicare administrator ↔ locatari, sesizări. Tenant-ul de bază este
**blocul**; un administrator poate gestiona mai multe blocuri, un locatar
aparține unui singur apartament la un moment dat.

## 2. Stack tehnic

| Strat | Tehnologie |
|---|---|
| Frontend | Next.js 16 (App Router), TypeScript strict, Tailwind CSS v4 |
| Backend | Next.js Route Handlers (REST) + Server Actions |
| Autentificare | Supabase Auth (email/parolă), sesiune via cookies httpOnly |
| Bază de date | PostgreSQL (Supabase), Row Level Security (RLS) |
| Storage | Supabase Storage (poze sesizări) |
| Realtime | Supabase Realtime (notificări) |
| PDF | generare server-side (route handler) |
| Teste | Vitest + Testing Library |

## 3. Clean Architecture

Codul e organizat pe straturi cu dependențe într-un singur sens:
`app (UI/route handlers) → application (use-cases) → domain (reguli pure)`,
iar `infrastructure` implementează porturile definite de `application`.
Domain-ul nu depinde de Next.js sau Supabase — poate fi testat izolat.

```
src/
├── app/                    # Next.js App Router: pagini, layouts, route handlers
│   ├── (auth)/              # /login, /register — publice
│   ├── (locatar)/           # rute protejate, rol LOCATAR
│   ├── (administrator)/     # rute protejate, rol ADMINISTRATOR
│   └── api/                 # REST route handlers (webhooks, PDF, upload)
│
├── domain/                  # Reguli de business pure, fără I/O
│   ├── entities/             # tipuri + invarianți (User, Block, Apartment, ...)
│   ├── value-objects/        # Money, Month, etc.
│   └── services/              # calculul cheltuielilor lunare (funcții pure, testabile)
│
├── application/             # Orchestrare use-case, independentă de framework
│   ├── ports/                 # interfețe repository (contracte)
│   └── use-cases/             # ex: GenerateMonthlyCosts, CreateTicket, MarkPayment
│
├── infrastructure/           # Implementări concrete ale porturilor
│   ├── supabase/               # clienți (browser/server/admin) + repositories
│   ├── pdf/                    # generator listă de plată PDF
│   └── notifications/          # trimitere notificări (DB + realtime)
│
├── components/               # Componente UI reutilizabile (prezentaționale)
│   ├── ui/                     # butoane, carduri, input-uri, tabele
│   ├── dashboard/               # widgets dashboard
│   ├── tickets/                  # formular/listă sesizări
│   └── layout/                    # shell, navigare
│
├── lib/                      # utilitare, validare (zod), auth helpers
├── hooks/                    # React hooks client-side
├── types/                    # tipuri partajate (inclusiv tipuri generate din DB)
└── proxy.ts                  # protecție rute + redirect pe rol (fost middleware)
```

### De ce Clean Architecture aici

- **`domain/services`** conține formula de calcul a cheltuielilor lunare ca
  funcție pură (`calculateMonthlyTotal`) — testabilă fără bază de date, fără
  Next.js, ceea ce respectă cerința „teste pentru funcțiile importante”.
- **`application/ports`** definește interfețe (ex: `MonthlyCostsRepository`)
  astfel încât `infrastructure/supabase` să poată fi înlocuit (alt provider,
  mock-uri în teste) fără să atingă logica de business.
- **`app/`** rămâne subțire: pagini + route handlers care apelează
  use-case-uri din `application/`, fără logică de business inline.

## 4. Multi-tenancy & RBAC

- Fiecare rând relevant e legat, direct sau tranzitiv, de `block_id`.
- RLS în PostgreSQL impune izolarea: un LOCATAR vede doar propriul
  apartament; un ADMINISTRATOR vede doar blocurile pe care le gestionează
  (tabel `block_admins`).
- Rolul e stocat în `users.role` (enum `user_role`) și e sursa de adevăr
  pentru RBAC în RLS (`auth.uid()` → `users.role`).
- `proxy.ts` face un control optimist (redirect rapid pe baza sesiunii) —
  autorizarea reală, obligatorie, se aplică în RLS + în use-cases.

## 5. Securitate

- Autentificare: Supabase Auth, cookies httpOnly, `@supabase/ssr`.
- Validare input: `zod` la limita fiecărui use-case / route handler.
- RBAC: RLS pe fiecare tabel + verificări explicite în use-cases.
- Audit: tabel `audit_log` — orice mutație a administratorului
  (creare bloc, editare consumuri, marcare plată, schimbare status sesizare)
  e înregistrată cu `actor_id`, `action`, `entity`, `entity_id`, `diff`, `created_at`.
- Fișiere: upload poze sesizări în bucket privat Supabase Storage, cu
  URL-uri semnate, nu public.

## 6. Etape de dezvoltare

Vezi [`docs/PLAN.md`](./PLAN.md) pentru planul detaliat pe etape (ETAPA 1–5)
și starea curentă a implementării.
