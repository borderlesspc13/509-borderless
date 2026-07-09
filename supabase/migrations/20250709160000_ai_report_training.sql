-- =============================================================================
-- Treinamento de IA para geração de relatórios por área clínica
-- =============================================================================

create table if not exists public.clinical_area_report_training_samples (
  id uuid primary key default gen_random_uuid(),
  clinical_area text not null,
  sort_order integer not null check (sort_order between 1 and 5),
  title text not null,
  body_text text not null,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (clinical_area, sort_order)
);

create index if not exists idx_clinical_area_training_samples_area
  on public.clinical_area_report_training_samples (clinical_area, sort_order);

create table if not exists public.clinical_area_ai_memory (
  clinical_area text primary key,
  pattern_summary text not null default '',
  style_guidelines text not null default '',
  section_outline text not null default '',
  sample_count integer not null default 0 check (sample_count >= 0),
  status text not null default 'not_started'
    check (status in ('not_started', 'collecting', 'ready', 'stale')),
  trained_at timestamptz,
  trained_by uuid references auth.users (id) on delete set null,
  updated_at timestamptz not null default now()
);

comment on table public.clinical_area_report_training_samples is
  'Até 5 relatórios manuais por área clínica para treinar o padrão de escrita da IA.';

comment on table public.clinical_area_ai_memory is
  'Memória/padrão de escrita da IA por área clínica, derivada dos relatórios de treino.';

alter table public.clinical_area_report_training_samples enable row level security;
alter table public.clinical_area_ai_memory enable row level security;

drop policy if exists "Leitura amostras treino relatório IA" on public.clinical_area_report_training_samples;
create policy "Leitura amostras treino relatório IA"
  on public.clinical_area_report_training_samples for select to authenticated using (true);

drop policy if exists "Gestão amostras treino relatório IA — equipe clínica"
  on public.clinical_area_report_training_samples;
create policy "Gestão amostras treino relatório IA — equipe clínica"
  on public.clinical_area_report_training_samples for all to authenticated
  using (public.is_supervisor_or_admin())
  with check (public.is_supervisor_or_admin());

drop policy if exists "Leitura memória IA relatórios" on public.clinical_area_ai_memory;
create policy "Leitura memória IA relatórios"
  on public.clinical_area_ai_memory for select to authenticated using (true);

drop policy if exists "Gestão memória IA relatórios — supervisor ou admin"
  on public.clinical_area_ai_memory;
create policy "Equipe clínica gerencia memória IA relatórios"
  on public.clinical_area_ai_memory for all to authenticated
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

-- Profissionais clínicos podem inserir/atualizar suas amostras de treino
drop policy if exists "Profissionais salvam amostras treino relatório IA"
  on public.clinical_area_report_training_samples;
create policy "Profissionais salvam amostras treino relatório IA"
  on public.clinical_area_report_training_samples for insert to authenticated
  with check (auth.uid() is not null);

drop policy if exists "Profissionais atualizam próprias amostras treino"
  on public.clinical_area_report_training_samples;
create policy "Profissionais atualizam próprias amostras treino"
  on public.clinical_area_report_training_samples for update to authenticated
  using (created_by = auth.uid() or public.is_supervisor_or_admin())
  with check (created_by = auth.uid() or public.is_supervisor_or_admin());

drop policy if exists "Profissionais removem próprias amostras treino"
  on public.clinical_area_report_training_samples;
create policy "Profissionais removem próprias amostras treino"
  on public.clinical_area_report_training_samples for delete to authenticated
  using (created_by = auth.uid() or public.is_supervisor_or_admin());

-- Seed memória vazia para cada área clínica
insert into public.clinical_area_ai_memory (clinical_area, status)
values
  ('Educador Físico', 'not_started'),
  ('Fisioterapia', 'not_started'),
  ('Fonoaudiologia', 'not_started'),
  ('Psicopedagogia', 'not_started'),
  ('Psicologia', 'not_started'),
  ('Terapia Ocupacional', 'not_started')
on conflict (clinical_area) do nothing;
