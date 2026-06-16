-- Campos financeiros integrados aos agendamentos.

alter table public.agenda_events
  add column if not exists valor_sessao numeric(10, 2),
  add column if not exists payment_status text not null default 'pendente'
    check (payment_status in ('pendente', 'pago', 'cancelado')),
  add column if not exists payment_link_url text;

create index if not exists idx_agenda_events_payment_status
  on public.agenda_events (payment_status);

comment on column public.agenda_events.valor_sessao is 'Valor cobrado pela sessão (BRL).';
comment on column public.agenda_events.payment_status is 'Situação do pagamento da sessão.';
comment on column public.agenda_events.payment_link_url is 'URL do link de pagamento gerado pelo provedor.';
