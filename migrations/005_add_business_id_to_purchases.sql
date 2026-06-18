-- Add business_id to purchases and populate from suppliers
BEGIN;

ALTER TABLE purchases ADD COLUMN IF NOT EXISTS business_id uuid;

-- Populate business_id from suppliers table (assumes suppliers.supplier_id and suppliers.business_id exist)
UPDATE purchases p
SET business_id = s.business_id
FROM suppliers s
WHERE p.supplier_id = s.supplier_id
  AND p.business_id IS NULL;

-- Ensure column has values for all rows before setting NOT NULL
-- If some purchases have no matching supplier, address them manually before uncommenting the next line
ALTER TABLE purchases ALTER COLUMN business_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_purchases_business_id ON purchases(business_id);

COMMIT;

-- NOTE: If your migrations are run by a tool, rename/move this file accordingly.
