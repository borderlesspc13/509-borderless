-- =============================================================================
-- Nurse Care — Seed de demonstração
-- =============================================================================
-- Execute no SQL Editor do Supabase (Dashboard → SQL → New query).
-- O script aplica patches de schema (migrations pendentes) antes dos dados.
-- Recomendado: `supabase db push` — mas o seed tenta ser autossuficiente.
--
-- SENHA DE TODOS OS USUÁRIOS DEMO: Demo@1234
--
-- | E-mail                    | Perfil     | Nome                         |
-- |---------------------------|------------|------------------------------|
-- | admin@clinica.demo        | ADMIN      | Dr. Ricardo Almeida          |
-- | supervisor@clinica.demo   | SUPERVISOR | Dra. Carla Nogueira          |
-- | at1@clinica.demo          | AT1        | Ana Paula Santos (Psicóloga) |
-- | at2@clinica.demo          | AT2        | Bruno Lima (AT)              |
-- | recepcao@clinica.demo     | RECEPCAO   | Mariana Costa                |
-- | familia@clinica.demo      | FAMILIA    | Patrícia Mendes (Lucas)      |
-- =============================================================================

begin;

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- 0. Sincronização de schema (equivalente às migrations incrementais)
-- ---------------------------------------------------------------------------

-- user_profiles — campos profissionais (20250610120000, 20250615120000)
alter table public.user_profiles
  add column if not exists professional_role text,
  add column if not exists birth_date date,
  add column if not exists cpf text,
  add column if not exists status text default 'active';

update public.user_profiles
set status = 'active'
where status is null;

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
      'Neuropsicólogo'
    )
  );

-- patients + prontuário (20250612140000)
create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  birth_date date,
  guardian_name text,
  guardian_phone text,
  guardian_email text,
  diagnosis text,
  cpf text,
  notes text,
  status text not null default 'active'
    check (status in ('active', 'inactive', 'discharged')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.patients add column if not exists avatar_url text;
alter table public.user_profiles add column if not exists avatar_url text;

create table if not exists public.evaluations (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  title text not null,
  instrument text,
  evaluation_date date not null,
  content_html text not null default '',
  status text not null default 'draft'
    check (status in ('draft', 'finalized')),
  professional_name text not null,
  professional_role text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.therapeutic_plans (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  title text not null,
  goals_html text not null default '',
  strategies_html text not null default '',
  start_date date not null,
  end_date date,
  status text not null default 'active'
    check (status in ('draft', 'active', 'completed', 'archived')),
  professional_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.patient_documents (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  title text not null,
  document_type text not null default 'outro',
  file_url text,
  notes text,
  uploaded_by text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.clinical_evolution_records (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id),
  patient_name text not null,
  session_date date not null,
  content_html text not null default '',
  status text not null default 'draft'
    check (status in ('draft', 'finalized')),
  professional_name text not null,
  professional_role text not null,
  professional_council text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (patient_id, session_date, professional_name)
);

-- Portal da Família (20250701120000)
alter table public.user_profiles
  add column if not exists patient_id uuid references public.patients (id) on delete set null;

alter table public.user_profiles
  drop constraint if exists user_profiles_profile_check;

alter table public.user_profiles
  add constraint user_profiles_profile_check
  check (profile in ('ADMIN', 'SUPERVISOR', 'RECEPCAO', 'AT1', 'AT2', 'FAMILIA'));

alter table public.user_profiles
  drop constraint if exists user_profiles_familia_patient_check;

alter table public.user_profiles
  add constraint user_profiles_familia_patient_check
  check (
    (profile = 'FAMILIA' and patient_id is not null)
    or (profile <> 'FAMILIA' and patient_id is null)
  );

alter table public.user_profiles
  add column if not exists slot_duration_minutes integer not null default 60;

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

create table if not exists public.family_portal_notices (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  title text not null,
  content text not null check (char_length(trim(content)) > 0),
  author_name text not null,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

-- agenda_events — base + colunas incrementais
create table if not exists public.agenda_events (
  id text primary key,
  patient_name text not null,
  professional_name text not null,
  professional_user_id uuid references auth.users (id) on delete set null,
  event_date date not null,
  start_time text not null,
  end_time text not null,
  status text not null default 'agendado',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.agenda_events
  add column if not exists patient_id uuid references public.patients (id);

alter table public.agenda_events
  add column if not exists valor_sessao numeric(10, 2);

alter table public.agenda_events
  add column if not exists payment_link_url text;

alter table public.agenda_events
  add column if not exists payment_status text default 'pendente';

update public.agenda_events
set payment_status = 'pendente'
where payment_status is null;

alter table public.agenda_events
  add column if not exists queue_number integer,
  add column if not exists room_name text,
  add column if not exists called_at timestamptz;

alter table public.agenda_events
  drop constraint if exists agenda_events_status_check;

alter table public.agenda_events
  add constraint agenda_events_status_check
  check (
    status in ('confirmado', 'agendado', 'em_espera', 'chamado', 'cancelado')
  );

alter table public.agenda_events
  drop constraint if exists agenda_events_payment_status_check;

alter table public.agenda_events
  add constraint agenda_events_payment_status_check
  check (payment_status in ('pendente', 'pago', 'cancelado'));

-- evaluations.total_score (20250630120000)
alter table public.evaluations
  add column if not exists total_score numeric(10, 2);

-- clinic_settings (20250630130000)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select profile = 'ADMIN' or is_master = true
      from public.user_profiles
      where id = auth.uid()
    ),
    false
  );
$$;

create table if not exists public.clinic_settings (
  id uuid primary key default '00000000-0000-4000-8000-000000000001'::uuid,
  nome_clinica text not null default '',
  cnpj text,
  endereco_completo text,
  logo_url text,
  stripe_api_key text,
  mercado_pago_api_key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint clinic_settings_singleton check (
    id = '00000000-0000-4000-8000-000000000001'::uuid
  )
);

-- Chat corporativo (20250623120000) — mínimo para o seed
create table if not exists public.chat_conversations (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('direct', 'group')),
  name text,
  direct_pair_key text,
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chat_conversation_members (
  conversation_id uuid not null references public.chat_conversations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  last_read_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.chat_conversations (id) on delete cascade,
  sender_id uuid not null references auth.users (id) on delete cascade,
  content text not null check (char_length(trim(content)) > 0),
  created_at timestamptz not null default now()
);

-- Templates de avaliação ABA (20250615130000)
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

create table if not exists public.assessment_skills (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.assessment_templates (id) on delete cascade,
  code text not null,
  sort_order integer not null,
  description text not null,
  created_at timestamptz not null default now(),
  unique (template_id, sort_order)
);

create table if not exists public.assessment_score_groups (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.assessment_templates (id) on delete cascade,
  sort_order integer not null default 1,
  created_at timestamptz not null default now()
);

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

-- Comunicação interna + auditoria (20250608120000, 20250610100000)
create table if not exists public.agenda_audit_logs (
  id uuid primary key default gen_random_uuid(),
  performed_at timestamptz not null default now(),
  user_name text not null,
  user_profile text not null,
  action_label text not null,
  patient_name text not null,
  from_description text not null,
  to_description text not null,
  appointment_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.internal_messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users (id) on delete cascade,
  receiver_id uuid not null references auth.users (id) on delete cascade,
  content text not null check (char_length(trim(content)) > 0),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.user_presence (
  user_id uuid primary key references auth.users (id) on delete cascade,
  last_seen_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 1. Limpeza opcional de dados demo anteriores (IDs fixos)
-- ---------------------------------------------------------------------------
delete from public.chat_messages
where conversation_id in (
  'c2000001-0000-4000-8000-000000000001',
  'c2000002-0000-4000-8000-000000000002'
);

delete from public.chat_conversation_members
where conversation_id in (
  'c2000001-0000-4000-8000-000000000001',
  'c2000002-0000-4000-8000-000000000002'
);

delete from public.chat_conversations
where id in (
  'c2000001-0000-4000-8000-000000000001',
  'c2000002-0000-4000-8000-000000000002'
);

delete from public.internal_messages
where id in (
  'd2000001-0000-4000-8000-000000000001',
  'd2000002-0000-4000-8000-000000000002'
);

delete from public.agenda_audit_logs
where id in (
  'f2000001-0000-4000-8000-000000000001',
  'f2000002-0000-4000-8000-000000000002',
  'f2000003-0000-4000-8000-000000000003'
);

delete from public.agenda_events
where id like 'demo-apt-%';

delete from public.evaluations
where id::text like 'e200000%';

delete from public.clinical_evolution_records
where id::text like '0e20000%';

delete from public.therapeutic_plans
where id::text like '0a20000%';

delete from public.patient_documents
where id::text like 'd200000%';

delete from public.assessment_scores
where template_id = 'b2000001-0000-4000-8000-000000000001';

delete from public.assessment_score_groups
where template_id = 'b2000001-0000-4000-8000-000000000001';

delete from public.assessment_skills
where template_id = 'b2000001-0000-4000-8000-000000000001';

delete from public.assessment_levels
where template_id = 'b2000001-0000-4000-8000-000000000001';

delete from public.assessment_templates
where id = 'b2000001-0000-4000-8000-000000000001';

-- ---------------------------------------------------------------------------
-- 2. Usuários de autenticação (auth.users + auth.identities)
-- ---------------------------------------------------------------------------
do $$
declare
  demo_users constant jsonb := '[
    {"id":"e1000001-0000-4000-8000-000000000001","email":"admin@clinica.demo","name":"Dr. Ricardo Almeida","profile":"ADMIN"},
    {"id":"e1000002-0000-4000-8000-000000000002","email":"supervisor@clinica.demo","name":"Dra. Carla Nogueira","profile":"SUPERVISOR"},
    {"id":"e1000003-0000-4000-8000-000000000003","email":"at1@clinica.demo","name":"Ana Paula Santos","profile":"AT1"},
    {"id":"e1000004-0000-4000-8000-000000000004","email":"at2@clinica.demo","name":"Bruno Lima","profile":"AT2"},
    {"id":"e1000005-0000-4000-8000-000000000005","email":"recepcao@clinica.demo","name":"Mariana Costa","profile":"RECEPCAO"},
    {"id":"e1000006-0000-4000-8000-000000000006","email":"familia@clinica.demo","name":"Patrícia Mendes","profile":"FAMILIA","patient_id":"a0000001-0000-4000-8000-000000000001"}
  ]'::jsonb;
  user_row jsonb;
  v_user_id uuid;
  v_user_email text;
begin
  for user_row in select value from jsonb_array_elements(demo_users) as t(value)
  loop
    v_user_id := (user_row ->> 'id')::uuid;
    v_user_email := user_row ->> 'email';

    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    )
    select
      '00000000-0000-0000-0000-000000000000',
      v_user_id,
      'authenticated',
      'authenticated',
      v_user_email,
      crypt('Demo@1234', gen_salt('bf')),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'full_name', user_row ->> 'name',
        'profile', user_row ->> 'profile',
        'patient_id', user_row ->> 'patient_id'
      ),
      now(),
      now(),
      '',
      '',
      '',
      ''
    where not exists (
      select 1 from auth.users u
      where u.id = v_user_id or u.email = v_user_email
    );

    insert into auth.identities (
      id,
      user_id,
      provider_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    )
    select
      v_user_id,
      v_user_id,
      v_user_email,
      jsonb_build_object('sub', v_user_id::text, 'email', v_user_email),
      'email',
      now(),
      now(),
      now()
    where not exists (
      select 1 from auth.identities i
      where i.user_id = v_user_id and i.provider = 'email'
    );
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- 3. Perfis da equipe (user_profiles)
-- ---------------------------------------------------------------------------
insert into public.user_profiles (
  id, full_name, profile, is_master,
  professional_role, professional_council, cpf, status, patient_id
)
values
  (
    'e1000001-0000-4000-8000-000000000001',
    'Dr. Ricardo Almeida',
    'ADMIN',
    false,
    'Coordenador',
    'CRP 12/34567',
    '12345678901',
    'active',
    null
  ),
  (
    'e1000002-0000-4000-8000-000000000002',
    'Dra. Carla Nogueira',
    'SUPERVISOR',
    false,
    'Psicólogo(a)',
    'CRP 12/98765',
    '23456789012',
    'active',
    null
  ),
  (
    'e1000003-0000-4000-8000-000000000003',
    'Ana Paula Santos',
    'AT1',
    false,
    'Psicólogo(a)',
    'CRP 12/11223',
    '34567890123',
    'active',
    null
  ),
  (
    'e1000004-0000-4000-8000-000000000004',
    'Bruno Lima',
    'AT2',
    false,
    'Assistente Terapêutico (AT)',
    'CRP 12/44556',
    '45678901234',
    'active',
    null
  ),
  (
    'e1000005-0000-4000-8000-000000000005',
    'Mariana Costa',
    'RECEPCAO',
    false,
    null,
    null,
    '56789012345',
    'active',
    null
  ),
  (
    'e1000006-0000-4000-8000-000000000006',
    'Patrícia Mendes',
    'FAMILIA',
    false,
    null,
    null,
    null,
    'active',
    'a0000001-0000-4000-8000-000000000001'
  )
on conflict (id) do update set
  full_name = excluded.full_name,
  profile = excluded.profile,
  professional_role = excluded.professional_role,
  professional_council = excluded.professional_council,
  status = excluded.status,
  patient_id = excluded.patient_id,
  updated_at = now();

-- Presença online
insert into public.user_presence (user_id, last_seen_at)
values
  ('e1000001-0000-4000-8000-000000000001', now()),
  ('e1000002-0000-4000-8000-000000000002', now() - interval '2 minutes'),
  ('e1000003-0000-4000-8000-000000000003', now() - interval '5 minutes'),
  ('e1000004-0000-4000-8000-000000000004', now() - interval '15 minutes')
on conflict (user_id) do update set last_seen_at = excluded.last_seen_at;

-- ---------------------------------------------------------------------------
-- 4. Aprendizes (patients) — enriquece os 5 já criados pela migration
-- ---------------------------------------------------------------------------
insert into public.patients (
  id, full_name, birth_date, guardian_name, guardian_phone,
  guardian_email, diagnosis, cpf, notes, status
)
values
  (
    'a0000001-0000-4000-8000-000000000001',
    'Lucas Mendes',
    '2018-03-14',
    'Patrícia Mendes',
    '(28) 99911-2233',
    'patricia.mendes@email.com',
    'TEA — Nível 2 de suporte',
    '11122233344',
    'Preferência por rotina visual. Reforço token economy.',
    'active'
  ),
  (
    'a0000002-0000-4000-8000-000000000002',
    'Sofia Ribeiro',
    '2019-07-22',
    'Carlos Ribeiro',
    '(28) 98822-3344',
    'carlos.ribeiro@email.com',
    'TEA — Nível 1 de suporte',
    '22233344455',
    'Boa adesão às atividades estruturadas.',
    'active'
  ),
  (
    'a0000003-0000-4000-8000-000000000003',
    'Miguel Torres',
    '2017-11-05',
    'Ana Torres',
    '(28) 97733-4455',
    'ana.torres@email.com',
    'TEA — Nível 2 de suporte',
    '33344455566',
    'Reavaliação VB-MAPP pendente há mais de 6 meses.',
    'active'
  ),
  (
    'a0000004-0000-4000-8000-000000000004',
    'Fernanda Oliveira',
    '2016-01-30',
    'Roberto Oliveira',
    '(28) 96644-5566',
    'roberto.oliveira@email.com',
    'TEA — Nível 3 de suporte',
    '44455566677',
    'Sem avaliação formal registrada.',
    'active'
  ),
  (
    'a0000005-0000-4000-8000-000000000005',
    'Gabriel Souza',
    '2020-09-18',
    'Juliana Souza',
    '(28) 95555-6677',
    'juliana.souza@email.com',
    'TEA — Nível 1 de suporte',
    '55566677788',
    'Iniciou tratamento recentemente.',
    'active'
  )
on conflict (id) do update set
  guardian_phone = excluded.guardian_phone,
  guardian_email = excluded.guardian_email,
  cpf = excluded.cpf,
  notes = excluded.notes,
  updated_at = now();

-- ---------------------------------------------------------------------------
-- 5. Template VB-MAPP (avaliações) com níveis, habilidades e pontuações
-- ---------------------------------------------------------------------------
insert into public.assessment_templates (
  id, name, description, evaluation_type, status
)
values (
  'b2000001-0000-4000-8000-000000000001',
  'VB-MAPP',
  'Verbal Behavior Milestones Assessment and Placement Program',
  'acquisition',
  'active'
)
on conflict (id) do nothing;

insert into public.assessment_levels (id, template_id, code, sort_order, description, age_range)
values
  ('b2000011-0000-4000-8000-000000000001', 'b2000001-0000-4000-8000-000000000001', 'N1', 1, 'Nível 1 — Mandos', '0-18 meses'),
  ('b2000011-0000-4000-8000-000000000002', 'b2000001-0000-4000-8000-000000000001', 'N2', 2, 'Nível 2 — Tatos', '18-30 meses'),
  ('b2000011-0000-4000-8000-000000000003', 'b2000001-0000-4000-8000-000000000001', 'N3', 3, 'Nível 3 — Intraverbais', '30-48 meses')
on conflict (id) do nothing;

insert into public.assessment_skills (id, template_id, code, sort_order, description)
values
  ('b2000021-0000-4000-8000-000000000001', 'b2000001-0000-4000-8000-000000000001', 'M1', 1, 'Mando por itens preferidos'),
  ('b2000021-0000-4000-8000-000000000002', 'b2000001-0000-4000-8000-000000000001', 'T1', 2, 'Tato de objetos comuns'),
  ('b2000021-0000-4000-8000-000000000003', 'b2000001-0000-4000-8000-000000000001', 'IV1', 3, 'Resposta intraverbal simples')
on conflict (id) do nothing;

insert into public.assessment_score_groups (id, template_id, sort_order)
values
  ('b2000031-0000-4000-8000-000000000001', 'b2000001-0000-4000-8000-000000000001', 1)
on conflict (id) do nothing;

insert into public.assessment_scores (
  id, template_id, group_id, code, sort_order, score_type, description, value
)
values
  ('b2000041-0000-4000-8000-000000000001', 'b2000001-0000-4000-8000-000000000001', 'b2000031-0000-4000-8000-000000000001', 'S1', 1, '0-2', 'Pontuação nível 1', 2),
  ('b2000041-0000-4000-8000-000000000002', 'b2000001-0000-4000-8000-000000000001', 'b2000031-0000-4000-8000-000000000001', 'S2', 2, '0-2', 'Pontuação nível 2', 2),
  ('b2000041-0000-4000-8000-000000000003', 'b2000001-0000-4000-8000-000000000001', 'b2000031-0000-4000-8000-000000000001', 'S3', 3, '0-2', 'Pontuação nível 3', 2)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- 6. Avaliações (evaluations) — gráficos de indicadores + alertas de reavaliação
-- ---------------------------------------------------------------------------
insert into public.evaluations (
  id, patient_id, title, instrument, evaluation_date,
  content_html, total_score, status, professional_name, professional_role
)
values
  -- Lucas Mendes: evolução VB-MAPP (gráfico de linha + comparação Jan vs Jul)
  (
    'e2000001-0000-4000-8000-000000000001',
    'a0000001-0000-4000-8000-000000000001',
    'VB-MAPP — Avaliação inicial',
    'VB-MAPP',
    (current_date - interval '11 months')::date,
    '<p>Avaliação VB-MAPP de referência.</p><!-- score-breakdown: {"Mandos":28,"Tatos":22,"Intraverbais":18,"Ecoicos":17} -->',
    85,
    'finalized',
    'Ana Paula Santos',
    'Psicólogo(a)'
  ),
  (
    'e2000002-0000-4000-8000-000000000002',
    'a0000001-0000-4000-8000-000000000001',
    'VB-MAPP — Reavaliação semestral',
    'VB-MAPP',
    (current_date - interval '5 months')::date,
    '<p>Progresso em mandos e tatos.</p><!-- score-breakdown: {"Mandos":32,"Tatos":28,"Intraverbais":20,"Ecoicos":12} -->',
    92,
    'finalized',
    'Ana Paula Santos',
    'Psicólogo(a)'
  ),
  (
    'e2000003-0000-4000-8000-000000000003',
    'a0000001-0000-4000-8000-000000000001',
    'VB-MAPP — Acompanhamento',
    'VB-MAPP',
    (current_date - interval '1 month')::date,
    '<p>Manutenção de ganhos.</p><!-- score-breakdown: {"Mandos":34,"Tatos":30,"Intraverbais":22,"Ecoicos":10} -->',
    96,
    'finalized',
    'Dra. Carla Nogueira',
    'Supervisor(a)'
  ),
  -- Sofia: avaliação recente
  (
    'e2000004-0000-4000-8000-000000000004',
    'a0000002-0000-4000-8000-000000000002',
    'VB-MAPP — Baseline',
    'VB-MAPP',
    (current_date - interval '2 months')::date,
    '<p>Primeira aplicação do instrumento.</p>',
    78,
    'finalized',
    'Bruno Lima',
    'Assistente Terapêutico (AT)'
  ),
  -- Miguel: última avaliação há > 6 meses (alerta de reavaliação)
  (
    'e2000005-0000-4000-8000-000000000005',
    'a0000003-0000-4000-8000-000000000003',
    'VB-MAPP — Avaliação 2024',
    'VB-MAPP',
    (current_date - interval '8 months')::date,
    '<p>Avaliação desatualizada para demonstração do alerta.</p>',
    71,
    'finalized',
    'Ana Paula Santos',
    'Psicólogo(a)'
  ),
  -- Gabriel: rascunho (não entra nos gráficos)
  (
    'e2000006-0000-4000-8000-000000000006',
    'a0000005-0000-4000-8000-000000000005',
    'VB-MAPP — Em andamento',
    'VB-MAPP',
    current_date,
    '<p>Rascunho de avaliação.</p>',
    null,
    'draft',
    'Bruno Lima',
    'Assistente Terapêutico (AT)'
  )
on conflict (id) do update set
  total_score = excluded.total_score,
  content_html = excluded.content_html,
  status = excluded.status,
  updated_at = now();

-- Fernanda Oliveira: sem avaliações → também gera alerta de reavaliação

-- ---------------------------------------------------------------------------
-- 7. Evoluções clínicas
-- ---------------------------------------------------------------------------
insert into public.clinical_evolution_records (
  id, patient_id, patient_name, session_date, content_html,
  status, professional_name, professional_role, professional_council
)
values
  (
    '0e200001-0000-4000-8000-000000000001',
    'a0000001-0000-4000-8000-000000000001',
    'Lucas Mendes',
    (current_date - interval '3 days')::date,
    '<p>Sessão focada em <strong>mando funcional</strong>. Lucas solicitou lanche com gesto + vocalização espontânea em 8/10 tentativas.</p>',
    'finalized',
    'Ana Paula Santos',
    'Psicólogo(a)',
    'CRP 12/11223'
  ),
  (
    '0e200002-0000-4000-8000-000000000002',
    'a0000001-0000-4000-8000-000000000001',
    'Lucas Mendes',
    (current_date - interval '1 day')::date,
    '<p>Trabalhado <strong>tato de objetos</strong>. Rascunho para revisão da supervisora.</p>',
    'draft',
    'Ana Paula Santos',
    'Psicólogo(a)',
    'CRP 12/11223'
  ),
  (
    '0e200003-0000-4000-8000-000000000003',
    'a0000002-0000-4000-8000-000000000002',
    'Sofia Ribeiro',
    (current_date - interval '2 days')::date,
    '<p>Sofia demonstrou generalização de habilidades de espera com timer visual.</p>',
    'finalized',
    'Bruno Lima',
    'Assistente Terapêutico (AT)',
    'CRP 12/44556'
  ),
  (
    '0e200004-0000-4000-8000-000000000004',
    'a0000005-0000-4000-8000-000000000005',
    'Gabriel Souza',
    current_date,
    '<p>Primeira sessão de adaptação. Baixa frequência de comportamentos disruptivos.</p>',
    'finalized',
    'Ana Paula Santos',
    'Psicólogo(a)',
    'CRP 12/11223'
  )
on conflict (id) do update set
  content_html = excluded.content_html,
  status = excluded.status,
  updated_at = now();

-- ---------------------------------------------------------------------------
-- 8. Planos terapêuticos e documentos do prontuário
-- ---------------------------------------------------------------------------
insert into public.therapeutic_plans (
  id, patient_id, title, goals_html, strategies_html,
  start_date, end_date, status, professional_name
)
values
  (
    '0a200001-0000-4000-8000-000000000001',
    'a0000001-0000-4000-8000-000000000001',
    'Plano ABA — Comunicação funcional',
    '<ul><li>Aumentar mandos espontâneos para 15 ocorrências/sessão</li><li>Generalizar tatos para ambiente escolar</li></ul>',
    '<ul><li>DTT para tatos</li><li>Reforço diferencial de baixo perfil</li></ul>',
    (current_date - interval '3 months')::date,
    (current_date + interval '3 months')::date,
    'active',
    'Dra. Carla Nogueira'
  )
on conflict (id) do nothing;

insert into public.patient_documents (
  id, patient_id, title, document_type, notes, uploaded_by
)
values
  (
    'd2000003-0000-4000-8000-000000000001',
    'a0000001-0000-4000-8000-000000000001',
    'Laudo neuropediátrico',
    'laudo',
    'Encaminhamento inicial TEA nível 2.',
    'Dr. Ricardo Almeida'
  ),
  (
    'd2000003-0000-4000-8000-000000000002',
    'a0000002-0000-4000-8000-000000000002',
    'Relatório escolar',
    'relatorio',
    'Adaptações curriculares sugeridas.',
    'Dra. Carla Nogueira'
  )
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- 9. Agenda (hoje + semana) — painel de chamada, financeiro, dashboard
-- ---------------------------------------------------------------------------
insert into public.agenda_events (
  id, patient_name, patient_id, professional_name, professional_user_id,
  event_date, start_time, end_time, status,
  valor_sessao, payment_status, payment_link_url,
  queue_number, room_name, called_at
)
values
  -- Hoje: sessões em andamento na recepção
  (
    'demo-apt-001',
    'Lucas Mendes',
    'a0000001-0000-4000-8000-000000000001',
    'Ana Paula Santos',
    'e1000003-0000-4000-8000-000000000003',
    current_date,
    '08:00',
    '08:50',
    'chamado',
    180.00,
    'pago',
    null,
    1,
    'Sala 2 — ABA',
    now() - interval '3 minutes'
  ),
  (
    'demo-apt-002',
    'Sofia Ribeiro',
    'a0000002-0000-4000-8000-000000000002',
    'Bruno Lima',
    'e1000004-0000-4000-8000-000000000004',
    current_date,
    '08:00',
    '08:50',
    'em_espera',
    150.00,
    'pendente',
    null,
    2,
    'Sala 1 — ABA',
    null
  ),
  (
    'demo-apt-003',
    'Gabriel Souza',
    'a0000005-0000-4000-8000-000000000005',
    'Ana Paula Santos',
    'e1000003-0000-4000-8000-000000000003',
    current_date,
    '09:00',
    '09:50',
    'em_espera',
    150.00,
    'pendente',
    null,
    3,
    'Sala 2 — ABA',
    null
  ),
  (
    'demo-apt-004',
    'Miguel Torres',
    'a0000003-0000-4000-8000-000000000003',
    'Dra. Carla Nogueira',
    'e1000002-0000-4000-8000-000000000002',
    current_date,
    '10:00',
    '10:50',
    'confirmado',
    200.00,
    'pendente',
    'https://checkout.stripe.com/demo-link-miguel',
    null,
    'Sala 3 — Supervisão',
    null
  ),
  (
    'demo-apt-005',
    'Fernanda Oliveira',
    'a0000004-0000-4000-8000-000000000004',
    'Bruno Lima',
    'e1000004-0000-4000-8000-000000000004',
    current_date,
    '11:00',
    '11:50',
    'agendado',
    150.00,
    'pendente',
    null,
    null,
    'Sala 1 — ABA',
    null
  ),
  -- Ontem: sessão concluída (dashboard)
  (
    'demo-apt-006',
    'Lucas Mendes',
    'a0000001-0000-4000-8000-000000000001',
    'Ana Paula Santos',
    'e1000003-0000-4000-8000-000000000003',
    (current_date - interval '1 day')::date,
    '14:00',
    '14:50',
    'confirmado',
    180.00,
    'pago',
    null,
    null,
    'Sala 2 — ABA',
    null
  ),
  -- Semana passada
  (
    'demo-apt-007',
    'Sofia Ribeiro',
    'a0000002-0000-4000-8000-000000000002',
    'Bruno Lima',
    'e1000004-0000-4000-8000-000000000004',
    (current_date - interval '5 days')::date,
    '09:00',
    '09:50',
    'confirmado',
    150.00,
    'pago',
    null,
    null,
    'Sala 1 — ABA',
    null
  ),
  -- Cancelado
  (
    'demo-apt-008',
    'Miguel Torres',
    'a0000003-0000-4000-8000-000000000003',
    'Ana Paula Santos',
    'e1000003-0000-4000-8000-000000000003',
    (current_date + interval '2 days')::date,
    '15:00',
    '15:50',
    'cancelado',
    150.00,
    'cancelado',
    null,
    null,
    null,
    null
  )
on conflict (id) do update set
  status = excluded.status,
  queue_number = excluded.queue_number,
  room_name = excluded.room_name,
  called_at = excluded.called_at,
  payment_status = excluded.payment_status,
  updated_at = now();

-- ---------------------------------------------------------------------------
-- 10. Auditoria da agenda
-- ---------------------------------------------------------------------------
insert into public.agenda_audit_logs (
  id, performed_at, user_name, user_profile, action_label,
  patient_name, from_description, to_description, appointment_id
)
values
  (
    'f2000001-0000-4000-8000-000000000001',
    now() - interval '10 minutes',
    'Mariana Costa',
    'RECEPCAO',
    'Status alterado',
    'Lucas Mendes',
    'Em espera',
    'Chamado — Sala 2',
    'demo-apt-001'
  ),
  (
    'f2000002-0000-4000-8000-000000000002',
    now() - interval '25 minutes',
    'Mariana Costa',
    'RECEPCAO',
    'Status alterado',
    'Sofia Ribeiro',
    'Confirmado',
    'Em espera — Senha 2',
    'demo-apt-002'
  ),
  (
    'f2000003-0000-4000-8000-000000000003',
    now() - interval '1 day',
    'Ana Paula Santos',
    'AT1',
    'Agendamento criado',
    'Gabriel Souza',
    '—',
    '09:00 com Ana Paula',
    'demo-apt-003'
  )
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- 11. Configurações globais da clínica
-- ---------------------------------------------------------------------------
insert into public.clinic_settings (
  id, nome_clinica, cnpj, endereco_completo, logo_url,
  stripe_api_key, mercado_pago_api_key
)
values (
  '00000000-0000-4000-8000-000000000001',
  'Nurse Care — Clínica Demo',
  '12345678000199',
  'Av. Jerônimo Monteiro, 1200 — Centro, Cachoeiro de Itapemirim — ES, 29300-000',
  null,
  'sk_test_demo_nurse_care_seed',
  'TEST-demo-mercadopago-access-token'
)
on conflict (id) do update set
  nome_clinica = excluded.nome_clinica,
  cnpj = excluded.cnpj,
  endereco_completo = excluded.endereco_completo,
  stripe_api_key = excluded.stripe_api_key,
  mercado_pago_api_key = excluded.mercado_pago_api_key,
  updated_at = now();

-- ---------------------------------------------------------------------------
-- 12. Comunicação interna (mensagens legadas)
-- ---------------------------------------------------------------------------
insert into public.internal_messages (
  id, sender_id, receiver_id, content, read_at
)
values
  (
    'd2000001-0000-4000-8000-000000000001',
    'e1000005-0000-4000-8000-000000000005',
    'e1000003-0000-4000-8000-000000000003',
    'Lucas Mendes chegou e está aguardando na recepção.',
    now() - interval '8 minutes'
  ),
  (
    'd2000002-0000-4000-8000-000000000002',
    'e1000003-0000-4000-8000-000000000003',
    'e1000005-0000-4000-8000-000000000005',
    'Obrigada! Já vou buscá-lo na Sala 2.',
    now() - interval '7 minutes'
  )
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- 13. Chat corporativo (direto + grupo)
-- ---------------------------------------------------------------------------
insert into public.chat_conversations (
  id, type, name, direct_pair_key, created_by
)
values
  (
    'c2000001-0000-4000-8000-000000000001',
    'direct',
    null,
    'e1000001-0000-4000-8000-000000000001:e1000002-0000-4000-8000-000000000002',
    'e1000001-0000-4000-8000-000000000001'
  ),
  (
    'c2000002-0000-4000-8000-000000000002',
    'group',
    'Equipe Clínica ABA',
    null,
    'e1000002-0000-4000-8000-000000000002'
  )
on conflict (id) do nothing;

insert into public.chat_conversation_members (conversation_id, user_id, role)
values
  ('c2000001-0000-4000-8000-000000000001', 'e1000001-0000-4000-8000-000000000001', 'owner'),
  ('c2000001-0000-4000-8000-000000000001', 'e1000002-0000-4000-8000-000000000002', 'member'),
  ('c2000002-0000-4000-8000-000000000002', 'e1000002-0000-4000-8000-000000000002', 'owner'),
  ('c2000002-0000-4000-8000-000000000002', 'e1000003-0000-4000-8000-000000000003', 'member'),
  ('c2000002-0000-4000-8000-000000000002', 'e1000004-0000-4000-8000-000000000004', 'member')
on conflict (conversation_id, user_id) do nothing;

insert into public.chat_messages (id, conversation_id, sender_id, content, created_at)
values
  (
    'c2000011-0000-4000-8000-000000000001',
    'c2000001-0000-4000-8000-000000000001',
    'e1000002-0000-4000-8000-000000000002',
    'Bom dia! Podemos revisar a evolução do Lucas hoje à tarde?',
    now() - interval '2 hours'
  ),
  (
    'c2000011-0000-4000-8000-000000000002',
    'c2000001-0000-4000-8000-000000000001',
    'e1000001-0000-4000-8000-000000000001',
    'Claro! Estou com o indicador VB-MAPP aberto para compararmos.',
    now() - interval '1 hour 50 minutes'
  ),
  (
    'c2000011-0000-4000-8000-000000000003',
    'c2000002-0000-4000-8000-000000000002',
    'e1000003-0000-4000-8000-000000000003',
    'Pessoal, lembrando da supervisão de casos às 16h.',
    now() - interval '30 minutes'
  ),
  (
    'c2000011-0000-4000-8000-000000000004',
    'c2000002-0000-4000-8000-000000000002',
    'e1000004-0000-4000-8000-000000000004',
    'Confirmado! Sofia teve ótima sessão ontem.',
    now() - interval '20 minutes'
  )
on conflict (id) do nothing;

-- Avisos do portal da família (Lucas Mendes)
insert into public.family_portal_notices (
  id, patient_id, title, content, author_name, is_published, created_at
)
values
  (
    'f3000001-0000-4000-8000-000000000001',
    'a0000001-0000-4000-8000-000000000001',
    'Lembrete de materiais',
    'Por favor, traga na próxima sessão a ficha de reforço que enviamos por e-mail na semana passada.',
    'Equipe Nurse Care',
    true,
    now() - interval '3 days'
  ),
  (
    'f3000002-0000-4000-8000-000000000002',
    'a0000001-0000-4000-8000-000000000001',
    'Reunião de feedback',
    'Agendamos uma conversa com a família na sexta-feira às 17h para alinhar os objetivos do próximo ciclo terapêutico.',
    'Dra. Carla Nogueira',
    true,
    now() - interval '1 day'
  )
on conflict (id) do nothing;

commit;

-- =============================================================================
-- COMO TESTAR CADA MÓDULO APÓS O SEED
-- =============================================================================
-- Login: admin@clinica.demo / Demo@1234
--
-- Dashboard          → /dashboard (métricas dos últimos 30 dias)
-- Aprendizes         → /prontuario (5 aprendizes cadastrados)
-- Prontuário         → /paciente/a0000001-.../prontuario (Lucas)
-- Profissionais      → /dashboard/profissionais (5 usuários demo)
-- Avaliações         → /dashboard/avaliacoes (VB-MAPP + templates migration)
-- Evolução Clínica   → /evolucao (login como at1@clinica.demo)
-- Modelos            → /dashboard/modelos (Unimed/pareceres da migration)
-- Indicadores        → /dashboard/relatorios (login admin/supervisor, filtro Lucas + VB-MAPP)
-- Agenda             → /agenda (eventos de hoje; login recepcao@clinica.demo)
-- Painel de Chamada  → /painel-chamada (Lucas chamado, Sofia/Gabriel em espera)
-- Busca de Agenda    → /dashboard/busca-agenda (login supervisor)
-- Chat               → /chat (conversas demo)
-- Auditoria          → /dashboard/auditoria (login admin)
-- Configurações      → /configuracoes (login admin)
-- Portal da Família  → /portal-familia (login familia@clinica.demo — responsável do Lucas)
-- =============================================================================
