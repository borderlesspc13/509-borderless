-- Tipo de agendamento para filtros da agenda (ABA e Convencional).

alter table public.agenda_events
  add column if not exists appointment_type text
    check (
      appointment_type is null
      or appointment_type in (
        'avaliacao',
        'evolucao_diaria',
        'planejamento',
        'sessao',
        'supervisao',
        'suporte_escolar',
        'visita'
      )
    );

create index if not exists idx_agenda_events_appointment_type
  on public.agenda_events (appointment_type)
  where appointment_type is not null;

comment on column public.agenda_events.appointment_type is
  'Tipo do agendamento usado nos filtros da agenda (avaliação, sessão, etc.).';
