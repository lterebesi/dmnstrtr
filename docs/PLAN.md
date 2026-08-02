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

## ETAPA 2 — Dashboard locatar ⬜

- ⬜ Repository `MonthlyCostsRepository` (Supabase) + use-case `GetCurrentMonthCosts`
- ⬜ Use-case `GetCostsHistory` (istoric luni precedente)
- ⬜ Componente dashboard: card sumar (nume, bloc, scară, apartament, lună),
  tabel defalcare costuri, TOTAL DE PLATĂ
- ⬜ Pagină istoric cu selector de lună
- ⬜ Buton „ASISTENȚĂ” (deschide formular sesizare rapid / contact administrator)

## ETAPA 3 — Dashboard administrator ⬜

- ⬜ Use-case-uri: `CreateBlock`, `CreateStaircase`, `CreateApartment`, `AssignResident`
- ⬜ Use-case `GenerateMonthlyCosts` (introducere consumuri → calcul automat,
  folosind `domain/services/calculateMonthlyTotal`)
- ⬜ Formulare gestionare blocuri/scări/apartamente/locatari
- ⬜ Formular introducere consumuri lunare (bulk per apartament)
- ⬜ Dashboard administrator: nr. blocuri, nr. apartamente, total de încasat,
  total restanțe, nr. sesizări active (query agregat + RLS pe `block_admins`)
- ⬜ Gestionare plăți: marcare `NEPLATIT` / `PARTIAL` / `PLATIT`, istoric plăți
- ⬜ Audit log pentru fiecare mutație de administrator

## ETAPA 4 — Sesizări ⬜

- ⬜ Use-case `CreateTicket` (validare zod, categorie, apartament curent)
- ⬜ Upload imagine opțională → Supabase Storage (bucket privat, URL semnat)
- ⬜ Listă sesizări (locatar: proprii; administrator: pe blocurile lui, filtrabile)
- ⬜ Use-case `UpdateTicketStatus` (doar administrator) — `NOUA → IN_LUCRU → REZOLVATA`
- ⬜ Notificare automată către locatar la schimbarea statusului

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
