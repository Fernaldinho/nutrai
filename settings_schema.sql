-- Adiciona colunas ao profile
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS avatar_url text,
ADD COLUMN IF NOT EXISTS crn text,
ADD COLUMN IF NOT EXISTS signature_plan text default 'Gratuito',
ADD COLUMN IF NOT EXISTS credits integer default 0,
ADD COLUMN IF NOT EXISTS whatsapp_number text,
ADD COLUMN IF NOT EXISTS whatsapp_message text,
ADD COLUMN IF NOT EXISTS custom_theme text default 'light',
ADD COLUMN IF NOT EXISTS custom_color text default '#06c2ae';

-- Cria tabela de Locais
CREATE TABLE IF NOT EXISTS public.locations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  address text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ativa RLS para Locais
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Usuários podem ver seus próprios locais" ON public.locations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem criar seus locais" ON public.locations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuários podem atualizar seus locais" ON public.locations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem deletar seus locais" ON public.locations FOR DELETE USING (auth.uid() = user_id);
