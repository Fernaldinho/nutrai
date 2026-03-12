-- Fix for appointments table: ensure 'date' column exists and matches the logic
DO $$ 
BEGIN
    -- Check if column 'date' exists in 'appointments'
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='appointments' AND column_name='date'
    ) THEN
        -- If it doesn't exist, we might have created it as something else or it's missing
        -- Based on the error, it's missing from schema cache which usually means it's missing from the table
        ALTER TABLE public.appointments ADD COLUMN date timestamp with time zone not null default now();
    END IF;
END $$;

-- Re-verify RLS and policies just in case
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Drop existing to avoid conflicts if they were partially created
DROP POLICY IF EXISTS "Ver próprios agendamentos" ON public.appointments;
DROP POLICY IF EXISTS "Criar agendamentos próprios" ON public.appointments;
DROP POLICY IF EXISTS "Atualizar próprios agendamentos" ON public.appointments;
DROP POLICY IF EXISTS "Deletar próprios agendamentos" ON public.appointments;

CREATE POLICY "Ver próprios agendamentos" on public.appointments for select using (auth.uid() = user_id);
CREATE POLICY "Criar agendamentos próprios" on public.appointments for insert with check (auth.uid() = user_id);
CREATE POLICY "Atualizar próprios agendamentos" on public.appointments for update using (auth.uid() = user_id);
CREATE POLICY "Deletar próprios agendamentos" on public.appointments for delete using (auth.uid() = user_id);

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
