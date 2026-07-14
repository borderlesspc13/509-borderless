-- Tabela para gerenciar a aceitação de termos (ex: Termo de Responsabilidade)
create table if not exists public.user_terms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  term_type text not null, -- ex: 'responsabilidade'
  accepted_at timestamptz default now(),
  ip_address text,
  user_agent text
);

create index if not exists idx_user_terms_user on public.user_terms(user_id, term_type);

alter table public.user_terms enable row level security;

create policy "Usuários podem ver seus próprios termos"
  on public.user_terms
  for select
  using (auth.uid() = user_id);

create policy "Usuários podem inserir seus próprios termos"
  on public.user_terms
  for insert
  with check (auth.uid() = user_id);
