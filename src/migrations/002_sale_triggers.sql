CREATE OR REPLACE FUNCTION  record_sale()
RETURN TRIGGER AS $$
BEGIN
	INSERT INTO stock_movements(
		product_id,
		cause,
		quantity,
		note
	)
	VALUES(
		NEW.product_id,
		'sale',
		-NEW.quantity,
		'Generated from sale_items'
	);
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_record_sale
AFTER INSERT ON sale_items
FOR EACH ROW
EXECUTE FUNCTION record_sales();
