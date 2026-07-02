CREATE FUNCTION prevent_duplicate_barcode()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.barcode IS NOT NULL THEN
        IF EXISTS (SELECT 1 FROM products WHERE barcode = NEW.barcode AND business_id <> NEW.business_id) THEN
            RAISE EXCEPTION 'Duplicate barcode: %', NEW.barcode;
        END IF;
    END IF;     
    RETURN NEW;
END;
$$LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_duplicate_barcode
BEFORE INSERT OR UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION prevent_duplicate_barcode();
