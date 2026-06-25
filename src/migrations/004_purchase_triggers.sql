CREATE OR REPLACE FUNCTION record_purchases()
RETURNS TRIGGER AS $$
DECLARE
	v_business_id UUID;
BEGIN
	-- Get business_id from the purchases table
	SELECT business_id INTO v_business_id
	FROM purchases
	WHERE purchases_id = NEW.purchase_id;

	INSERT INTO stock_movements(
		product_id,
		business_id,
		cause,
		quantity,
		note
	)
	VALUES(
		NEW.product_id,
		v_business_id,
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

