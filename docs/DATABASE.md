# Schema bazei de date — PostgreSQL (Supabase)

Migrația completă e în [`supabase/migrations/0001_init_schema.sql`](../supabase/migrations/0001_init_schema.sql).

## Diagramă entități

```
auth.users (Supabase Auth)
      │ 1:1
      ▼
   users  ──────────────────────────────┐
      │ 1:N (block_admins)               │ 1:N (residents)
      ▼                                  ▼
  block_admins                       residents
      │ N:1                              │ N:1
      ▼                                  ▼
   blocks ──1:N──▶ staircases ──1:N──▶ apartments ──1:N──▶ residents
      │                                  │
      │                                  ├──1:N──▶ monthly_costs
      │                                  ├──1:N──▶ payments
      │                                  └──1:N──▶ tickets
      │
      └──1:N──▶ tariffs (preț apă / canalizare, valabil de la o dată)

notifications  (N:1 users)
audit_log      (N:1 users ca actor)
```

Entitatea `Resident` din cerință e modelată ca tabel de asociere
`residents (user_id, apartment_id)` — permite istoric (un locatar se poate
muta) prin `moved_in_at` / `moved_out_at`, dar la un moment dat un apartament
are cel mult un locatar activ per relație (impus prin index parțial unic).

`block_admins` există pentru cerința „administratorul gestionează unul sau
mai multe blocuri” (relație N:N administrator ↔ bloc).

## Tabele

### `users`
Extensie a `auth.users` (Supabase). Un rând e creat automat printr-un
trigger la înregistrare (`handle_new_user`).

| coloană | tip | note |
|---|---|---|
| id | uuid PK | = `auth.users.id` |
| name | text | |
| email | text unique | sincronizat din `auth.users` |
| phone | text | |
| role | `user_role` enum | `ADMINISTRATOR` \| `LOCATAR` |
| created_at | timestamptz | |

### `blocks`
| id, name, address, created_by, created_at |

### `staircases` (Scară)
| id, block_id → blocks, name, created_at |
Unicitate: `(block_id, name)`.

### `apartments`
| id, staircase_id → staircases, number, floor, created_at |
Unicitate: `(staircase_id, number)`.
`block_id` e derivat via `staircase_id` (nu duplicat) — vederile/funcțiile
de query fac join-ul; pentru performanță există o coloană generată
`block_id` sincronizată prin trigger (evită N+1 în RLS).

### `residents`
| id, user_id → users, apartment_id → apartments, moved_in_at, moved_out_at |
Index unic parțial: un singur `resident` activ (`moved_out_at IS NULL`) per
apartament.

### `block_admins`
| id, block_id → blocks, user_id → users, created_at |
Unicitate: `(block_id, user_id)`.

### `tariffs`
Prețuri configurabile per bloc, cu istoric (`valid_from`).
| id, block_id, water_price, sewage_price, valid_from, created_by |

### `monthly_costs`
Cheltuielile lunare per apartament — corespunde cerinței `MonthlyCosts`.

| coloană | tip | note |
|---|---|---|
| id | uuid PK | |
| apartment_id | uuid → apartments | |
| month | date | normalizat la prima zi a lunii, ex `2026-08-01` |
| cold_water_consumption | numeric(10,3) | m³ |
| sewage_consumption | numeric(10,3) | m³ |
| water_price | numeric(10,2) | preț/m³ folosit (copiat din `tariffs` la generare) |
| sewage_price | numeric(10,2) | idem |
| electricity_cost | numeric(10,2) | electricitate părți comune |
| cleaning_cost | numeric(10,2) | |
| garbage_cost | numeric(10,2) | |
| repairs_cost | numeric(10,2) | |
| funding_fund_cost | numeric(10,2) | fond rulment |
| other_costs | numeric(10,2) | |
| debt | numeric(10,2) | restanțe reportate |
| penalties | numeric(10,2) | |
| total_amount | numeric(10,2) | **generat automat** (coloană `GENERATED ALWAYS`) |
| generated_at | timestamptz | |
| created_by | uuid → users | |

Unicitate: `(apartment_id, month)`. `total_amount` e coloană generată de
Postgres direct din formula cerută — nu poate ajunge inconsistentă.

### `payments`
Istoric plăți per apartament/lună — corespunde cerinței `Payments`.

| id, apartment_id, month, amount, status (`payment_status` enum:
`NEPLATIT`\|`PARTIAL`\|`PLATIT`), payment_date, recorded_by, created_at |

### `tickets` (Sesizări)
| id, apartment_id, created_by, title, category (`ticket_category` enum:
`APA`\|`LIFT`\|`ELECTRICITATE`\|`CURATENIE`\|`REPARATII`\|`ALTCEVA`),
description, image_path, status (`ticket_status` enum:
`NOUA`\|`IN_LUCRU`\|`REZOLVATA`), created_at, updated_at |

### `notifications`
| id, user_id, type (`notification_type` enum:
`LISTA_GENERATA`\|`RESTANTA`\|`SESIZARE_ACTUALIZATA`), title, body,
related_entity, related_id, read_at, created_at |

### `audit_log`
| id, actor_id → users, action (text, ex `CREATE_BLOCK`), entity (text),
entity_id (uuid), diff (jsonb), created_at |

## RLS (Row Level Security)

Toate tabelele au RLS activ. Politici cheie:

- **LOCATAR**: SELECT doar pe rândurile legate de apartamentul propriu
  (via `residents`), pentru `monthly_costs`, `payments`. Poate crea
  `tickets` doar pentru propriul apartament și le poate citi pe ale sale.
- **ADMINISTRATOR**: acces complet (SELECT/INSERT/UPDATE) pe blocurile din
  `block_admins` pentru rolul lui, propagat prin join-urile
  `staircases → apartments → monthly_costs / payments / tickets`.
- `notifications`: fiecare user vede doar notificările proprii.
- `audit_log`: doar administratorii pot citi, nimeni nu editează/șterge
  (append-only, impus prin lipsa politicilor UPDATE/DELETE).

Funcția helper `public.current_user_role()` și `public.is_block_admin(block_id)`
sunt folosite în politici pentru a evita duplicarea logicii.

## Migrații

Migrațiile sunt fișiere SQL numerotate în `supabase/migrations/`, aplicate
în ordine (compatibile cu `supabase db push` / `supabase migration up`).
