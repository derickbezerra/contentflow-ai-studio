-- Trigger: dispara send-welcome imediatamente após INSERT em public.users
-- Requer: CRON_SECRET no Vault (mesmo valor dos Edge Function Secrets)

CREATE OR REPLACE FUNCTION public.handle_new_user_welcome()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_supabase_url  text;
  v_cron_secret   text;
  v_email         text;
BEGIN
  -- Lê secrets do Vault
  SELECT decrypted_secret INTO v_supabase_url
    FROM vault.decrypted_secrets WHERE name = 'SUPABASE_URL' LIMIT 1;

  SELECT decrypted_secret INTO v_cron_secret
    FROM vault.decrypted_secrets WHERE name = 'CRON_SECRET' LIMIT 1;

  -- Pega o email: usa o da tabela ou busca em auth.users como fallback
  v_email := NEW.email;
  IF v_email IS NULL THEN
    SELECT email INTO v_email FROM auth.users WHERE id = NEW.id;
  END IF;

  -- Só dispara se tiver email e secrets configurados
  IF v_email IS NOT NULL AND v_supabase_url IS NOT NULL AND v_cron_secret IS NOT NULL THEN
    PERFORM net.http_post(
      url     := v_supabase_url || '/functions/v1/send-welcome',
      headers := jsonb_build_object(
        'Content-Type',     'application/json',
        'x-webhook-secret', v_cron_secret
      ),
      body    := jsonb_build_object(
        'user_id', NEW.id::text,
        'email',   v_email
      )::text
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Remove trigger anterior se existir
DROP TRIGGER IF EXISTS on_user_created_send_welcome ON public.users;

CREATE TRIGGER on_user_created_send_welcome
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_welcome();
