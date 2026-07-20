-- Mapa corporal do aprendiz: marcas de dor, lesão, ausência de membro, etc.

create table if not exists public.patient_body_marks (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  view_side text not null check (view_side in ('front', 'back')),
  x_pct numeric(6, 3) not null check (x_pct >= 0 and x_pct <= 100),
  y_pct numeric(6, 3) not null check (y_pct >= 0 and y_pct <= 100),
  mark_type text not null check (
    mark_type in ('pain', 'lesion', 'missing_limb', 'scar', 'other')
  ),
  severity smallint check (severity is null or (severity >= 0 and severity <= 10)),
  notes text,
  is_active boolean not null default true,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_patient_body_marks_patient
  on public.patient_body_marks (patient_id, is_active);

create index if not exists idx_patient_body_marks_view
  on public.patient_body_marks (patient_id, view_side);

alter table public.patient_body_marks enable row level security;

create policy "Equipe lê mapa corporal"
  on public.patient_body_marks
  for select
  to authenticated
  using (not public.is_familia());

create policy "Equipe cria marcas no mapa corporal"
  on public.patient_body_marks
  for insert
  to authenticated
  with check (not public.is_familia());

create policy "Equipe atualiza marcas no mapa corporal"
  on public.patient_body_marks
  for update
  to authenticated
  using (not public.is_familia())
  with check (not public.is_familia());

create policy "Equipe remove marcas no mapa corporal"
  on public.patient_body_marks
  for delete
  to authenticated
  using (not public.is_familia());
