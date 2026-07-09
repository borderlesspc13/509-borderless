-- Seed memória de treinamento para avaliações e tipos de relatório
insert into public.clinical_area_ai_memory (clinical_area, status)
values
  ('PEDI', 'not_started'),
  ('Perfil Sensorial II', 'not_started'),
  ('EBAI', 'not_started'),
  ('Relatório', 'not_started'),
  ('Parecer', 'not_started'),
  ('Encaminhamento', 'not_started'),
  ('Evolução clínica', 'not_started')
on conflict (clinical_area) do nothing;
