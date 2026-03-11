-- 1. Cria a tabela de pacientes
create table public.patients (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  birth_date date,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Ativa o Row Level Security (RLS) para proteger a tabela
alter table public.patients enable row level security;

-- 3. Políticas de Segurança (Policies)

-- A) O usuário pode LER (select) apenas os próprios pacientes
create policy "Usuários podem ver seus próprios pacientes"
  on public.patients
  for select
  using ( auth.uid() = user_id );

-- B) O usuário pode INSERIR (insert) pacientes apenas vinculados ao seu próprio user_id
create policy "Usuários podem criar pacientes vinculados ao próprio ID"
  on public.patients
  for insert
  with check ( auth.uid() = user_id );

-- C) O usuário pode ATUALIZAR (update) apenas os próprios pacientes
create policy "Usuários podem atualizar seus próprios pacientes"
  on public.patients
  for update
  using ( auth.uid() = user_id );

-- D) O usuário pode DELETAR (delete) apenas os próprios pacientes
create policy "Usuários podem deletar seus próprios pacientes"
  on public.patients
  for delete
  using ( auth.uid() = user_id );
