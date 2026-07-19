-- Escala DEMUCA 2.0 — template de avaliação + contexto de AI writing

insert into public.assessment_templates (id, name, description, evaluation_type, status, created_at)
values (
  'b1000012-0000-4000-8000-000000000012',
  'DEMUCA',
  'Escala de Desenvolvimento Musical da Criança com Autismo (DEMUCA 2.0) — Oliveira, Freire & Parizzi. Seis categorias com classificação N/P/M.',
  'acquisition',
  'active',
  now()
)
on conflict (id) do nothing;

insert into public.clinical_area_ai_memory (clinical_area, status)
values ('DEMUCA', 'not_started')
on conflict (clinical_area) do nothing;
