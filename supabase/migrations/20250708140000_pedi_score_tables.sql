-- =============================================================================
-- PEDI — tabelas de conversão de escores (Functional Skills)
-- =============================================================================
-- ATENÇÃO: os valores inseridos abaixo são FICTÍCIOS / ILUSTRATIVOS, apenas
-- para exercitar o motor de cálculo (lookup bruto→contínuo e normativo por
-- idade). Substituir pelas tabelas oficiais do manual PEDI antes de uso clínico.
-- =============================================================================

create table if not exists public.pedi_continuous_scores (
  id uuid primary key default gen_random_uuid(),
  area text not null
    check (area in ('self_care', 'mobility', 'social_function')),
  raw_score integer not null check (raw_score >= 0),
  continuous_score numeric(6, 2) not null,
  created_at timestamptz not null default now(),
  unique (area, raw_score)
);

create index if not exists idx_pedi_continuous_area_raw
  on public.pedi_continuous_scores (area, raw_score);

create table if not exists public.pedi_normative_scores (
  id uuid primary key default gen_random_uuid(),
  area text not null
    check (area in ('self_care', 'mobility', 'social_function')),
  age_months_min integer not null check (age_months_min >= 0),
  age_months_max integer not null check (age_months_max >= age_months_min),
  raw_score integer not null check (raw_score >= 0),
  normative_score numeric(6, 2) not null,
  created_at timestamptz not null default now(),
  unique (area, age_months_min, age_months_max, raw_score)
);

create index if not exists idx_pedi_normative_area_age_raw
  on public.pedi_normative_scores (area, age_months_min, age_months_max, raw_score);

comment on table public.pedi_continuous_scores is
  'Conversão Escore Bruto → Escore Contínuo PEDI (seed fictício — substituir por tabela oficial).';

comment on table public.pedi_normative_scores is
  'Conversão Escore Bruto + faixa etária → Escore Normativo PEDI (seed fictício — substituir por tabela oficial).';

alter table public.pedi_continuous_scores enable row level security;
alter table public.pedi_normative_scores enable row level security;

drop policy if exists "Leitura de escores contínuos PEDI" on public.pedi_continuous_scores;
create policy "Leitura de escores contínuos PEDI"
  on public.pedi_continuous_scores for select to authenticated using (true);

drop policy if exists "Gestão de escores contínuos PEDI — supervisor ou admin"
  on public.pedi_continuous_scores;
create policy "Gestão de escores contínuos PEDI — supervisor ou admin"
  on public.pedi_continuous_scores for all to authenticated
  using (public.is_supervisor_or_admin())
  with check (public.is_supervisor_or_admin());

drop policy if exists "Leitura de escores normativos PEDI" on public.pedi_normative_scores;
create policy "Leitura de escores normativos PEDI"
  on public.pedi_normative_scores for select to authenticated using (true);

drop policy if exists "Gestão de escores normativos PEDI — supervisor ou admin"
  on public.pedi_normative_scores;
create policy "Gestão de escores normativos PEDI — supervisor ou admin"
  on public.pedi_normative_scores for all to authenticated
  using (public.is_supervisor_or_admin())
  with check (public.is_supervisor_or_admin());


-- ---------------------------------------------------------------------------
-- Seed fictício: contínuo interpolado 0 → 100 por área
-- ---------------------------------------------------------------------------
insert into public.pedi_continuous_scores (area, raw_score, continuous_score)
select
  area,
  raw_score,
  round((raw_score::numeric / max_raw) * 100, 2) as continuous_score
from (
  values
    ('self_care'::text, 73),
    ('mobility', 59),
    ('social_function', 65)
) as areas(area, max_raw)
cross join lateral generate_series(0, max_raw) as raw_score
on conflict (area, raw_score) do nothing;

-- ---------------------------------------------------------------------------
-- Seed fictício: normativo por faixas de 6 meses (6–90) + amostra de raw
-- ---------------------------------------------------------------------------
-- Escala ilustrativa ~10–90; extremos <10 e >90 usados pelo motor como piso/teto.
insert into public.pedi_normative_scores (
  area,
  age_months_min,
  age_months_max,
  raw_score,
  normative_score
)
select
  area,
  age_min,
  age_max,
  raw_score,
  greatest(
    5,
    least(
      105,
      round(
        10
        + (raw_score::numeric / max_raw) * 80
        - ((age_min - 6)::numeric / 84) * 15
        + (case when raw_score = 0 then -5 else 0 end)
        + (case when raw_score = max_raw then 15 else 0 end),
        2
      )
    )
  ) as normative_score
from (
  values
    ('self_care'::text, 73),
    ('mobility', 59),
    ('social_function', 65)
) as areas(area, max_raw)
cross join lateral (
  select gs as age_min, gs + 5 as age_max
  from generate_series(6, 90, 6) as gs
) as age_bands
cross join lateral (
  select distinct r as raw_score
  from unnest(
    array[
      0,
      greatest(1, max_raw / 10),
      greatest(2, max_raw / 5),
      greatest(3, max_raw / 4),
      greatest(4, max_raw / 3),
      max_raw / 2,
      (max_raw * 2) / 3,
      (max_raw * 3) / 4,
      (max_raw * 4) / 5,
      (max_raw * 9) / 10,
      max_raw
    ]
  ) as r
) as raws
on conflict (area, age_months_min, age_months_max, raw_score) do nothing;
