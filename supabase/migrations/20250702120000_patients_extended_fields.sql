-- Campos opcionais adicionais do cadastro de aprendizes.

alter table public.patients
  add column if not exists guardian_name_2 text,
  add column if not exists zip_code text,
  add column if not exists state text,
  add column if not exists city text,
  add column if not exists street text,
  add column if not exists neighborhood text,
  add column if not exists address_complement text,
  add column if not exists gender text,
  add column if not exists marital_status text,
  add column if not exists rg text,
  add column if not exists rg_issuer text,
  add column if not exists profession text,
  add column if not exists website text,
  add column if not exists birthplace text,
  add column if not exists contact text,
  add column if not exists phone text,
  add column if not exists health_plan text,
  add column if not exists health_plan_identifier text,
  add column if not exists support_level text;
