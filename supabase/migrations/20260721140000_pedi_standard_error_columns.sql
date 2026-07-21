-- =============================================================================
-- PEDI — estrutura Fase 2: erro padrão nas tabelas de conversão
-- =============================================================================
-- Colunas nullable até o seed das tabelas oficiais do manual (Excel/PDF do
-- cliente). O motor de cálculo e a UI já leem `standard_error` quando presente.
-- =============================================================================

alter table public.pedi_continuous_scores
  add column if not exists standard_error numeric(6, 2);

alter table public.pedi_normative_scores
  add column if not exists standard_error numeric(6, 2);

comment on column public.pedi_continuous_scores.standard_error is
  'Erro padrão do escore contínuo (manual PEDI). Null até seed oficial.';

comment on column public.pedi_normative_scores.standard_error is
  'Erro padrão do escore normativo (manual PEDI). Null até seed oficial.';

comment on table public.pedi_continuous_scores is
  'Conversão Escore Bruto → Escore Contínuo + EP PEDI. Seed atual ainda ilustrativo — substituir por tabela oficial.';

comment on table public.pedi_normative_scores is
  'Conversão Escore Bruto + faixa etária → Escore Normativo + EP PEDI. Seed atual ainda ilustrativo — substituir por tabela oficial. Normativo aplica-se até 7 anos (84 meses).';
