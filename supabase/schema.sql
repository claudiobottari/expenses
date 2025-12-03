create extension if not exists "pgcrypto";

-- Core tables
create table if not exists public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  household_id uuid references public.households(id),
  full_name text,
  email text,
  created_at timestamptz not null default now()
);

create table if not exists public.wallets (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  name text not null,
  currency text not null default 'EUR',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists wallets_household_idx on public.wallets(household_id);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  name text not null,
  type text not null default 'expense',
  color text,
  is_default boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists categories_household_idx on public.categories(household_id);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  wallet_id uuid not null references public.wallets(id),
  category_id uuid not null references public.categories(id),
  amount numeric(12,2) not null,
  currency text not null default 'EUR',
  date date not null default current_date,
  description text,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists expenses_household_idx on public.expenses(household_id);
create index if not exists expenses_date_idx on public.expenses(date);
create index if not exists expenses_category_idx on public.expenses(category_id);

create table if not exists public.recurring_expenses (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  wallet_id uuid not null references public.wallets(id),
  category_id uuid not null references public.categories(id),
  amount numeric(12,2) not null,
  recurrence_rule text not null,
  next_occurrence date,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists recurring_household_idx on public.recurring_expenses(household_id);

create table if not exists public.attachments (
  id uuid primary key default gen_random_uuid(),
  expense_id uuid not null references public.expenses(id) on delete cascade,
  storage_path text not null,
  created_at timestamptz not null default now()
);

-- Row Level Security
alter table public.households enable row level security;
alter table public.profiles enable row level security;
alter table public.wallets enable row level security;
alter table public.categories enable row level security;
alter table public.expenses enable row level security;
alter table public.recurring_expenses enable row level security;
alter table public.attachments enable row level security;

create policy "Users see own household" on public.households
  for select using (exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.household_id = households.id
  ));

create policy "Users create household" on public.households
  for insert with check (auth.uid() is not null);

create policy "Users manage own profile" on public.profiles
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "Users see own wallets" on public.wallets
  using (household_id = (select household_id from public.profiles where id = auth.uid()))
  with check (household_id = (select household_id from public.profiles where id = auth.uid()));

create policy "Users see own categories" on public.categories
  using (household_id = (select household_id from public.profiles where id = auth.uid()))
  with check (household_id = (select household_id from public.profiles where id = auth.uid()));

create policy "Users see own expenses" on public.expenses
  using (household_id = (select household_id from public.profiles where id = auth.uid()))
  with check (
    household_id = (select household_id from public.profiles where id = auth.uid())
    and created_by = auth.uid()
  );

create policy "Users see own recurring" on public.recurring_expenses
  using (household_id = (select household_id from public.profiles where id = auth.uid()))
  with check (household_id = (select household_id from public.profiles where id = auth.uid()));

create policy "Users see own attachments" on public.attachments
  using (exists (
    select 1 from public.expenses e
    where e.id = attachments.expense_id
    and e.household_id = (select household_id from public.profiles where id = auth.uid())
  ))
  with check (exists (
    select 1 from public.expenses e
    where e.id = attachments.expense_id
    and e.household_id = (select household_id from public.profiles where id = auth.uid())
  ));

-- Triggers
create or replace function public.set_expense_timestamps()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists expenses_set_timestamp on public.expenses;
create trigger expenses_set_timestamp
  before update on public.expenses
  for each row execute function public.set_expense_timestamps();
