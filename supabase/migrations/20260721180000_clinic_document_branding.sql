-- Exposição segura dos dados institucionais para cabeçalho de documentos/PDFs.
-- Não inclui chaves de API nem campos sensíveis.

create or replace function public.get_clinic_document_branding()
returns table (
  nome_clinica text,
  trade_name text,
  cnpj text,
  endereco_completo text,
  street text,
  neighborhood text,
  city text,
  state text,
  zip_code text,
  address_complement text,
  phone text,
  mobile_phone text,
  email text,
  logo_url text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    cs.nome_clinica,
    cs.trade_name,
    cs.cnpj,
    cs.endereco_completo,
    cs.street,
    cs.neighborhood,
    cs.city,
    cs.state,
    cs.zip_code,
    cs.address_complement,
    cs.phone,
    cs.mobile_phone,
    cs.email,
    cs.logo_url
  from public.clinic_settings cs
  where cs.id = '00000000-0000-4000-8000-000000000001'::uuid
    and auth.uid() is not null
    and not public.is_familia();
$$;

revoke all on function public.get_clinic_document_branding() from public;
grant execute on function public.get_clinic_document_branding() to authenticated;

comment on function public.get_clinic_document_branding() is
  'Retorna dados públicos da clínica para cabeçalho de PDFs e documentos clínicos.';
