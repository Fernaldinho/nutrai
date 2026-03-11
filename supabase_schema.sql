-- 1. Cria a tabela de perfis (profiles) ligada ao auth.users
create table public.profiles (
  id uuid not null references auth.users(id) on delete cascade primary key,
  name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Ativa o Row Level Security (RLS) para proteger a tabela
alter table public.profiles enable row level security;

-- 3. Cria a política para que o usuário possa VER apenas o próprio perfil
create policy "Usuários podem ver o próprio perfil"
  on public.profiles
  for select
  using ( auth.uid() = id );

-- Cria a política para que o usuário possa ATUALIZAR apenas o próprio perfil
create policy "Usuários podem atualizar o próprio perfil"
  on public.profiles
  for update
  using ( auth.uid() = id );

-- 4. Função que será executada automaticamente pelo Trigger (Security Definer ignora RLS para criação)
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  -- Pega o "nome" do raw_user_meta_data que enviamos no momento do signup no Next.js
  values (new.id, new.raw_user_meta_data->>'nome');
  return new;
end;
$$;

-- 5. Trigger que escuta a criação de usuários no auth.users e chama a função
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
