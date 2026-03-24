-- Patient segmentation columns for deeper content personalization

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS patient_intent_primary text
  CHECK (patient_intent_primary IN ('estetico','dor_sintoma','preventivo','cronico','premium','geral'));

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS patient_intent_secondary text
  CHECK (patient_intent_secondary IN ('estetico','dor_sintoma','preventivo','cronico','premium','geral'));

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS age_range text[];
