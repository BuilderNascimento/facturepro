-- Execute no Supabase > SQL Editor se o erro RLS em "invoices" continuar.
-- Garante que a coluna user_id existe e que a política de INSERT permite o utilizador logado.

-- 1. Adicionar coluna user_id se não existir
ALTER TABLE invoices
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- 2. Preencher user_id em linhas antigas (opcional: atribuir a um admin ou deixar null)
-- UPDATE invoices SET user_id = 'SEU_USER_ID_AQUI' WHERE user_id IS NULL;

-- 3. Política para INSERT: só permite inserir se user_id = utilizador autenticado
DROP POLICY IF EXISTS "user_invoices_insert" ON invoices;
CREATE POLICY "user_invoices_insert" ON invoices
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 4. Política para SELECT: só ver as próprias faturas
DROP POLICY IF EXISTS "user_invoices_select" ON invoices;
CREATE POLICY "user_invoices_select" ON invoices
  FOR SELECT
  USING (auth.uid() = user_id);

-- 5. Política para UPDATE
DROP POLICY IF EXISTS "user_invoices_update" ON invoices;
CREATE POLICY "user_invoices_update" ON invoices
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 6. Política para DELETE (soft delete)
DROP POLICY IF EXISTS "user_invoices_delete" ON invoices;
CREATE POLICY "user_invoices_delete" ON invoices
  FOR DELETE
  USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════
-- CLIENTS — mesma lógica (user_id + RLS)
-- ═══════════════════════════════════════════════════════════
ALTER TABLE clients ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

DROP POLICY IF EXISTS "user_clients_insert" ON clients;
CREATE POLICY "user_clients_insert" ON clients FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "user_clients_select" ON clients;
CREATE POLICY "user_clients_select" ON clients FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "user_clients_update" ON clients;
CREATE POLICY "user_clients_update" ON clients FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "user_clients_delete" ON clients;
CREATE POLICY "user_clients_delete" ON clients FOR DELETE USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════
-- PROPERTIES e SERVICES — mesma lógica
-- ═══════════════════════════════════════════════════════════
ALTER TABLE properties ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE services ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

DROP POLICY IF EXISTS "user_properties_insert" ON properties;
CREATE POLICY "user_properties_insert" ON properties FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "user_properties_select" ON properties;
CREATE POLICY "user_properties_select" ON properties FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "user_properties_update" ON properties;
CREATE POLICY "user_properties_update" ON properties FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "user_properties_delete" ON properties;
CREATE POLICY "user_properties_delete" ON properties FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_services_insert" ON services;
CREATE POLICY "user_services_insert" ON services FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "user_services_select" ON services;
CREATE POLICY "user_services_select" ON services FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "user_services_update" ON services;
CREATE POLICY "user_services_update" ON services FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "user_services_delete" ON services;
CREATE POLICY "user_services_delete" ON services FOR DELETE USING (auth.uid() = user_id);
