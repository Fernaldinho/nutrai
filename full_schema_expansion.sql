-- ==========================================
-- ESTRUTURA COMPLETA: NutriSaaS Expansion
-- ==========================================

-- 1. Tabela de Agendamentos (Appointments)
create table public.appointments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  date timestamp with time zone not null,
  status text check (status in ('pendente', 'confirmado', 'cancelado', 'concluido')) default 'pendente',
  notes text,
  created_at timestamp with time zone default now()
);

-- RLS: Appointments
alter table public.appointments enable row level security;
create policy "Ver próprios agendamentos" on public.appointments for select using (auth.uid() = user_id);
create policy "Criar agendamentos próprios" on public.appointments for insert with check (auth.uid() = user_id);
create policy "Atualizar próprios agendamentos" on public.appointments for update using (auth.uid() = user_id);
create policy "Deletar próprios agendamentos" on public.appointments for delete using (auth.uid() = user_id);

-- 2. Tabela de Pagamentos/Financeiro (Payments)
create table public.payments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  patient_id uuid references public.patients(id) on delete set null,
  amount decimal(10,2) not null,
  date date not null default current_date,
  category text default 'Consulta',
  status text check (status in ('pago', 'pendente')) default 'pendente',
  notes text,
  created_at timestamp with time zone default now()
);

-- RLS: Payments
alter table public.payments enable row level security;
create policy "Ver próprios pagamentos" on public.payments for select using (auth.uid() = user_id);
create policy "Registrar pagamentos próprios" on public.payments for insert with check (auth.uid() = user_id);
create policy "Atualizar pagamentos próprios" on public.payments for update using (auth.uid() = user_id);
create policy "Remover pagamentos próprios" on public.payments for delete using (auth.uid() = user_id);

-- 3. Tabela de Histórico/Prontuário (Medical Records)
create table public.medical_records (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  date timestamp with time zone default now(),
  content text not null,
  diagnosis text,
  created_at timestamp with time zone default now()
);

-- RLS: Medical Records
alter table public.medical_records enable row level security;
create policy "Ver histórico dos próprios pacientes" on public.medical_records for select using (auth.uid() = user_id);
create policy "Adicionar histórico para próprios pacientes" on public.medical_records for insert with check (auth.uid() = user_id);
create policy "Editar histórico próprio" on public.medical_records for update using (auth.uid() = user_id);
create policy "Deletar histórico próprio" on public.medical_records for delete using (auth.uid() = user_id);
