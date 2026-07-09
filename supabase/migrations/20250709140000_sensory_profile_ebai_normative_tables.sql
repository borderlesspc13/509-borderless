-- =============================================================================
-- Perfil Sensorial II + EBAI — tabelas normativas
-- =============================================================================
-- ATENÇÃO: valores fictícios/ilustrativos. Substituir pelas tabelas oficiais
-- dos manuais antes de uso clínico.
-- =============================================================================

create table if not exists public.sensory_profile_normative_table (
  id uuid primary key default gen_random_uuid(),
  age_band text not null
    check (age_band in ('infant_0_6m', 'toddler_7_35m', 'child_3_14y', 'school')),
  quadrant text not null
    check (quadrant in ('seeking', 'avoiding', 'sensitivity', 'registration')),
  mean_score numeric(8, 2) not null,
  sd_score numeric(8, 2) not null check (sd_score > 0),
  typical_max_sd numeric(4, 2) not null default 1.0,
  definite_min_sd numeric(4, 2) not null default 2.0,
  created_at timestamptz not null default now(),
  unique (age_band, quadrant)
);

create index if not exists idx_sensory_profile_normative_band_quadrant
  on public.sensory_profile_normative_table (age_band, quadrant);

comment on table public.sensory_profile_normative_table is
  'Normas do Perfil Sensorial II por faixa etária e quadrante (seed fictício).';

create table if not exists public.ebai_normative_table (
  id uuid primary key default gen_random_uuid(),
  raw_score integer not null check (raw_score > 0),
  t_score integer not null check (t_score between 20 and 100),
  classification text not null
    check (classification in ('leve', 'moderado', 'severo')),
  created_at timestamptz not null default now(),
  unique (raw_score)
);

create index if not exists idx_ebai_normative_raw
  on public.ebai_normative_table (raw_score);

comment on table public.ebai_normative_table is
  'Conversão Escore Bruto → Escore T e classificação EBAI (seed fictício).';

alter table public.sensory_profile_normative_table enable row level security;
alter table public.ebai_normative_table enable row level security;

drop policy if exists "Leitura normas Perfil Sensorial II" on public.sensory_profile_normative_table;
create policy "Leitura normas Perfil Sensorial II"
  on public.sensory_profile_normative_table for select to authenticated using (true);

drop policy if exists "Gestão normas Perfil Sensorial II — supervisor ou admin"
  on public.sensory_profile_normative_table;
create policy "Gestão normas Perfil Sensorial II — supervisor ou admin"
  on public.sensory_profile_normative_table for all to authenticated
  using (public.is_supervisor_or_admin())
  with check (public.is_supervisor_or_admin());

drop policy if exists "Leitura normas EBAI" on public.ebai_normative_table;
create policy "Leitura normas EBAI"
  on public.ebai_normative_table for select to authenticated using (true);

drop policy if exists "Gestão normas EBAI — supervisor ou admin" on public.ebai_normative_table;
create policy "Gestão normas EBAI — supervisor ou admin"
  on public.ebai_normative_table for all to authenticated
  using (public.is_supervisor_or_admin())
  with check (public.is_supervisor_or_admin());

-- ---------------------------------------------------------------------------
-- Seed Perfil Sensorial II: 4 faixas × 4 quadrantes
-- ---------------------------------------------------------------------------
insert into public.sensory_profile_normative_table (
  age_band, quadrant, mean_score, sd_score, typical_max_sd, definite_min_sd
)
select
  band.age_band,
  quad.quadrant,
  quad.base_mean
    + case band.age_band
        when 'infant_0_6m' then 2
        when 'toddler_7_35m' then 4
        when 'child_3_14y' then 8
        else 12
      end as mean_score,
  quad.base_sd as sd_score,
  1.0,
  2.0
from (
  values
    ('infant_0_6m'::text),
    ('toddler_7_35m'),
    ('child_3_14y'),
    ('school')
) as band(age_band)
cross join (
  values
    ('seeking'::text, 18.0::numeric, 5.0::numeric),
    ('avoiding', 14.0, 4.5),
    ('sensitivity', 16.0, 4.8),
    ('registration', 12.0, 4.0)
) as quad(quadrant, base_mean, base_sd)
on conflict (age_band, quadrant) do nothing;

-- ---------------------------------------------------------------------------
-- Seed EBAI: escore bruto 35–245 (35 itens × 1–7)
-- ---------------------------------------------------------------------------
insert into public.ebai_normative_table (raw_score, t_score, classification)
select
  raw_score,
  least(80, greatest(30, 30 + round((raw_score - 35)::numeric * 0.22)))::integer as t_score,
  case
    when raw_score < 90 then 'leve'
    when raw_score < 140 then 'moderado'
    else 'severo'
  end as classification
from generate_series(35, 245) as raw_score
on conflict (raw_score) do nothing;

-- ---------------------------------------------------------------------------
-- Templates de avaliação
-- ---------------------------------------------------------------------------
insert into public.assessment_templates (id, name, description, evaluation_type, status, created_at)
values
  (
    'b1000010-0000-4000-8000-000000000010',
    'Perfil Sensorial II',
    'Perfil de processamento sensorial com quadrantes Busca, Esquiva, Sensibilidade e Registro (T.O.).',
    'acquisition',
    'active',
    now()
  ),
  (
    'b1000011-0000-4000-8000-000000000011',
    'EBAI',
    'Escala Brasileira de Avaliação Infantil — conversão de escore bruto para Escore T.',
    'acquisition',
    'active',
    now()
  )
on conflict (id) do nothing;
