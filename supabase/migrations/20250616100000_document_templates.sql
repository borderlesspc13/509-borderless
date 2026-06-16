-- Biblioteca de modelos para documentos clínicos (evolução, relatórios, etc.).

create table if not exists public.document_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  body_html text not null default '',
  status text not null default 'active'
    check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_document_templates_status
  on public.document_templates (status);

create index if not exists idx_document_templates_category
  on public.document_templates (category);

create index if not exists idx_document_templates_name
  on public.document_templates (name);

alter table public.document_templates enable row level security;

create policy "Leitura de modelos de documento"
  on public.document_templates
  for select
  to authenticated
  using (true);

create policy "Gestão de modelos — supervisor ou admin"
  on public.document_templates
  for all
  to authenticated
  using (public.is_supervisor_or_admin())
  with check (public.is_supervisor_or_admin());

create policy "Leitura anônima de modelos em desenvolvimento"
  on public.document_templates
  for select
  to anon
  using (true);

create policy "Gestão anônima de modelos em desenvolvimento"
  on public.document_templates
  for all
  to anon
  using (true)
  with check (true);
