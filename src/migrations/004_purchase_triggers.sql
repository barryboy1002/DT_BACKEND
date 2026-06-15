CREATE OR REPLACE FUNCTION record_purchases()
RETURNS TRIGGER AS $$
BEGIN
	INSERT INTO stock_movements(
		product_id,
		cause,
		quantity,
		note
	)
	VALUES(
		NEW.product_id,
		'purchase',
		NEW.quantity,
		'Generated from purchase_items'
	);
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_record_purchase
AFTER INSERT ON purchase_items
FOR EACH ROW
EXECUTE FUNCTION record_purchases();

