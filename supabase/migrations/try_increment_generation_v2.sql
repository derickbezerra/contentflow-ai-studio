-- Atualiza try_increment_generation para incluir reset mensal server-side.
-- Executar em: https://supabase.com/dashboard/project/yaxobfplnbbthkbspyal/sql

CREATE OR REPLACE FUNCTION try_increment_generation(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_plan           text;
  v_count          integer;
  v_reset_at       timestamptz;
  v_trial_ends_at  timestamptz;
  v_payment_status text;
  v_limit          integer;
  v_now            timestamptz := now();
  v_next_reset     timestamptz;
BEGIN
  -- Lock row to prevent race conditions
  SELECT plan, generation_count, generation_reset_at, trial_ends_at, payment_status
  INTO v_plan, v_count, v_reset_at, v_trial_ends_at, v_payment_status
  FROM users
  WHERE id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'user_not_found');
  END IF;

  -- Reset mensal server-side: se já passou da data de reset, zeramos o contador
  IF v_reset_at IS NOT NULL AND v_now > v_reset_at THEN
    v_next_reset := date_trunc('month', v_now) + interval '1 month';
    UPDATE users
    SET generation_count = 0, generation_reset_at = v_next_reset
    WHERE id = p_user_id;
    v_count := 0;
  END IF;

  -- Bloqueio: trial expirado
  IF v_plan = 'free' AND (v_trial_ends_at IS NULL OR v_now >= v_trial_ends_at) THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'trial_expired');
  END IF;

  -- Bloqueio: pagamento em atraso
  IF v_plan != 'free' AND v_payment_status = 'past_due' THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'payment_failed');
  END IF;

  -- Limite por plano
  v_limit := CASE v_plan
    WHEN 'free'      THEN 5
    WHEN 'starter'   THEN 10
    WHEN 'growth'    THEN 30
    WHEN 'pro'       THEN 100
    ELSE 5
  END;

  IF v_count >= v_limit THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'limit_reached');
  END IF;

  -- Incrementa e retorna
  UPDATE users SET generation_count = v_count + 1 WHERE id = p_user_id;
  RETURN jsonb_build_object('allowed', true, 'new_count', v_count + 1);
END;
$$;
