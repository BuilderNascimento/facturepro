-- Fase 1: imutabilidade de faturas emitidas, notas de crédito (avoirs) e auditoria
-- "Emitida" = status <> 'draft'.

-- 1. Colunas de nota de crédito
ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS document_type TEXT NOT NULL DEFAULT 'invoice',
  ADD COLUMN IF NOT EXISTS credited_invoice_id UUID REFERENCES public.invoices(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS credit_reason TEXT;

ALTER TABLE public.invoices DROP CONSTRAINT IF EXISTS invoices_document_type_check;
ALTER TABLE public.invoices ADD CONSTRAINT invoices_document_type_check
  CHECK (document_type IN ('invoice', 'credit_note'));

ALTER TABLE public.invoices DROP CONSTRAINT IF EXISTS invoices_credit_note_ref_check;
ALTER TABLE public.invoices ADD CONSTRAINT invoices_credit_note_ref_check
  CHECK ((document_type = 'credit_note') = (credited_invoice_id IS NOT NULL));

-- Uma única nota de crédito (total) por fatura
CREATE UNIQUE INDEX IF NOT EXISTS invoices_one_credit_note_per_invoice
  ON public.invoices (credited_invoice_id) WHERE document_type = 'credit_note';
CREATE INDEX IF NOT EXISTS idx_invoices_credited_invoice_id ON public.invoices (credited_invoice_id);

-- 2. Faturas emitidas: campos fiscais imutáveis, sem apagar
CREATE OR REPLACE FUNCTION public.invoices_enforce_immutability()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.status <> 'draft' THEN
      RAISE EXCEPTION 'Fatura emitida não pode ser apagada. Crie uma nota de crédito.' USING ERRCODE = 'P0001';
    END IF;
    RETURN OLD;
  END IF;

  -- UPDATE
  IF OLD.status <> 'draft' THEN
    IF NEW.status = 'draft' THEN
      RAISE EXCEPTION 'Fatura emitida não pode voltar a rascunho.' USING ERRCODE = 'P0001';
    END IF;
    IF NEW.deleted_at IS DISTINCT FROM OLD.deleted_at THEN
      RAISE EXCEPTION 'Fatura emitida não pode ser apagada. Crie uma nota de crédito.' USING ERRCODE = 'P0001';
    END IF;
    IF NEW.invoice_number IS DISTINCT FROM OLD.invoice_number
       OR NEW.user_id IS DISTINCT FROM OLD.user_id
       OR NEW.client_id IS DISTINCT FROM OLD.client_id
       OR NEW.issue_date IS DISTINCT FROM OLD.issue_date
       OR NEW.due_date IS DISTINCT FROM OLD.due_date
       OR NEW.description IS DISTINCT FROM OLD.description
       OR NEW.tva_rate IS DISTINCT FROM OLD.tva_rate
       OR NEW.total_ht IS DISTINCT FROM OLD.total_ht
       OR NEW.total_tva IS DISTINCT FROM OLD.total_tva
       OR NEW.total_ttc IS DISTINCT FROM OLD.total_ttc
       OR NEW.document_type IS DISTINCT FROM OLD.document_type
       OR NEW.credited_invoice_id IS DISTINCT FROM OLD.credited_invoice_id
       OR NEW.credit_reason IS DISTINCT FROM OLD.credit_reason THEN
      RAISE EXCEPTION 'Fatura emitida não pode ser alterada. Crie uma nota de crédito.' USING ERRCODE = 'P0001';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS invoices_immutability ON public.invoices;
CREATE TRIGGER invoices_immutability
  BEFORE UPDATE OR DELETE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.invoices_enforce_immutability();

-- 3. Linhas: só editáveis enquanto a fatura é rascunho
CREATE OR REPLACE FUNCTION public.invoice_items_enforce_immutability()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_status TEXT;
  v_invoice UUID;
BEGIN
  v_invoice := CASE WHEN TG_OP = 'DELETE' THEN OLD.invoice_id ELSE NEW.invoice_id END;
  SELECT status INTO v_status FROM public.invoices WHERE id = v_invoice;
  -- v_status nulo = fatura já removida (cascade de rascunho) ou inexistente
  IF v_status IS NOT NULL AND v_status <> 'draft' THEN
    RAISE EXCEPTION 'Linhas de fatura emitida não podem ser alteradas. Crie uma nota de crédito.' USING ERRCODE = 'P0001';
  END IF;
  IF TG_OP = 'UPDATE' AND NEW.invoice_id IS DISTINCT FROM OLD.invoice_id THEN
    RAISE EXCEPTION 'Linha não pode mudar de fatura.' USING ERRCODE = 'P0001';
  END IF;
  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$;

DROP TRIGGER IF EXISTS invoice_items_immutability ON public.invoice_items;
CREATE TRIGGER invoice_items_immutability
  BEFORE INSERT OR UPDATE OR DELETE ON public.invoice_items
  FOR EACH ROW EXECUTE FUNCTION public.invoice_items_enforce_immutability();

-- 4. Auditoria append-only
CREATE TABLE IF NOT EXISTS public.invoice_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL,
  user_id UUID,
  actor_id UUID,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_invoice_audit_log_invoice ON public.invoice_audit_log (invoice_id, created_at);
CREATE INDEX IF NOT EXISTS idx_invoice_audit_log_user ON public.invoice_audit_log (user_id);

ALTER TABLE public.invoice_audit_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_reads_own_invoice_audit" ON public.invoice_audit_log;
CREATE POLICY "user_reads_own_invoice_audit" ON public.invoice_audit_log
  FOR SELECT USING (auth.uid() = user_id);
REVOKE ALL ON public.invoice_audit_log FROM anon, authenticated;
GRANT SELECT ON public.invoice_audit_log TO authenticated;

CREATE OR REPLACE FUNCTION public.invoices_audit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.invoice_audit_log (invoice_id, user_id, actor_id, action, old_data)
    VALUES (OLD.id, OLD.user_id, auth.uid(), 'DELETE', to_jsonb(OLD));
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.invoice_audit_log (invoice_id, user_id, actor_id, action, old_data, new_data)
    VALUES (NEW.id, NEW.user_id, auth.uid(), 'UPDATE', to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSE
    INSERT INTO public.invoice_audit_log (invoice_id, user_id, actor_id, action, new_data)
    VALUES (NEW.id, NEW.user_id, auth.uid(), 'INSERT', to_jsonb(NEW));
    RETURN NEW;
  END IF;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.invoices_audit() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS invoices_audit_trg ON public.invoices;
CREATE TRIGGER invoices_audit_trg
  AFTER INSERT OR UPDATE OR DELETE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.invoices_audit();

CREATE OR REPLACE FUNCTION public.audit_log_append_only()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RAISE EXCEPTION 'invoice_audit_log é append-only' USING ERRCODE = 'P0001';
END;
$$;
DROP TRIGGER IF EXISTS invoice_audit_log_append_only ON public.invoice_audit_log;
CREATE TRIGGER invoice_audit_log_append_only
  BEFORE UPDATE OR DELETE ON public.invoice_audit_log
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_append_only();
