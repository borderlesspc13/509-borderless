-- Campos cadastrais e status para o fluxo de profissionais.

alter table public.user_profiles
  add column if not exists birth_date date,
  add column if not exists cpf text,
  add column if not exists status text not null default 'active'
    check (status in ('active', 'inactive'));

create index if not exists idx_user_profiles_status
  on public.user_profiles (status);

-- Amplia cargos clínicos exibidos no cadastro.
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

create or replace function public.is_supervisor_or_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select profile in ('ADMIN', 'SUPERVISOR') or is_master = true
      from public.user_profiles
      where id = auth.uid()
    ),
    false
  );
$$;

create policy "Gestão de perfis — supervisor ou admin"
  on public.user_profiles
  for update
  to authenticated
  using (public.is_supervisor_or_admin())
  with check (public.is_supervisor_or_admin());
