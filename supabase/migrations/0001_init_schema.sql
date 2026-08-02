-- ============================================================================
-- 0001_init_schema.sql
-- Schema inițială: utilizatori & roluri, structura Bloc > Scară > Apartament,
-- cheltuieli lunare, plăți, sesizări, notificări, audit. RLS pe toate tabelele.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Extensii
-- ----------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- Enums
-- ----------------------------------------------------------------------------
create type public.user_role as enum ('ADMINISTRATOR', 'LOCATAR');

create type public.ticket_category as enum (
  'APA', 'LIFT', 'ELECTRICITATE', 'CURATENIE', 'REPARATII', 'ALTCEVA'
);

create type public.ticket_status as enum ('NOUA', 'IN_LUCRU', 'REZOLVATA');

create type public.payment_status as enum ('NEPLATIT', 'PARTIAL', 'PLATIT');

create type public.notification_type as enum (
  'LISTA_GENERATA', 'RESTANTA', 'SESIZARE_ACTUALIZATA'
);

-- ----------------------------------------------------------------------------
-- users — extensie profil peste auth.users
-- ----------------------------------------------------------------------------
create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null unique,
  phone text,
  role public.user_role not null default 'LOCATAR',
  created_at timestamptz not null default now()
);

comment on table public.users is 'Profil aplicație pentru fiecare auth.users, cu rol.';

-- Creează automat profilul la înregistrare, citind name/role din user_metadata.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, name, email, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data ->> 'phone',
    coalesce((new.raw_user_meta_data ->> 'role')::public.user_role, 'LOCATAR')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- blocks
-- ----------------------------------------------------------------------------
create table public.blocks (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  created_by uuid references public.users (id),
  created_at timestamptz not null default now()
);

-- block_admins — relație N:N administrator <-> bloc
create table public.block_admins (
  id uuid primary key default gen_random_uuid(),
  block_id uuid not null references public.blocks (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (block_id, user_id)
);

-- ----------------------------------------------------------------------------
-- staircases (Scară)
-- ----------------------------------------------------------------------------
create table public.staircases (
  id uuid primary key default gen_random_uuid(),
  block_id uuid not null references public.blocks (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (block_id, name)
);

-- ----------------------------------------------------------------------------
-- apartments
-- block_id e denormalizat (sincronizat prin trigger) ca să evităm join-uri
-- suplimentare în fiecare politică RLS din tabelele copil.
-- ----------------------------------------------------------------------------
create table public.apartments (
  id uuid primary key default gen_random_uuid(),
  staircase_id uuid not null references public.staircases (id) on delete cascade,
  block_id uuid not null references public.blocks (id) on delete cascade,
  number text not null,
  floor integer,
  created_at timestamptz not null default now(),
  unique (staircase_id, number)
);

create function public.sync_apartment_block_id()
returns trigger
language plpgsql
as $$
begin
  select s.block_id into new.block_id
  from public.staircases s
  where s.id = new.staircase_id;
  return new;
end;
$$;

create trigger apartments_sync_block_id
  before insert or update of staircase_id on public.apartments
  for each row execute function public.sync_apartment_block_id();

-- ----------------------------------------------------------------------------
-- residents — asociere locatar <-> apartament, cu istoric
-- ----------------------------------------------------------------------------
create table public.residents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  apartment_id uuid not null references public.apartments (id) on delete cascade,
  moved_in_at date not null default current_date,
  moved_out_at date,
  created_at timestamptz not null default now(),
  constraint residents_moved_out_after_in check (moved_out_at is null or moved_out_at >= moved_in_at)
);

-- Un singur locatar activ per apartament la un moment dat.
create unique index residents_one_active_per_apartment
  on public.residents (apartment_id)
  where moved_out_at is null;

-- ----------------------------------------------------------------------------
-- tariffs — prețuri configurabile per bloc, cu istoric
-- ----------------------------------------------------------------------------
create table public.tariffs (
  id uuid primary key default gen_random_uuid(),
  block_id uuid not null references public.blocks (id) on delete cascade,
  water_price numeric(10, 2) not null check (water_price >= 0),
  sewage_price numeric(10, 2) not null check (sewage_price >= 0),
  valid_from date not null default current_date,
  created_by uuid references public.users (id),
  created_at timestamptz not null default now(),
  unique (block_id, valid_from)
);

-- ----------------------------------------------------------------------------
-- monthly_costs — cheltuielile lunare per apartament
-- total_amount e coloană generată: nu poate deveni inconsistentă cu inputurile.
-- ----------------------------------------------------------------------------
create table public.monthly_costs (
  id uuid primary key default gen_random_uuid(),
  apartment_id uuid not null references public.apartments (id) on delete cascade,
  month date not null,
  cold_water_consumption numeric(10, 3) not null default 0 check (cold_water_consumption >= 0),
  sewage_consumption numeric(10, 3) not null default 0 check (sewage_consumption >= 0),
  water_price numeric(10, 2) not null default 0 check (water_price >= 0),
  sewage_price numeric(10, 2) not null default 0 check (sewage_price >= 0),
  electricity_cost numeric(10, 2) not null default 0 check (electricity_cost >= 0),
  cleaning_cost numeric(10, 2) not null default 0 check (cleaning_cost >= 0),
  garbage_cost numeric(10, 2) not null default 0 check (garbage_cost >= 0),
  repairs_cost numeric(10, 2) not null default 0 check (repairs_cost >= 0),
  funding_fund_cost numeric(10, 2) not null default 0 check (funding_fund_cost >= 0),
  other_costs numeric(10, 2) not null default 0 check (other_costs >= 0),
  debt numeric(10, 2) not null default 0 check (debt >= 0),
  penalties numeric(10, 2) not null default 0 check (penalties >= 0),
  total_amount numeric(12, 2) generated always as (
    round(
      (cold_water_consumption * water_price)
      + (sewage_consumption * sewage_price)
      + electricity_cost
      + cleaning_cost
      + garbage_cost
      + repairs_cost
      + funding_fund_cost
      + other_costs
      + debt
      + penalties,
    2)
  ) stored,
  created_by uuid references public.users (id),
  created_at timestamptz not null default now(),
  constraint monthly_costs_month_is_first_of_month check (date_trunc('month', month) = month),
  unique (apartment_id, month)
);

comment on column public.monthly_costs.total_amount is
  'TOTAL DE PLATĂ, calculat automat de Postgres din componentele de cost.';

-- ----------------------------------------------------------------------------
-- payments — istoric plăți per apartament/lună
-- ----------------------------------------------------------------------------
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  apartment_id uuid not null references public.apartments (id) on delete cascade,
  month date not null,
  amount numeric(12, 2) not null check (amount >= 0),
  status public.payment_status not null default 'NEPLATIT',
  payment_date date,
  recorded_by uuid references public.users (id),
  created_at timestamptz not null default now(),
  constraint payments_month_is_first_of_month check (date_trunc('month', month) = month)
);

create index payments_apartment_month_idx on public.payments (apartment_id, month);

-- ----------------------------------------------------------------------------
-- tickets — sesizări
-- ----------------------------------------------------------------------------
create table public.tickets (
  id uuid primary key default gen_random_uuid(),
  apartment_id uuid not null references public.apartments (id) on delete cascade,
  created_by uuid not null references public.users (id),
  title text not null,
  category public.ticket_category not null,
  description text not null,
  image_path text,
  status public.ticket_status not null default 'NOUA',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger tickets_set_updated_at
  before update on public.tickets
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- notifications
-- ----------------------------------------------------------------------------
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  type public.notification_type not null,
  title text not null,
  body text,
  related_entity text,
  related_id uuid,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_user_unread_idx on public.notifications (user_id) where read_at is null;

-- ----------------------------------------------------------------------------
-- audit_log — append-only, orice mutație a administratorului
-- ----------------------------------------------------------------------------
create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.users (id),
  action text not null,
  entity text not null,
  entity_id uuid,
  diff jsonb,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- Funcții helper pentru RLS
-- ============================================================================

create function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.users where id = auth.uid();
$$;

create function public.is_block_admin(target_block_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.block_admins ba
    where ba.block_id = target_block_id and ba.user_id = auth.uid()
  );
$$;

create function public.is_resident_of_apartment(target_apartment_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.residents r
    where r.apartment_id = target_apartment_id
      and r.user_id = auth.uid()
      and r.moved_out_at is null
  );
$$;

create function public.is_admin_of_apartment(target_apartment_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.apartments a
    where a.id = target_apartment_id
      and public.is_block_admin(a.block_id)
  );
$$;

-- ============================================================================
-- Row Level Security
-- ============================================================================

alter table public.users enable row level security;
alter table public.blocks enable row level security;
alter table public.block_admins enable row level security;
alter table public.staircases enable row level security;
alter table public.apartments enable row level security;
alter table public.residents enable row level security;
alter table public.tariffs enable row level security;
alter table public.monthly_costs enable row level security;
alter table public.payments enable row level security;
alter table public.tickets enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_log enable row level security;

-- users: fiecare vede propriul profil; administratorii văd locatarii din blocurile lor.
create policy users_select_self on public.users
  for select using (id = auth.uid());

create policy users_select_by_admin on public.users
  for select using (
    public.current_user_role() = 'ADMINISTRATOR'
    and exists (
      select 1 from public.residents r
      join public.apartments a on a.id = r.apartment_id
      where r.user_id = public.users.id and public.is_block_admin(a.block_id)
    )
  );

create policy users_update_self on public.users
  for update using (id = auth.uid()) with check (id = auth.uid());

-- blocks: administratorii văd/gestionează doar blocurile proprii.
create policy blocks_select_admin on public.blocks
  for select using (public.is_block_admin(id));

create policy blocks_insert_admin on public.blocks
  for insert with check (public.current_user_role() = 'ADMINISTRATOR');

create policy blocks_update_admin on public.blocks
  for update using (public.is_block_admin(id));

-- block_admins: vizibil administratorilor implicați.
create policy block_admins_select on public.block_admins
  for select using (user_id = auth.uid() or public.is_block_admin(block_id));

create policy block_admins_insert on public.block_admins
  for insert with check (public.current_user_role() = 'ADMINISTRATOR');

-- staircases
create policy staircases_select on public.staircases
  for select using (public.is_block_admin(block_id) or exists (
    select 1 from public.apartments a
    where a.staircase_id = staircases.id and public.is_resident_of_apartment(a.id)
  ));

create policy staircases_insert_admin on public.staircases
  for insert with check (public.is_block_admin(block_id));

create policy staircases_update_admin on public.staircases
  for update using (public.is_block_admin(block_id));

-- apartments
create policy apartments_select on public.apartments
  for select using (public.is_block_admin(block_id) or public.is_resident_of_apartment(id));

create policy apartments_insert_admin on public.apartments
  for insert with check (public.is_block_admin(block_id));

create policy apartments_update_admin on public.apartments
  for update using (public.is_block_admin(block_id));

-- residents
create policy residents_select on public.residents
  for select using (user_id = auth.uid() or public.is_admin_of_apartment(apartment_id));

create policy residents_insert_admin on public.residents
  for insert with check (public.is_admin_of_apartment(apartment_id));

create policy residents_update_admin on public.residents
  for update using (public.is_admin_of_apartment(apartment_id));

-- tariffs
create policy tariffs_select_admin on public.tariffs
  for select using (public.is_block_admin(block_id));

create policy tariffs_insert_admin on public.tariffs
  for insert with check (public.is_block_admin(block_id));

-- monthly_costs
create policy monthly_costs_select on public.monthly_costs
  for select using (
    public.is_resident_of_apartment(apartment_id)
    or public.is_admin_of_apartment(apartment_id)
  );

create policy monthly_costs_insert_admin on public.monthly_costs
  for insert with check (public.is_admin_of_apartment(apartment_id));

create policy monthly_costs_update_admin on public.monthly_costs
  for update using (public.is_admin_of_apartment(apartment_id));

-- payments
create policy payments_select on public.payments
  for select using (
    public.is_resident_of_apartment(apartment_id)
    or public.is_admin_of_apartment(apartment_id)
  );

create policy payments_insert_admin on public.payments
  for insert with check (public.is_admin_of_apartment(apartment_id));

create policy payments_update_admin on public.payments
  for update using (public.is_admin_of_apartment(apartment_id));

-- tickets
create policy tickets_select on public.tickets
  for select using (
    public.is_resident_of_apartment(apartment_id)
    or public.is_admin_of_apartment(apartment_id)
  );

create policy tickets_insert_resident on public.tickets
  for insert with check (
    created_by = auth.uid() and public.is_resident_of_apartment(apartment_id)
  );

create policy tickets_update_admin on public.tickets
  for update using (public.is_admin_of_apartment(apartment_id));

-- notifications: doar proprii.
create policy notifications_select_self on public.notifications
  for select using (user_id = auth.uid());

create policy notifications_update_self on public.notifications
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- audit_log: doar administratorii citesc; scrierea se face server-side (service role).
create policy audit_log_select_admin on public.audit_log
  for select using (public.current_user_role() = 'ADMINISTRATOR');
