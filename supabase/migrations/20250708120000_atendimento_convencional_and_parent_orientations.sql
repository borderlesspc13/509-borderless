-- =============================================================================
-- Atendimento Convencional + Orientações para Pais
-- =============================================================================
-- 1. Adiciona care_type em agenda_events para separar ABA de Convencional
-- 2. Cria conventional_evolution_records com RLS owner-only (nem ADMIN acessa)
-- 3. Cria parent_orientations para publicações controladas para a família
-- 4. Ajusta RLS de clinical_evolution_records para bloquear FAMILIA
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 0. Funções auxiliares (idempotentes) — garantem execução mesmo quando o
--    banco foi montado via seed e não recebeu as migrations anteriores.
-- ---------------------------------------------------------------------------
create or replace function public.is_clinical_evolution_editor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select profile in ('ADMIN', 'SUPERVISOR', 'AT1') or is_master = true
      from public.user_profiles
      where id = auth.uid()
    ),
    false
  );
$$;

create or replace function public.is_familia()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select profile = 'FAMILIA'
      from public.user_profiles
      where id = auth.uid()
    ),
    false
  );
$$;

create or replace function public.familia_patient_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select patient_id
  from public.user_profiles
  where id = auth.uid()
    and profile = 'FAMILIA';
$$;

-- ---------------------------------------------------------------------------
-- 1. Coluna care_type em agenda_events
-- ---------------------------------------------------------------------------
alter table public.agenda_events
  add column if not exists care_type text not null default 'ABA'
    check (care_type in ('ABA', 'CONVENTIONAL'));

create index if not exists idx_agenda_events_care_type
  on public.agenda_events (care_type);

-- ---------------------------------------------------------------------------
-- 2. Tabela de evoluções convencionais — sigilo estrito por profissional
-- ---------------------------------------------------------------------------
-- O profissional é identificado pelo auth.uid() para garantir que mesmo
-- ADMIN e SUPERVISOR não consigam ler evoluções de outros profissionais.

create table if not exists public.conventional_evolution_records (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  patient_name text not null,
  session_date date not null,
  content_html text not null default '',
  status text not null default 'draft'
    check (status in ('draft', 'finalized')),
  professional_id uuid not null references auth.users (id) on delete cascade,
  professional_name text not null,
  professional_role text not null,
  professional_council text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (patient_id, session_date, professional_id)
);

create index if not exists idx_conv_evolution_patient
  on public.conventional_evolution_records (patient_id);

create index if not exists idx_conv_evolution_professional
  on public.conventional_evolution_records (professional_id);

create index if not exists idx_conv_evolution_status
  on public.conventional_evolution_records (status);

alter table public.conventional_evolution_records enable row level security;

-- Leitura: apenas o profissional que criou o registro
drop policy if exists "Leitura — somente o profissional responsável"
  on public.conventional_evolution_records;
create policy "Leitura — somente o profissional responsável"
  on public.conventional_evolution_records
  for select
  to authenticated
  using (professional_id = auth.uid());

-- Inserção: qualquer profissional clínico pode inserir os próprios registros
drop policy if exists "Inserção — editor clínico"
  on public.conventional_evolution_records;
create policy "Inserção — editor clínico"
  on public.conventional_evolution_records
  for insert
  to authenticated
  with check (
    professional_id = auth.uid()
    and public.is_clinical_evolution_editor()
  );

-- Atualização: apenas o próprio profissional
drop policy if exists "Atualização — somente o profissional responsável"
  on public.conventional_evolution_records;
create policy "Atualização — somente o profissional responsável"
  on public.conventional_evolution_records
  for update
  to authenticated
  using (professional_id = auth.uid())
  with check (professional_id = auth.uid());

-- ---------------------------------------------------------------------------
-- 3. Tabela de orientações para a família — curadoria da equipe
-- ---------------------------------------------------------------------------
create table if not exists public.parent_orientations (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  title text not null check (char_length(trim(title)) > 0),
  content_html text not null default '',
  -- Link para o PEI (PDF ou URL externa) — opcional
  pei_url text,
  pei_label text,
  author_name text not null,
  author_user_id uuid references auth.users (id) on delete set null,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_parent_orientations_patient
  on public.parent_orientations (patient_id, created_at desc);

alter table public.parent_orientations enable row level security;

-- Família: lê orientações publicadas do próprio paciente
drop policy if exists "Família lê orientações publicadas do próprio aprendiz"
  on public.parent_orientations;
create policy "Família lê orientações publicadas do próprio aprendiz"
  on public.parent_orientations
  for select
  to authenticated
  using (
    public.is_familia()
    and patient_id = public.familia_patient_id()
    and is_published = true
  );

-- Equipe: lê todas as orientações
drop policy if exists "Equipe lê orientações para pais"
  on public.parent_orientations;
create policy "Equipe lê orientações para pais"
  on public.parent_orientations
  for select
  to authenticated
  using (not public.is_familia());

-- Equipe clínica: pode inserir
drop policy if exists "Equipe clínica publica orientações para pais"
  on public.parent_orientations;
create policy "Equipe clínica publica orientações para pais"
  on public.parent_orientations
  for insert
  to authenticated
  with check (not public.is_familia());

-- Equipe clínica: pode atualizar
drop policy if exists "Equipe clínica atualiza orientações para pais"
  on public.parent_orientations;
create policy "Equipe clínica atualiza orientações para pais"
  on public.parent_orientations
  for update
  to authenticated
  using (not public.is_familia())
  with check (not public.is_familia());

-- Equipe clínica: pode remover
drop policy if exists "Equipe clínica remove orientações para pais"
  on public.parent_orientations;
create policy "Equipe clínica remove orientações para pais"
  on public.parent_orientations
  for delete
  to authenticated
  using (not public.is_familia());

-- ---------------------------------------------------------------------------
-- 4. Bloquear FAMILIA de ler evoluções técnicas (clinical_evolution_records)
-- ---------------------------------------------------------------------------
-- Remove política genérica atual e cria uma nova que exclui FAMILIA
drop policy if exists "Leitura de evoluções clínicas — equipe"
  on public.clinical_evolution_records;

drop policy if exists "Leitura anônima de evoluções em desenvolvimento"
  on public.clinical_evolution_records;

-- Família não acessa; equipe acessa conforme regra de paciente
drop policy if exists "Leitura de evoluções clínicas — somente equipe"
  on public.clinical_evolution_records;
create policy "Leitura de evoluções clínicas — somente equipe"
  on public.clinical_evolution_records
  for select
  to authenticated
  using (not public.is_familia());
