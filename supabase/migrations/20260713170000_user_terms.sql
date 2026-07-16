-- Tabela para gerenciar a aceitação de termos (ex: Termo de Responsabilidade)
create table if not exists public.user_terms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  term_type text not null, -- ex: 'responsabilidade'
  accepted_at timestamptz default now(),
  ip_address text,
  user_agent text,
  unique (user_id, term_type)
);

create index if not exists idx_user_terms_user on public.user_terms(user_id, term_type);

alter table public.user_terms enable row level security;

drop policy if exists "Usuários podem ver seus próprios termos" on public.user_terms;
create policy "Usuários podem ver seus próprios termos"
  on public.user_terms
  for select
  using (auth.uid() = user_id);

drop policy if exists "Usuários podem inserir seus próprios termos" on public.user_terms;
create policy "Usuários podem inserir seus próprios termos"
  on public.user_terms
  for insert
  with check (auth.uid() = user_id);

grant select, insert on public.user_terms to authenticated;
grant all on public.user_terms to service_role;
