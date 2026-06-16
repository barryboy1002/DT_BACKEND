import { getClient } from "../db/index.js";

async function createProductService(businessId, data) {
    const client = await getClient();
    try {
        await client.query('BEGIN');

        const {
            category_id = null,
            name,
            barcode = null,
            buying_price,
            selling_price,
            brand = null,
            unit = null,
            description = null,
        } = data;

        const queryText = `INSERT INTO products
            (business_id, category_id, name, barcode, buying_price, selling_price, brand, unit, description)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
            RETURNING *`;

        const params = [
            businessId,
            category_id,
            name,
            barcode,
            buying_price,
            selling_price,
            brand,
            unit,
            description,
        ];

        const res = await client.query(queryText, params);

        if (res.rowCount === 1) {
            const created = res.rows[0];
            await client.query('COMMIT');
            return created;
        }

        await client.query('COMMIT');
        return null;
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
}

export { createProductService };