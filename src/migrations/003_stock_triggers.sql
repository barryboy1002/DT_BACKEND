CREATE OR REPLACE FUNCTION prevent_negative_stock()
RETURNs TRIGGER AS $$
DECLARE
	current_stock DECIMAL(10,2)
BEGIN
	SELECT COALESCE(SUM(quantity),0)
	INTO current_stock
	FROM stock_movements
	WHERE product_id = NEW.product_id;
	
	IF current_stock + NEW.quantity < 0 THEN
		RAISE EXCEPTION 'Insufficient  stock for product %', NEW.product_id;
	END IF;
	
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER	trg_prevent_negative_stock
BEFORE INSERT ON stock_movements
FOR EACH ROW
WHEN (NEW.quantity < 0)
EXECUTE FUNCTION prevent_negative_stock();
	

CREATE OR REPLACE FUNCTION prevent_stock_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'stock_movements is an immutable ledger and cannot be modified';
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER  trg_prevent_update_stock_movements
BEFORE UPDATE ON stock_movements
FOR EACH ROW
EXECUTE FUNCTION prevent_stock_modification();

CREATE TRIGGER trg_prevent_delete_stock_movements
BEFORE DELETE ON stock_movements
FOR EACH ROW
EXECUTE FUNCTION prevent_stock_modification();