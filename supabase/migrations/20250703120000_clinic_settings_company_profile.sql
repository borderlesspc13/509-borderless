-- Perfil da empresa e configurações de agendamento.

alter table public.clinic_settings
  add column if not exists trade_name text,
  add column if not exists company_code text default '1190',
  add column if not exists plan_name text default 'Profissional',
  add column if not exists phone text,
  add column if not exists mobile_phone text,
  add column if not exists municipal_registration text,
  add column if not exists state_registration text,
  add column if not exists email text,
  add column if not exists contact_name text,
  add column if not exists website text,
  add column if not exists zip_code text,
  add column if not exists state text,
  add column if not exists city text,
  add column if not exists street text,
  add column if not exists neighborhood text,
  add column if not exists address_complement text,
  add column if not exists whatsapp_guardian_confirmation boolean not null default false,
  add column if not exists whatsapp_professional_notification boolean not null default false,
  add column if not exists appointment_notification_hours integer not null default 48;

alter table public.clinic_settings
  drop constraint if exists clinic_settings_notification_hours_check;

alter table public.clinic_settings
  add constraint clinic_settings_notification_hours_check
  check (appointment_notification_hours >= 1);
