# Plan de implementare pe etape

Legendă: ✅ implementat · 🚧 în lucru · ⬜ neînceput

## ETAPA 1 — Fundație ✅

- ✅ Inițializare proiect Next.js 16 (App Router, TypeScript strict, Tailwind CSS v4)
- ✅ Structură de foldere Clean Architecture (`domain` / `application` / `infrastructure` / `app`)
- ✅ Configurare client Supabase (browser, server, admin) via `@supabase/ssr`
- ✅ Schema completă a bazei de date (migrație SQL) — toate entitățile cerute
  + entități de suport (`staircases`, `block_admins`, `tariffs`, `notifications`, `audit_log`)
- ✅ Row Level Security pe fiecare tabel, funcții helper de rol
- ✅ Autentificare (Supabase Auth, email/parolă) — înregistrare, login, logout
- ✅ Roluri utilizator (`ADMINISTRATOR` / `LOCATAR`) + protecție rute (`proxy.ts`)
- ✅ Formula de calcul cheltuieli lunare ca serviciu pur în `domain/`, cu test unitar
- ✅ Dashboard shells (placeholder) pentru ambele roluri, ca bază pentru ETAPA 2/3

## ETAPA 2 — Dashboard locatar ✅

- ✅ Repository-uri Supabase (`residents`, `apartments`, `staircases`, `blocks`,
  `monthly_costs`, `payments`) + use-case `getLocatarDashboard`
- ✅ Use-case `getLocatarCostsHistory` (istoric luni precedente)
- ✅ Card sumar (nume, bloc, scară, apartament, lună), defalcare costuri,
  TOTAL DE PLATĂ, status plată
- ✅ Pagină istoric (`/locatar/istoric`)
- ✅ Buton „ASISTENȚĂ” (link către `/locatar/sesizari`)
- ⬜ Descărcare PDF (buton prezent, dezactivat — vezi ETAPA 5)

## ETAPA 3 — Dashboard administrator ✅

- ✅ Use-case-uri: `createBlock`, `createStaircase`, `createApartment`,
  `assignResidentByEmail` (căutare user după email cu client service role,
  autorizare verificată în use-case)
- ✅ Use-case `generateMonthlyCosts` (introducere consumuri → calcul automat,
  `total_amount` calculat de Postgres; `domain/services/calculateMonthlyTotal`
  folosit pentru previzualizare live în UI)
- ✅ Formulare gestionare blocuri/scări/apartamente/locatari
  (`/administrator/blocuri`, `/administrator/blocuri/[blockId]`)
- ✅ Formular introducere consumuri lunare per apartament (`/administrator/consumuri`)
- ✅ Dashboard administrator cu date reale: nr. blocuri, nr. apartamente,
  total de încasat, total restanțe, nr. sesizări active (RLS pe `block_admins`)
- ✅ Gestionare plăți: marcare `NEPLATIT` / `PARTIAL` / `PLATIT`, istoric plăți
  (`/administrator/plati`)
- ✅ Audit log pentru fiecare mutație de administrator (`recordAuditLog`,
  scriere via service role — `audit_log` nu are politică RLS de INSERT)

## ETAPA 4 — Sesizări ✅

- ✅ Use-case `createTicket` (validare zod, categorie, apartament rezolvat din `residents`)
- ✅ Upload imagine opțională → Supabase Storage, bucket privat `ticket-images`
  (migrație `0002_ticket_images_storage.sql`), afișare prin URL semnat (1h TTL)
- ✅ Listă sesizări (locatar: proprii, `/locatar/sesizari`; administrator: pe
  blocurile lui, RLS aplicat, `/administrator/sesizari`)
- ✅ Use-case `updateTicketStatus` (doar administrator) — `NOUA → IN_LUCRU → REZOLVATA`
- ✅ Notificare automată către locatar la schimbarea statusului (`createNotification`,
  scriere via service role — `notifications` nu are politică RLS de INSERT)

## ETAPA 5 — PDF, notificări, rapoarte ⬜

- ⬜ Generare PDF listă de plată lunară (route handler, server-side)
- ⬜ Notificare la generarea listei lunare (toți locatarii blocului)
- ⬜ Notificare automată pentru restanțe (job / trigger pe `payments`)
- ⬜ Centru de notificări (realtime, Supabase Realtime)
- ⬜ Rapoarte financiare administrator (încasări vs. restanțe, per bloc/lună, export)

## Note de execuție

- Fiecare etapă adaugă use-cases în `application/` și repositories în
  `infrastructure/supabase/repositories/`, fără să modifice `domain/`
  decât dacă apare o regulă de business nouă.
- Migrațiile viitoare (`0002_...sql`, etc.) sunt aditive; nu se editează
  `0001_init_schema.sql` după ce a fost aplicat pe un mediu.
- Testele unitare pentru `domain/services` sunt obligatorii la orice
  modificare a formulei de calcul.
