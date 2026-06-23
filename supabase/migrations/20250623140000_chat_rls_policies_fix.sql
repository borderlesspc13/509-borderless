-- Corrige RLS do chat para inserts e leituras durante criação de conversas

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
  with check (
    auth.uid() is not null
    and created_by = auth.uid()
  );

drop policy if exists "Membros leem participantes" on public.chat_conversation_members;
create policy "Membros leem participantes"
  on public.chat_conversation_members
  for select
  to authenticated
  using (
    public.is_chat_conversation_member(conversation_id)
    or user_id = auth.uid()
    or exists (
      select 1
      from public.chat_conversations conv
      where conv.id = conversation_id
        and conv.created_by = auth.uid()
    )
  );

drop policy if exists "Usuários entram em conversas" on public.chat_conversation_members;
create policy "Usuários entram em conversas"
  on public.chat_conversation_members
  for insert
  to authenticated
  with check (
    auth.uid() is not null
    and (
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
    )
  );

drop policy if exists "Membros enviam mensagens" on public.chat_messages;
create policy "Membros enviam mensagens"
  on public.chat_messages
  for insert
  to authenticated
  with check (
    auth.uid() is not null
    and auth.uid() = sender_id
    and public.is_chat_conversation_member(conversation_id)
  );

-- Políticas de desenvolvimento (alinhado ao restante do projeto)
drop policy if exists "Gestão anônima de conversas em desenvolvimento" on public.chat_conversations;
create policy "Gestão anônima de conversas em desenvolvimento"
  on public.chat_conversations
  for all
  to anon
  using (true)
  with check (true);

drop policy if exists "Gestão anônima de membros em desenvolvimento" on public.chat_conversation_members;
create policy "Gestão anônima de membros em desenvolvimento"
  on public.chat_conversation_members
  for all
  to anon
  using (true)
  with check (true);

drop policy if exists "Gestão anônima de mensagens em desenvolvimento" on public.chat_messages;
create policy "Gestão anônima de mensagens em desenvolvimento"
  on public.chat_messages
  for all
  to anon
  using (true)
  with check (true);

notify pgrst, 'reload schema';
