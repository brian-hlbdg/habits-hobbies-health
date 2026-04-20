-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ─── ITEMS ───────────────────────────────────────────────────────────────────
-- Habit/task definitions. Recurring habits never have a due_date.
-- Planned tasks (is_recurring = false) can have a due_date for urgency warnings.
create table public.items (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  title         text not null,
  category      text not null,       -- work | todo | website | daily | weekly | bills | next_week | personal | monthly | groceries | story
  view          text not null default 'daily',  -- daily | weekly | monthly | yearly
  frequency     text not null default 'daily',  -- daily | weekly | monthly | yearly | once
  is_recurring  boolean not null default true,  -- true = habit, false = planned task
  due_date      date,                -- only for is_recurring = false tasks
  active        boolean not null default true,
  order_index   integer not null default 0,
  created_at    timestamptz not null default now()
);

-- ─── COMPLETIONS ─────────────────────────────────────────────────────────────
-- One record per item per day. Upserted on check/uncheck.
create table public.completions (
  id               uuid primary key default gen_random_uuid(),
  item_id          uuid not null references public.items(id) on delete cascade,
  user_id          uuid not null references auth.users(id) on delete cascade,
  log_date         date not null,
  completed        boolean not null default false,
  note             text,
  carried_forward  boolean not null default false,
  created_at       timestamptz not null default now(),
  unique (item_id, log_date)
);

-- ─── INDEXES ─────────────────────────────────────────────────────────────────
create index items_user_view     on public.items (user_id, view, active);
create index completions_item    on public.completions (item_id, log_date);
create index completions_user    on public.completions (user_id, log_date);

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────────────────────
alter table public.items        enable row level security;
alter table public.completions  enable row level security;

-- Items: users can only see/modify their own rows
create policy "items_select"  on public.items for select  using (auth.uid() = user_id);
create policy "items_insert"  on public.items for insert  with check (auth.uid() = user_id);
create policy "items_update"  on public.items for update  using (auth.uid() = user_id);
create policy "items_delete"  on public.items for delete  using (auth.uid() = user_id);

-- Completions: same
create policy "completions_select"  on public.completions for select  using (auth.uid() = user_id);
create policy "completions_insert"  on public.completions for insert  with check (auth.uid() = user_id);
create policy "completions_update"  on public.completions for update  using (auth.uid() = user_id);
create policy "completions_delete"  on public.completions for delete  using (auth.uid() = user_id);
