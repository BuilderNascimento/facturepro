-- Fase 0: endurecimento de segurança (RLS / grants / storage)

-- 1. invoice_items: remover policy aberta (qualquer autenticado via tudo).
--    Mantém-se "user_invoice_items" (isolamento por dono da fatura).
DROP POLICY IF EXISTS "auth_full_invoice_items" ON public.invoice_items;

-- 2. invoice_sequence (tabela global antiga, substituída por invoice_sequence_user)
DROP POLICY IF EXISTS "auth_full_invoice_sequence" ON public.invoice_sequence;

-- 3. subscriptions: ativar RLS. Utilizador só lê a própria linha;
--    escritas só via service role (webhook Stripe), que ignora RLS.
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_reads_own_subscription" ON public.subscriptions;
CREATE POLICY "user_reads_own_subscription" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- 4. Funções SECURITY DEFINER: só utilizadores autenticados
REVOKE EXECUTE ON FUNCTION public.get_next_invoice_number() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.peek_next_invoice_number() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_next_invoice_number() TO authenticated;
GRANT EXECUTE ON FUNCTION public.peek_next_invoice_number() TO authenticated;

-- 5. search_path fixo
ALTER FUNCTION public.update_updated_at() SET search_path = public;

-- 6. Bucket de PDFs privado (estava vazio e o código não o usa)
UPDATE storage.buckets SET public = false WHERE id = 'invoices';
