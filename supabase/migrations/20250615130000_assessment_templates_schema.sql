-- Cadastro de instrumentos de avaliação (templates ABA).

create table if not exists public.assessment_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  evaluation_type text not null default 'acquisition'
    check (evaluation_type in ('acquisition', 'reduction')),
  status text not null default 'active'
    check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_assessment_templates_status
  on public.assessment_templates (status);

create index if not exists idx_assessment_templates_name
  on public.assessment_templates (name);

create table if not exists public.assessment_levels (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.assessment_templates (id) on delete cascade,
  code text not null,
  sort_order integer not null,
  description text not null,
  age_range text,
  created_at timestamptz not null default now(),
  unique (template_id, sort_order)
);

create index if not exists idx_assessment_levels_template
  on public.assessment_levels (template_id, sort_order);

create table if not exists public.assessment_skills (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.assessment_templates (id) on delete cascade,
  code text not null,
  sort_order integer not null,
  description text not null,
  created_at timestamptz not null default now(),
  unique (template_id, sort_order)
);

create index if not exists idx_assessment_skills_template
  on public.assessment_skills (template_id, sort_order);

create table if not exists public.assessment_score_groups (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.assessment_templates (id) on delete cascade,
  sort_order integer not null default 1,
  created_at timestamptz not null default now()
);

create index if not exists idx_assessment_score_groups_template
  on public.assessment_score_groups (template_id, sort_order);

create table if not exists public.assessment_scores (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.assessment_templates (id) on delete cascade,
  group_id uuid not null references public.assessment_score_groups (id) on delete cascade,
  code text not null,
  sort_order integer not null,
  score_type text,
  description text not null,
  value numeric(10, 2),
  created_at timestamptz not null default now(),
  unique (group_id, sort_order)
);

create index if not exists idx_assessment_scores_group
  on public.assessment_scores (group_id, sort_order);

alter table public.assessment_templates enable row level security;
alter table public.assessment_levels enable row level security;
alter table public.assessment_skills enable row level security;
alter table public.assessment_score_groups enable row level security;
alter table public.assessment_scores enable row level security;

create policy "Leitura de templates de avaliação"
  on public.assessment_templates for select to authenticated using (true);

create policy "Gestão de templates — supervisor ou admin"
  on public.assessment_templates for all to authenticated
  using (public.is_supervisor_or_admin())
  with check (public.is_supervisor_or_admin());

create policy "Leitura de níveis de avaliação"
  on public.assessment_levels for select to authenticated using (true);

create policy "Gestão de níveis — supervisor ou admin"
  on public.assessment_levels for all to authenticated
  using (public.is_supervisor_or_admin())
  with check (public.is_supervisor_or_admin());

create policy "Leitura de habilidades de avaliação"
  on public.assessment_skills for select to authenticated using (true);

create policy "Gestão de habilidades — supervisor ou admin"
  on public.assessment_skills for all to authenticated
  using (public.is_supervisor_or_admin())
  with check (public.is_supervisor_or_admin());

create policy "Leitura de grupos de pontuação"
  on public.assessment_score_groups for select to authenticated using (true);

create policy "Gestão de grupos — supervisor ou admin"
  on public.assessment_score_groups for all to authenticated
  using (public.is_supervisor_or_admin())
  with check (public.is_supervisor_or_admin());

create policy "Leitura de pontuações"
  on public.assessment_scores for select to authenticated using (true);

create policy "Gestão de pontuações — supervisor ou admin"
  on public.assessment_scores for all to authenticated
  using (public.is_supervisor_or_admin())
  with check (public.is_supervisor_or_admin());

insert into public.assessment_templates (id, name, description, evaluation_type, status, created_at)
values
  (
    'b1000001-0000-4000-8000-000000000001',
    'Vineland - Escala de Comportamento Adaptativo',
    null,
    'acquisition',
    'active',
    '2026-05-27T12:00:00Z'
  ),
  (
    'b1000002-0000-4000-8000-000000000002',
    'Delineamento Sensorial',
    null,
    'reduction',
    'active',
    '2026-05-27T12:00:00Z'
  ),
  (
    'b1000003-0000-4000-8000-000000000003',
    'DENVER',
    null,
    'acquisition',
    'active',
    '2026-05-27T12:00:00Z'
  ),
  (
    'b1000004-0000-4000-8000-000000000004',
    'SPM - Casa',
    null,
    'acquisition',
    'active',
    '2026-05-27T12:00:00Z'
  ),
  (
    'b1000005-0000-4000-8000-000000000005',
    'SPM - P - Escola',
    null,
    'acquisition',
    'active',
    '2026-05-27T12:00:00Z'
  ),
  (
    'b1000006-0000-4000-8000-000000000006',
    'SPM - P - Casa',
    null,
    'acquisition',
    'active',
    '2026-05-27T12:00:00Z'
  ),
  (
    'b1000007-0000-4000-8000-000000000007',
    'PEDI',
    null,
    'acquisition',
    'active',
    '2026-05-27T12:00:00Z'
  ),
  (
    'b1000008-0000-4000-8000-000000000008',
    'IDADI',
    null,
    'acquisition',
    'active',
    '2026-05-27T12:00:00Z'
  ),
  (
    'b1000009-0000-4000-8000-000000000009',
    'M-CHAT-R/F',
    null,
    'acquisition',
    'active',
    '2026-05-27T12:00:00Z'
  )
on conflict (id) do nothing;
