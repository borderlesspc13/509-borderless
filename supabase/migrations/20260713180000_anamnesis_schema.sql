-- Schema para Anamneses Estruturadas
create table if not exists public.patient_anamnesis (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  professional_id uuid not null references auth.users(id),
  anamnesis_type text not null, -- 'fisioterapia', 'terapia_ocupacional'
  form_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_patient_anamnesis_patient on public.patient_anamnesis(patient_id);
create index if not exists idx_patient_anamnesis_type on public.patient_anamnesis(anamnesis_type);

alter table public.patient_anamnesis enable row level security;

create policy "Visualização de anamneses por profissionais e admins"
  on public.patient_anamnesis
  for select
  using (
    public.is_supervisor_or_admin()
    or auth.uid() = professional_id
    or exists (
      select 1 from public.agenda_events ae
      where ae.patient_id = patient_anamnesis.patient_id
      and ae.professional_user_id = auth.uid()
    )
  );

create policy "Criação de anamneses por profissionais autenticados"
  on public.patient_anamnesis
  for insert
  with check (auth.role() = 'authenticated');

create policy "Atualização de anamneses pelo próprio autor ou admin"
  on public.patient_anamnesis
  for update
  using (
    public.is_supervisor_or_admin()
    or auth.uid() = professional_id
  );
