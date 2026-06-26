-- Function to record stock movement when a sale item is inserted
CREATE OR REPLACE FUNCTION record_sale()
RETURNS TRIGGER AS $$
BEGIN
	INSERT INTO stock_movements(
		product_id,
		business_id,
		cause,
		quantity,
		note
	)
	VALUES(
		NEW.product_id,
		(SELECT business_id FROM sales WHERE sale_id = NEW.sale_id),
		'sale',
		-NEW.quantity,
		'Generated from sale_items'
	);
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically record stock movement on sale
CREATE TRIGGER trg_record_sale
AFTER INSERT ON sale_items
FOR EACH ROW
EXECUTE FUNCTION record_sale();