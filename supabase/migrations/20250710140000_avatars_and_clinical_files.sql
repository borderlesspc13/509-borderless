-- Fotos de profissionais/aprendizes + permissões de storage para equipe clínica.

alter table public.user_profiles
  add column if not exists avatar_url text;

alter table public.patients
  add column if not exists avatar_url text;

comment on column public.user_profiles.avatar_url is
  'URL pública da foto do profissional.';

comment on column public.patients.avatar_url is
  'URL pública da foto do aprendiz.';

-- Amplia o bucket para documentos clínicos (PDF/Office) além de imagens.
update storage.buckets
set
  file_size_limit = 10485760,
  allowed_mime_types = array[
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/svg+xml',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ]
where id = 'clinic-assets';

drop policy if exists "Equipe faz upload de arquivos clínicos" on storage.objects;
drop policy if exists "Equipe atualiza arquivos clínicos" on storage.objects;
drop policy if exists "Equipe remove arquivos clínicos" on storage.objects;

create policy "Equipe faz upload de arquivos clínicos"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'clinic-assets'
    and not public.is_familia()
    and (
      name like 'avatars/%'
      or name like 'patient-documents/%'
      or name like 'program-files/%'
    )
  );

create policy "Equipe atualiza arquivos clínicos"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'clinic-assets'
    and not public.is_familia()
    and (
      name like 'avatars/%'
      or name like 'patient-documents/%'
      or name like 'program-files/%'
    )
  )
  with check (
    bucket_id = 'clinic-assets'
    and not public.is_familia()
    and (
      name like 'avatars/%'
      or name like 'patient-documents/%'
      or name like 'program-files/%'
    )
  );

create policy "Equipe remove arquivos clínicos"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'clinic-assets'
    and not public.is_familia()
    and (
      name like 'avatars/%'
      or name like 'patient-documents/%'
      or name like 'program-files/%'
    )
  );
