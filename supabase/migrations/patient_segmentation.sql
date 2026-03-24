ALTER TABLE public.users ADD COLUMN IF NOT EXISTS patient_intent_primary text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS patient_intent_secondary text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS age_range text[];
