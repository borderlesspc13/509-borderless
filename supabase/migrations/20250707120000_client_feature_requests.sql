-- Solicitações da cliente: equipe profissional, atividades para casa, cargos e modelos de escrita.

-- Vínculo profissional ↔ aprendiz (Gerenciar Equipe)
create table if not exists public.professional_patient_assignments (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references auth.users (id) on delete cascade,
  patient_id uuid not null references public.patients (id) on delete cascade,
  assigned_at timestamptz not null default now(),
  unique (professional_id, patient_id)
);

create index if not exists idx_professional_patient_assignments_professional
  on public.professional_patient_assignments (professional_id);

create index if not exists idx_professional_patient_assignments_patient
  on public.professional_patient_assignments (patient_id);

alter table public.professional_patient_assignments enable row level security;

create policy "Equipe lê vínculos profissional-aprendiz"
  on public.professional_patient_assignments
  for select
  to authenticated
  using (not public.is_familia());

create policy "Admin/supervisor gerencia vínculos profissional-aprendiz"
  on public.professional_patient_assignments
  for all
  to authenticated
  using (public.is_supervisor_or_admin())
  with check (public.is_supervisor_or_admin());

-- Atividades para casa (psicopedagoga → família)
create table if not exists public.home_activities (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  title text not null check (char_length(trim(title)) > 0),
  description text not null check (char_length(trim(description)) > 0),
  instructions text,
  created_by_name text not null,
  created_by_user_id uuid references auth.users (id) on delete set null,
  is_published boolean not null default true,
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_home_activities_patient
  on public.home_activities (patient_id, created_at desc);

alter table public.home_activities enable row level security;

create policy "Equipe lê atividades para casa"
  on public.home_activities
  for select
  to authenticated
  using (not public.is_familia());

create policy "Família lê atividades publicadas do próprio aprendiz"
  on public.home_activities
  for select
  to authenticated
  using (
    public.is_familia()
    and patient_id = public.familia_patient_id()
    and is_published = true
  );

create policy "Equipe clínica publica atividades para casa"
  on public.home_activities
  for insert
  to authenticated
  with check (not public.is_familia());

create policy "Equipe clínica atualiza atividades para casa"
  on public.home_activities
  for update
  to authenticated
  using (not public.is_familia())
  with check (not public.is_familia());

create policy "Equipe clínica remove atividades para casa"
  on public.home_activities
  for delete
  to authenticated
  using (not public.is_familia());

-- Cargo Psicopedagoga
alter table public.user_profiles
  drop constraint if exists user_profiles_professional_role_check;

alter table public.user_profiles
  add constraint user_profiles_professional_role_check
  check (
    professional_role is null or professional_role in (
      'Psicólogo',
      'Psicólogo(a)',
      'Assistente Terapêutico (AT)',
      'Coordenador',
      'Fonoaudiólogo',
      'Terapeuta Ocupacional',
      'Supervisor Administrativo',
      'Musicoterapeuta',
      'Neuropsicólogo',
      'Psicopedagoga'
    )
  );

-- Modelos de referência para verificação de padrão de escrita (complementa os 3 existentes → 5)
insert into public.document_templates (id, name, category, body_html, status, created_at, updated_at)
values
  (
    'c1000004-0000-4000-8000-000000000004',
    'Relatório de Evolução Clínica ABA',
    'relatorio',
    $body4$
<h2>RELATÓRIO DE EVOLUÇÃO CLÍNICA</h2>
<h3>1. Identificação</h3>
<p>Paciente: [NOME_PACIENTE]<br>Data de nascimento: [DATA_NASCIMENTO]<br>Profissional: [NOME_PROFISSIONAL] — [CARGO_PROFISSIONAL] [CONSELHO_PROFISSIONAL]</p>
<h3>2. Período de acompanhamento</h3>
<p>De [DATA_INICIO] a [DATA_FIM], com frequência [FREQUENCIA_SESSOES].</p>
<h3>3. Objetivos terapêuticos</h3>
<p>[OBJETIVOS_TERAPEUTICOS]</p>
<h3>4. Evolução observada</h3>
<p>[EVOLUCAO_OBSERVADA]</p>
<h3>5. Conduta e recomendações</h3>
<p>[CONDUTA_RECOMENDACOES]</p>
<p>[DATA_SESSAO], [CIDADE].</p>
<p>_______________________________________________<br>[NOME_PROFISSIONAL]<br>[CARGO_PROFISSIONAL] [CONSELHO_PROFISSIONAL]</p>
$body4$,
    'active',
    '2026-07-07T12:00:00Z',
    '2026-07-07T12:00:00Z'
  ),
  (
    'c1000005-0000-4000-8000-000000000005',
    'Relatório Psicopedagógico',
    'relatorio',
    $body5$
<h2>RELATÓRIO PSICOPEDAGÓGICO</h2>
<h3>I. Identificação</h3>
<p>Aprendiz: [NOME_PACIENTE]<br>Idade: [IDADE] anos<br>Psicopedagoga: [NOME_PROFISSIONAL] — [CONSELHO_PROFISSIONAL]</p>
<h3>II. Demanda e contexto escolar</h3>
<p>[DESCRICAO_DEMANDA]</p>
<h3>III. Avaliação das habilidades de aprendizagem</h3>
<p>[AVALIACAO_HABILIDADES]</p>
<h3>IV. Intervenções realizadas</h3>
<p>[INTERVENCOES_REALIZADAS]</p>
<h3>V. Atividades para casa</h3>
<p>[ATIVIDADES_PARA_CASA]</p>
<h3>VI. Conclusão e encaminhamentos</h3>
<p>[CONCLUSAO_ENCAMINHAMENTOS]</p>
<p>[DATA_SESSAO], [CIDADE].</p>
<p>_______________________________________________<br>[NOME_PROFISSIONAL]<br>Psicopedagoga [CONSELHO_PROFISSIONAL]</p>
$body5$,
    'active',
    '2026-07-07T12:00:00Z',
    '2026-07-07T12:00:00Z'
  )
on conflict (id) do nothing;
