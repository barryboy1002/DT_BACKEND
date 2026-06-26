-- Function to prevent negative stock
CREATE OR REPLACE FUNCTION prevent_negative_stock()
RETURNS TRIGGER AS $$
DECLARE
	current_stock DECIMAL(10,2);
BEGIN
	SELECT COALESCE(SUM(quantity),0)
	INTO current_stock
	FROM stock_movements
	WHERE product_id = NEW.product_id;
	
	IF current_stock + NEW.quantity < 0 THEN
		RAISE EXCEPTION 'Insufficient stock for product %', NEW.product_id;
	END IF;
	
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to check stock before negative movements
CREATE TRIGGER trg_prevent_negative_stock
BEFORE INSERT ON stock_movements
FOR EACH ROW
WHEN (NEW.quantity < 0)
EXECUTE FUNCTION prevent_negative_stock();

-- Function to prevent modification of stock movements (immutable ledger)
CREATE OR REPLACE FUNCTION prevent_stock_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'stock_movements is an immutable ledger and cannot be modified';
END;
$$ LANGUAGE plpgsql;

-- Trigger to prevent updates to stock movements
CREATE TRIGGER trg_prevent_update_stock_movements
BEFORE UPDATE ON stock_movements
FOR EACH ROW
EXECUTE FUNCTION prevent_stock_modification();

-- Trigger to prevent deletions from stock movements
CREATE TRIGGER trg_prevent_delete_stock_movements
BEFORE DELETE ON stock_movements
FOR EACH ROW
EXECUTE FUNCTION prevent_stock_modification();
