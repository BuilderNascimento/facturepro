-- Fase 2: dados fiscais (aditivo; nenhuma coluna existente é alterada)

-- 1. Empresa emitente
ALTER TABLE public.company_settings
  ADD COLUMN IF NOT EXISTS siren TEXT,
  ADD COLUMN IF NOT EXISTS country_code TEXT NOT NULL DEFAULT 'FR',
  ADD COLUMN IF NOT EXISTS vat_regime TEXT,
  ADD COLUMN IF NOT EXISTS vat_on_debits BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE public.company_settings DROP CONSTRAINT IF EXISTS company_settings_vat_regime_check;
ALTER TABLE public.company_settings ADD CONSTRAINT company_settings_vat_regime_check
  CHECK (vat_regime IS NULL OR vat_regime IN ('franchise', 'real_simplified', 'real_normal'));
ALTER TABLE public.company_settings DROP CONSTRAINT IF EXISTS company_settings_siren_check;
ALTER TABLE public.company_settings ADD CONSTRAINT company_settings_siren_check
  CHECK (siren IS NULL OR siren ~ '^\d{9}$');
ALTER TABLE public.company_settings DROP CONSTRAINT IF EXISTS company_settings_country_code_check;
ALTER TABLE public.company_settings ADD CONSTRAINT company_settings_country_code_check
  CHECK (country_code ~ '^[A-Z]{2}$');

-- SIREN = 9 primeiros dígitos do SIRET (dados existentes têm 14 dígitos válidos)
UPDATE public.company_settings
SET siren = left(regexp_replace(siret, '\s', '', 'g'), 9)
WHERE siren IS NULL AND regexp_replace(coalesce(siret, ''), '\s', '', 'g') ~ '^\d{14}$';

-- 2. Clientes
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS client_type TEXT NOT NULL DEFAULT 'business',
  ADD COLUMN IF NOT EXISTS country_code TEXT NOT NULL DEFAULT 'FR',
  ADD COLUMN IF NOT EXISTS postal_code TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS siren TEXT;

ALTER TABLE public.clients DROP CONSTRAINT IF EXISTS clients_client_type_check;
ALTER TABLE public.clients ADD CONSTRAINT clients_client_type_check
  CHECK (client_type IN ('business', 'individual'));
ALTER TABLE public.clients DROP CONSTRAINT IF EXISTS clients_siren_check;
ALTER TABLE public.clients ADD CONSTRAINT clients_siren_check
  CHECK (siren IS NULL OR siren ~ '^\d{9}$');
ALTER TABLE public.clients DROP CONSTRAINT IF EXISTS clients_country_code_check;
ALTER TABLE public.clients ADD CONSTRAINT clients_country_code_check
  CHECK (country_code ~ '^[A-Z]{2}$');

UPDATE public.clients
SET siren = left(regexp_replace(siret, '\s', '', 'g'), 9)
WHERE siren IS NULL AND regexp_replace(coalesce(siret, ''), '\s', '', 'g') ~ '^\d{14}$';

-- 3. Faturas: categoria da operação e motivo de isenção
ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS operation_category TEXT NOT NULL DEFAULT 'services',
  ADD COLUMN IF NOT EXISTS vat_exemption_reason TEXT;

ALTER TABLE public.invoices DROP CONSTRAINT IF EXISTS invoices_operation_category_check;
ALTER TABLE public.invoices ADD CONSTRAINT invoices_operation_category_check
  CHECK (operation_category IN ('services', 'goods', 'mixed'));

-- 4. Linhas: taxa de TVA por linha (NULL = usa a taxa da fatura)
ALTER TABLE public.invoice_items
  ADD COLUMN IF NOT EXISTS tva_rate NUMERIC(5,2);
ALTER TABLE public.invoice_items DROP CONSTRAINT IF EXISTS invoice_items_tva_rate_check;
ALTER TABLE public.invoice_items ADD CONSTRAINT invoice_items_tva_rate_check
  CHECK (tva_rate IS NULL OR (tva_rate >= 0 AND tva_rate <= 100));

-- 5. Imutabilidade: novos campos fiscais da fatura também ficam bloqueados após emissão
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
       OR NEW.credit_reason IS DISTINCT FROM OLD.credit_reason
       OR NEW.operation_category IS DISTINCT FROM OLD.operation_category
       OR NEW.vat_exemption_reason IS DISTINCT FROM OLD.vat_exemption_reason THEN
      RAISE EXCEPTION 'Fatura emitida não pode ser alterada. Crie uma nota de crédito.' USING ERRCODE = 'P0001';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
