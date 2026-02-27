-- FacturePro - Schema Supabase
-- Executar no SQL Editor do Supabase

-- Extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela: company_settings (uma única linha por projeto)
CREATE TABLE company_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name TEXT NOT NULL,
  legal_status TEXT,
  siret TEXT,
  address TEXT,
  email TEXT,
  phone TEXT,
  iban TEXT,
  bic TEXT,
  vat_number TEXT,
  default_payment_terms INTEGER DEFAULT 30,
  late_penalty_rate DECIMAL(5,2) DEFAULT 0,
  legal_text_default TEXT DEFAULT 'TVA non applicable, art. 293B du CGI',
  indemnity_text_default TEXT DEFAULT 'Indemnité forfaitaire de 40€ pour frais de recouvrement',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela: clients
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name TEXT NOT NULL,
  contact_name TEXT,
  address TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  siret TEXT,
  vat_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela: services
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  unit_price DECIMAL(12,2) NOT NULL,
  unit_type TEXT NOT NULL CHECK (unit_type IN ('hora', 'serviço', 'pacote', 'mensal')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela: invoice_sequence (para número sequencial anual transacional)
CREATE TABLE invoice_sequence (
  year INTEGER PRIMARY KEY,
  last_number INTEGER NOT NULL DEFAULT 0
);

-- Função para obter próximo número de fatura (transacional, sem duplicação)
CREATE OR REPLACE FUNCTION get_next_invoice_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  current_year INTEGER;
  next_num INTEGER;
  result TEXT;
BEGIN
  current_year := EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER;

  INSERT INTO invoice_sequence (year, last_number)
  VALUES (current_year, 1)
  ON CONFLICT (year) DO UPDATE SET last_number = invoice_sequence.last_number + 1
  RETURNING (invoice_sequence.last_number) INTO next_num;

  -- Se ON CONFLICT retornou a linha atualizada, precisamos do valor correto
  SELECT last_number INTO next_num FROM invoice_sequence WHERE year = current_year;

  result := current_year::TEXT || '-' || LPAD(next_num::TEXT, 4, '0');
  RETURN result;
END;
$$;

-- Ajuste: a função acima com RETURNING pode não retornar o valor após incremento.
-- Versão corrigida usando SELECT FOR UPDATE:
CREATE OR REPLACE FUNCTION get_next_invoice_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  current_year INTEGER;
  next_num INTEGER;
  result TEXT;
BEGIN
  current_year := EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER;

  INSERT INTO invoice_sequence (year, last_number)
  VALUES (current_year, 0)
  ON CONFLICT (year) DO NOTHING;

  UPDATE invoice_sequence
  SET last_number = last_number + 1
  WHERE year = current_year
  RETURNING last_number INTO next_num;

  result := current_year::TEXT || '-' || LPAD(next_num::TEXT, 4, '0');
  RETURN result;
END;
$$;

-- Tabela: invoices
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number TEXT NOT NULL UNIQUE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue')),
  total_ht DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_tva DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_ttc DECIMAL(12,2) NOT NULL DEFAULT 0,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_invoices_client_id ON invoices(client_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_deleted_at ON invoices(deleted_at);
CREATE INDEX idx_invoices_issue_date ON invoices(issue_date);

-- Tabela: properties (apartamentos)
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  address TEXT,
  normal_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  extra_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_properties_client_id ON properties(client_id);

-- Tabela: invoice_items
CREATE TABLE invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  unit_price DECIMAL(12,2) NOT NULL,
  total DECIMAL(12,2) NOT NULL
);

CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);

-- RLS (Row Level Security)
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_sequence ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- Políticas: usuários autenticados têm acesso total (admin único inicialmente)
CREATE POLICY "Authenticated full access company_settings" ON company_settings
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated full access clients" ON clients
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated full access services" ON services
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated full access invoice_sequence" ON invoice_sequence
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated full access invoices" ON invoices
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated full access invoice_items" ON invoice_items
  FOR ALL USING (auth.role() = 'authenticated');

-- Storage: criar bucket "invoices" no Dashboard Supabase (Storage > New bucket)
-- Nome: invoices | Public: Yes (para que pdf_url seja acessível pour téléchargement)

-- Trigger updated_at para company_settings
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER company_settings_updated_at
  BEFORE UPDATE ON company_settings
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
