-- Programas ABA: catálogo, alvos, critérios e arquivos.

create table if not exists public.programs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  registration_type text not null default 'catalog'
    check (registration_type in ('catalog', 'learner')),
  protocol text,
  specialty text,
  skill text,
  milestone_coding text,
  teaching_type text not null,
  targets_per_session integer not null default 1
    check (targets_per_session >= 1),
  attempts_per_target integer not null default 1
    check (attempts_per_target >= 1),
  patient_id uuid references public.patients (id) on delete set null,
  visibility text not null default 'private'
    check (visibility in ('private', 'public')),
  status text not null default 'active'
    check (status in ('active', 'inactive')),
  teaching_procedure text,
  instruction_sd text,
  objective text,
  hint_step text,
  correction_procedure text,
  learning_criterion text,
  materials_used text,
  observations text,
  evolution_primary_correct_pct numeric(5, 2),
  evolution_primary_sessions integer,
  evolution_secondary_correct_pct numeric(5, 2),
  evolution_secondary_sessions integer,
  correction_primary_incorrect_pct numeric(5, 2),
  correction_primary_sessions integer,
  correction_secondary_incorrect_pct numeric(5, 2),
  correction_secondary_sessions integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_programs_name on public.programs (name);
create index if not exists idx_programs_status on public.programs (status);
create index if not exists idx_programs_visibility on public.programs (visibility);
create index if not exists idx_programs_patient on public.programs (patient_id);

create table if not exists public.program_targets (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs (id) on delete cascade,
  target_group text,
  sort_order integer not null default 0,
  target_name text not null,
  situation text not null default 'active'
    check (situation in ('active', 'inactive', 'acquired', 'maintenance')),
  start_date date,
  maintenances text,
  acquired_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_program_targets_program
  on public.program_targets (program_id, sort_order);

create table if not exists public.program_criteria (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs (id) on delete cascade,
  position integer not null default 0,
  acronym text,
  degree text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_program_criteria_program
  on public.program_criteria (program_id, position);

create table if not exists public.program_files (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs (id) on delete cascade,
  file_name text not null,
  file_extension text,
  file_size bigint not null default 0,
  file_url text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_program_files_program
  on public.program_files (program_id, created_at desc);

-- Programas de demonstração
insert into public.programs (
  id,
  name,
  registration_type,
  teaching_type,
  targets_per_session,
  attempts_per_target,
  visibility,
  status
)
values
  (
    'b0000001-0000-4000-8000-000000000001',
    'Contato visual',
    'catalog',
    'Tentativa Discreta - Estruturada',
    3,
    2,
    'private',
    'active'
  ),
  (
    'b0000002-0000-4000-8000-000000000002',
    'Apontar',
    'catalog',
    'Tentativa Discreta - Estruturada',
    3,
    10,
    'private',
    'active'
  )
on conflict (id) do nothing;

alter table public.programs enable row level security;
alter table public.program_targets enable row level security;
alter table public.program_criteria enable row level security;
alter table public.program_files enable row level security;

create policy "Leitura de programas"
  on public.programs for select to authenticated using (true);

create policy "Gestão de programas — supervisor ou admin"
  on public.programs for all to authenticated
  using (public.is_supervisor_or_admin())
  with check (public.is_supervisor_or_admin());

create policy "Leitura de alvos do programa"
  on public.program_targets for select to authenticated using (true);

create policy "Gestão de alvos — supervisor ou admin"
  on public.program_targets for all to authenticated
  using (public.is_supervisor_or_admin())
  with check (public.is_supervisor_or_admin());

create policy "Leitura de critérios do programa"
  on public.program_criteria for select to authenticated using (true);

create policy "Gestão de critérios — supervisor ou admin"
  on public.program_criteria for all to authenticated
  using (public.is_supervisor_or_admin())
  with check (public.is_supervisor_or_admin());

create policy "Leitura de arquivos do programa"
  on public.program_files for select to authenticated using (true);

create policy "Gestão de arquivos — supervisor ou admin"
  on public.program_files for all to authenticated
  using (public.is_supervisor_or_admin())
  with check (public.is_supervisor_or_admin());
