-- Maestro Fit IA — schema inicial (MVP fase 1)
--
-- NOTA: user_id es un uuid simple, SIN referencia a auth.users todavía.
-- El MVP es single-user (ver DEFAULT_USER_ID en supabase-server.ts) y no hay
-- login real. Cuando se implemente Supabase Auth (fase 2), añadir:
--   alter table meals add constraint meals_user_id_fkey foreign key (user_id) references auth.users(id) on delete cascade;
--   alter table weight_logs add constraint weight_logs_user_id_fkey foreign key (user_id) references auth.users(id) on delete cascade;
--   alter table profiles add constraint profiles_id_fkey foreign key (id) references auth.users(id) on delete cascade;

create table if not exists profiles (
  id uuid primary key,
  daily_calories_goal integer not null default 2250,
  daily_protein_goal integer not null default 160,
  daily_carbs_goal integer not null default 220,
  daily_fat_goal integer not null default 70,
  created_at timestamptz not null default now()
);

create type meal_type as enum ('desayuno', 'comida', 'merienda', 'cena', 'snack');

create table if not exists meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  logged_date date not null default current_date,
  meal_type meal_type not null,
  description text not null,
  calories integer not null,
  protein_g numeric(6,1) not null default 0,
  carbs_g numeric(6,1) not null default 0,
  fat_g numeric(6,1) not null default 0,
  source text not null default 'manual', -- 'manual' | 'photo' | 'barcode'
  photo_url text,
  created_at timestamptz not null default now()
);

create index if not exists meals_user_date_idx on meals (user_id, logged_date);

create table if not exists weight_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  logged_date date not null default current_date,
  weight_kg numeric(5,1) not null,
  created_at timestamptz not null default now(),
  unique (user_id, logged_date)
);

-- Row Level Security: cada usuario solo ve sus propios datos
alter table profiles enable row level security;
alter table meals enable row level security;
alter table weight_logs enable row level security;

create policy "profiles_select_own" on profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);

create policy "meals_select_own" on meals for select using (auth.uid() = user_id);
create policy "meals_insert_own" on meals for insert with check (auth.uid() = user_id);
create policy "meals_update_own" on meals for update using (auth.uid() = user_id);
create policy "meals_delete_own" on meals for delete using (auth.uid() = user_id);

create policy "weight_select_own" on weight_logs for select using (auth.uid() = user_id);
create policy "weight_insert_own" on weight_logs for insert with check (auth.uid() = user_id);
create policy "weight_update_own" on weight_logs for update using (auth.uid() = user_id);
