-- Add receipt fields to sales
BEGIN;

ALTER TABLE sales ADD COLUMN IF NOT EXISTS receipt_number varchar(50);
ALTER TABLE sales ADD COLUMN IF NOT EXISTS receipt_url text;

CREATE INDEX IF NOT EXISTS idx_sales_business_date ON sales(business_id, date_time);

COMMIT;
