ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS onboarding_goal           text
    CHECK (onboarding_goal IN ('attract_patients', 'build_authority', 'increase_engagement')),
  ADD COLUMN IF NOT EXISTS onboarding_posts_per_week int
    CHECK (onboarding_posts_per_week BETWEEN 1 AND 21);
