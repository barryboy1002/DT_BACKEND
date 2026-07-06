-- Migration: 008_update_triggers_for_branches.sql

-- Update record_sale trigger function
CREATE OR REPLACE FUNCTION record_sale()
RETURNS TRIGGER AS $$
BEGIN
	INSERT INTO stock_movements(
		product_id,
		business_id,
		cause,
		quantity,
		note,
		branch_id
	)
	VALUES(
		NEW.product_id,
		(SELECT business_id FROM sales WHERE sale_id = NEW.sale_id),
		'sale',
		-NEW.quantity,
		'Generated from sale_items',
		(SELECT branch_id FROM sales WHERE sale_id = NEW.sale_id)
	);
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update record_purchases trigger function
CREATE OR REPLACE FUNCTION record_purchases()
RETURNS TRIGGER AS $$
DECLARE
	v_business_id UUID;
	v_branch_id UUID;
BEGIN
	-- Get business_id and branch_id from the purchases table
	SELECT business_id, branch_id INTO v_business_id, v_branch_id
	FROM purchases
	WHERE purchases_id = NEW.purchase_id;

	INSERT INTO stock_movements(
		product_id,
		business_id,
		cause,
		quantity,
		note,
		branch_id
	)
	VALUES(
		NEW.product_id,
		v_business_id,
		'purchase',
		NEW.quantity,
		'Generated from purchase_items',
		v_branch_id
	);
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;
