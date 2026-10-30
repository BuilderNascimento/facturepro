-- Numeracao de faturas por utilizador (nao global)
-- Preview sem consumir numero + UNIQUE (user_id, invoice_number)

CREATE TABLE IF NOT EXISTS invoice_sequence_user (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  last_number INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, year)
);

ALTER TABLE invoice_sequence_user ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own invoice sequence" ON invoice_sequence_user;
CREATE POLICY "Users manage own invoice sequence" ON invoice_sequence_user
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_invoice_number_key;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'invoices_user_invoice_number_unique'
  ) THEN
    ALTER TABLE invoices
      ADD CONSTRAINT invoices_user_invoice_number_unique UNIQUE (user_id, invoice_number);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION get_next_invoice_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  current_year INTEGER;
  next_num INTEGER;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  current_year := EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER;

  INSERT INTO invoice_sequence_user (user_id, year, last_number)
  VALUES (uid, current_year, 0)
  ON CONFLICT (user_id, year) DO NOTHING;

  UPDATE invoice_sequence_user
  SET last_number = last_number + 1
  WHERE user_id = uid AND year = current_year
  RETURNING last_number INTO next_num;

  RETURN current_year::TEXT || '-' || LPAD(next_num::TEXT, 4, '0');
END;
$$;

CREATE OR REPLACE FUNCTION peek_next_invoice_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  current_year INTEGER;
  last_num INTEGER;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  current_year := EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER;

  SELECT last_number INTO last_num
  FROM invoice_sequence_user
  WHERE user_id = uid AND year = current_year;

  IF last_num IS NULL THEN
    last_num := 0;
  END IF;

  RETURN current_year::TEXT || '-' || LPAD((last_num + 1)::TEXT, 4, '0');
END;
$$;

GRANT EXECUTE ON FUNCTION get_next_invoice_number() TO authenticated;
GRANT EXECUTE ON FUNCTION peek_next_invoice_number() TO authenticated;

INSERT INTO invoice_sequence_user (user_id, year, last_number)
SELECT
  i.user_id,
  COALESCE(
    NULLIF(substring(i.invoice_number from '^(\d{4})-'), '')::INTEGER,
    EXTRACT(YEAR FROM i.issue_date)::INTEGER
  ) AS yr,
  MAX(
    COALESCE(
      NULLIF(substring(i.invoice_number from '-(\d+)$'), '')::INTEGER,
      0
    )
  ) AS max_n
FROM invoices i
WHERE i.user_id IS NOT NULL
  AND i.deleted_at IS NULL
GROUP BY 1, 2
ON CONFLICT (user_id, year) DO UPDATE
SET last_number = GREATEST(invoice_sequence_user.last_number, EXCLUDED.last_number);
