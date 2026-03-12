-- Fix for profiles table: ensure 'avatar_url' and other settings columns exist
DO $$ 
BEGIN
    -- avatar_url
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='avatar_url') THEN
        ALTER TABLE public.profiles ADD COLUMN avatar_url text;
    END IF;

    -- crn
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='crn') THEN
        ALTER TABLE public.profiles ADD COLUMN crn text;
    END IF;

    -- whatsapp_number
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='whatsapp_number') THEN
        ALTER TABLE public.profiles ADD COLUMN whatsapp_number text;
    END IF;

    -- whatsapp_message
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='whatsapp_message') THEN
        ALTER TABLE public.profiles ADD COLUMN whatsapp_message text;
    END IF;

    -- custom_theme
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='custom_theme') THEN
        ALTER TABLE public.profiles ADD COLUMN custom_theme text default 'light';
    END IF;

    -- custom_color
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='custom_color') THEN
        ALTER TABLE public.profiles ADD COLUMN custom_color text default '#06c2ae';
    END IF;

    -- google_calendar_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='google_calendar_id') THEN
        ALTER TABLE public.profiles ADD COLUMN google_calendar_id text;
    END IF;

    -- slug
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='slug') THEN
        ALTER TABLE public.profiles ADD COLUMN slug text UNIQUE;
    END IF;
END $$;

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
