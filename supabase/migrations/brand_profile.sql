-- Brand profile columns on users table (1-to-1, no separate table needed)
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS brand_name   text,          -- nome do profissional/clínica
  ADD COLUMN IF NOT EXISTS brand_tone   text           -- formal | informal | empatico
    CHECK (brand_tone IN ('formal', 'informal', 'empatico')),
  ADD COLUMN IF NOT EXISTS brand_bio    text;          -- bio resumida (máx 300 chars)
