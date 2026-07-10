-- Carga de trabalho do profissional: duração do slot + disponibilidade semanal.

alter table public.user_profiles
  add column if not exists slot_duration_minutes integer not null default 60
    check (
      slot_duration_minutes >= 5
      and slot_duration_minutes <= 60
      and slot_duration_minutes % 5 = 0
    );

comment on column public.user_profiles.slot_duration_minutes is
  'Duração padrão de cada horário de atendimento do profissional (minutos).';

create table if not exists public.professional_availability (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  start_time time not null,
  end_time time not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint professional_availability_time_range_check
    check (start_time < end_time)
);

create index if not exists idx_professional_availability_user
  on public.professional_availability (user_id, weekday);

comment on table public.professional_availability is
  'Intervalos de disponibilidade semanal do profissional (0=domingo … 6=sábado).';

alter table public.professional_availability enable row level security;

create policy "Equipe lê disponibilidade profissional"
  on public.professional_availability
  for select
  to authenticated
  using (not public.is_familia());

create policy "Profissional gerencia a própria disponibilidade"
  on public.professional_availability
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Admin/supervisor gerencia disponibilidade profissional"
  on public.professional_availability
  for all
  to authenticated
  using (public.is_supervisor_or_admin())
  with check (public.is_supervisor_or_admin());
