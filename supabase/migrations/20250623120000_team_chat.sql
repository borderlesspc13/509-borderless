-- Chat interno estilo Teams: conversas diretas, grupos e mensagens em tempo real
-- Migration idempotente (segura para reexecutar)

create table if not exists public.chat_conversations (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  name text,
  direct_pair_key text,
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_chat_conversations_direct_pair_key
  on public.chat_conversations (direct_pair_key)
  where direct_pair_key is not null;

create index if not exists idx_chat_conversations_updated
  on public.chat_conversations (updated_at desc);

alter table public.chat_conversations
  drop constraint if exists chat_conversations_type_enum_check;

alter table public.chat_conversations
  add constraint chat_conversations_type_enum_check
  check (type in ('direct', 'group'));

alter table public.chat_conversations
  drop constraint if exists chat_conversations_type_check;

alter table public.chat_conversations
  add constraint chat_conversations_type_check check (
    (type = 'direct' and direct_pair_key is not null)
    or (type = 'group' and name is not null and char_length(trim(name)) > 0)
  );

create table if not exists public.chat_conversation_members (
  conversation_id uuid not null references public.chat_conversations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'member',
  joined_at timestamptz not null default now(),
  last_read_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

alter table public.chat_conversation_members
  drop constraint if exists chat_conversation_members_role_check;

alter table public.chat_conversation_members
  add constraint chat_conversation_members_role_check
  check (role in ('owner', 'member'));

create index if not exists idx_chat_members_user
  on public.chat_conversation_members (user_id);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.chat_conversations (id) on delete cascade,
  sender_id uuid not null references auth.users (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.chat_messages
  drop constraint if exists chat_messages_content_check;

alter table public.chat_messages
  add constraint chat_messages_content_check
  check (char_length(trim(content)) > 0);

create index if not exists idx_chat_messages_conversation
  on public.chat_messages (conversation_id, created_at desc);

-- Função auxiliar para RLS
create or replace function public.is_chat_conversation_member(p_conversation_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.chat_conversation_members
    where conversation_id = p_conversation_id
      and user_id = auth.uid()
  );
$$;

-- RLS
alter table public.chat_conversations enable row level security;
alter table public.chat_conversation_members enable row level security;
alter table public.chat_messages enable row level security;

drop policy if exists "Membros leem conversas" on public.chat_conversations;
create policy "Membros leem conversas"
  on public.chat_conversations
  for select
  to authenticated
  using (
    public.is_chat_conversation_member(id)
    or created_by = auth.uid()
  );

drop policy if exists "Usuários autenticados criam conversas" on public.chat_conversations;
create policy "Usuários autenticados criam conversas"
  on public.chat_conversations
  for insert
  to authenticated
  with check (auth.uid() = created_by);

drop policy if exists "Membros leem participantes" on public.chat_conversation_members;
create policy "Membros leem participantes"
  on public.chat_conversation_members
  for select
  to authenticated
  using (public.is_chat_conversation_member(conversation_id));

drop policy if exists "Usuários entram em conversas" on public.chat_conversation_members;
create policy "Usuários entram em conversas"
  on public.chat_conversation_members
  for insert
  to authenticated
  with check (
    auth.uid() = user_id
    or exists (
      select 1
      from public.chat_conversation_members existing
      where existing.conversation_id = chat_conversation_members.conversation_id
        and existing.user_id = auth.uid()
        and existing.role = 'owner'
    )
    or exists (
      select 1
      from public.chat_conversations conv
      where conv.id = chat_conversation_members.conversation_id
        and conv.created_by = auth.uid()
    )
  );

drop policy if exists "Membro atualiza própria leitura" on public.chat_conversation_members;
create policy "Membro atualiza própria leitura"
  on public.chat_conversation_members
  for update
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Membros leem mensagens" on public.chat_messages;
create policy "Membros leem mensagens"
  on public.chat_messages
  for select
  to authenticated
  using (public.is_chat_conversation_member(conversation_id));

drop policy if exists "Membros enviam mensagens" on public.chat_messages;
create policy "Membros enviam mensagens"
  on public.chat_messages
  for insert
  to authenticated
  with check (
    auth.uid() = sender_id
    and public.is_chat_conversation_member(conversation_id)
  );

-- Atualiza timestamp da conversa ao receber mensagem
create or replace function public.touch_chat_conversation_on_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.chat_conversations
  set updated_at = new.created_at
  where id = new.conversation_id;

  return new;
end;
$$;

drop trigger if exists on_chat_message_created on public.chat_messages;

create trigger on_chat_message_created
  after insert on public.chat_messages
  for each row
  execute function public.touch_chat_conversation_on_message();

-- Dependência: notificações internas (caso migrations anteriores não tenham sido aplicadas)
create table if not exists public.internal_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null,
  title text not null,
  body text not null,
  metadata jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_internal_notifications_user
  on public.internal_notifications (user_id, created_at desc);

create index if not exists idx_internal_notifications_unread
  on public.internal_notifications (user_id)
  where read_at is null;

alter table public.internal_notifications enable row level security;

drop policy if exists "Usuário lê as próprias notificações" on public.internal_notifications;
create policy "Usuário lê as próprias notificações"
  on public.internal_notifications
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Sistema insere notificações para usuários" on public.internal_notifications;
create policy "Sistema insere notificações para usuários"
  on public.internal_notifications
  for insert
  to authenticated
  with check (true);

drop policy if exists "Usuário marca notificação como lida" on public.internal_notifications;
create policy "Usuário marca notificação como lida"
  on public.internal_notifications
  for update
  to authenticated
  using (auth.uid() = user_id);

-- Notifica membros sobre novas mensagens no chat
alter table public.internal_notifications
  drop constraint if exists internal_notifications_type_check;

alter table public.internal_notifications
  add constraint internal_notifications_type_check
  check (type in ('patient_waiting', 'new_message', 'chat_message'));

create or replace function public.notify_members_on_chat_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  sender_name text;
  conversation_name text;
  conversation_type text;
begin
  select full_name into sender_name
  from public.user_profiles
  where id = new.sender_id;

  select type, name into conversation_type, conversation_name
  from public.chat_conversations
  where id = new.conversation_id;

  insert into public.internal_notifications (
    user_id,
    type,
    title,
    body,
    metadata
  )
  select
    member.user_id,
    'chat_message',
    case
      when conversation_type = 'group' then coalesce(conversation_name, 'Grupo')
      else 'Nova mensagem'
    end,
    coalesce(sender_name, 'Colega') || ': ' || left(new.content, 120),
    jsonb_build_object(
      'message_id', new.id,
      'conversation_id', new.conversation_id,
      'sender_id', new.sender_id,
      'conversation_type', conversation_type
    )
  from public.chat_conversation_members member
  where member.conversation_id = new.conversation_id
    and member.user_id <> new.sender_id;

  return new;
end;
$$;

drop trigger if exists on_chat_message_notify on public.chat_messages;

create trigger on_chat_message_notify
  after insert on public.chat_messages
  for each row
  execute function public.notify_members_on_chat_message();

-- Realtime
alter table public.chat_conversations replica identity full;
alter table public.chat_messages replica identity full;
alter table public.chat_conversation_members replica identity full;

do $$
begin
  alter publication supabase_realtime add table public.chat_conversations;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.chat_messages;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.chat_conversation_members;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.internal_notifications;
exception
  when duplicate_object then null;
end $$;

-- Funções para criar conversas diretas de forma atômica
create or replace function public.build_direct_pair_key(
  p_user_id_1 uuid,
  p_user_id_2 uuid
)
returns text
language sql
immutable
as $$
  select case
    when p_user_id_1::text < p_user_id_2::text
      then p_user_id_1::text || ':' || p_user_id_2::text
    else p_user_id_2::text || ':' || p_user_id_1::text
  end;
$$;

create or replace function public.get_or_create_direct_conversation(
  p_other_user_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current_user_id uuid := auth.uid();
  v_pair_key text;
  v_conversation_id uuid;
begin
  if v_current_user_id is null then
    raise exception 'Sessão inválida.';
  end if;

  if p_other_user_id = v_current_user_id then
    raise exception 'Não é possível iniciar chat consigo mesmo.';
  end if;

  if not exists (
    select 1
    from public.user_profiles
    where id = p_other_user_id
      and status = 'active'
  ) then
    raise exception 'Usuário não encontrado ou inativo.';
  end if;

  v_pair_key := public.build_direct_pair_key(v_current_user_id, p_other_user_id);

  select id
  into v_conversation_id
  from public.chat_conversations
  where direct_pair_key = v_pair_key;

  if v_conversation_id is null then
    insert into public.chat_conversations (
      type,
      direct_pair_key,
      created_by
    )
    values (
      'direct',
      v_pair_key,
      v_current_user_id
    )
    returning id into v_conversation_id;
  end if;

  insert into public.chat_conversation_members (conversation_id, user_id, role)
  values (v_conversation_id, v_current_user_id, 'owner')
  on conflict (conversation_id, user_id) do nothing;

  insert into public.chat_conversation_members (conversation_id, user_id, role)
  values (v_conversation_id, p_other_user_id, 'member')
  on conflict (conversation_id, user_id) do nothing;

  return v_conversation_id;
end;
$$;

revoke all on function public.get_or_create_direct_conversation(uuid) from public;
grant execute on function public.get_or_create_direct_conversation(uuid) to authenticated;

revoke all on function public.build_direct_pair_key(uuid, uuid) from public;
grant execute on function public.build_direct_pair_key(uuid, uuid) to authenticated;
