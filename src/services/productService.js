import { query,getClient } from "../db/index.js";

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
//need to support pagination and figure out how to get 
async function getProductsService(businessId, options = {}){
    try{
        const limit = Number(options.limit) || 100;
        const offset = Number(options.offset) || 0;

        const queryText = `
            WITH page AS (
                SELECT product_id, name, category_id, buying_price, selling_price
                FROM products
                WHERE business_id = $1
                ORDER BY name
                LIMIT $2 OFFSET $3
            )
            SELECT p.product_id, p.name, p.category_id, p.buying_price, p.selling_price,
                   COALESCE(s.quantity, 0) AS stock_quantity
            FROM page p
            LEFT JOIN stock s ON p.product_id = s.product_id
        `;

        const result = await query(queryText, [businessId, limit, offset]);
        return (result && result.rowCount > 0) ? result.rows : [];

    }catch(error){
        throw(error);
    }
}

async function getProductService(productID,businessId){
    try{
        const queryText = "SELECT * FROM products WHERE (business_id=$1 AND product_id=$2)"
        const result = await query(queryText,[businessId,productID]);
        return (result && result.rowCount > 0) ? result.rows[0] : [];

    }catch(error){
        throw(error);
    }
}


async function updateProductService(productID, businessId, data) {
    try {
        // Only allow certain fields to be updated
        const allowed = ['name','category_id','barcode','buying_price','selling_price','brand','unit','description'];
        const keys = Object.keys(data).filter(k => allowed.includes(k));

        if (keys.length === 0) {
            const err = new Error('No updatable fields provided');
            err.status = 400;
            throw err;
        }

        const setClauses = keys.map((k, i) => `${k} = $${i+1}`).join(', ');
        const params = keys.map(k => data[k]);
        // businessId and productID are the last two params
        params.push(businessId, productID);

        const businessIdx = keys.length + 1;
        const productIdx = keys.length + 2;

        const queryText = `UPDATE products SET ${setClauses} WHERE business_id = $${businessIdx} AND product_id = $${productIdx} RETURNING *`;

        const result = await query(queryText, params);

        if (result && result.rowCount > 0) {
            return result.rows[0];
        }

        const err = new Error('Product not found');
        err.status = 404;
        throw err;

    } catch (error) {
        throw error;
    }
}
    


async function deleteProductsService(businessId, ids) {
    if (!Array.isArray(ids) || ids.length === 0) {
        const err = new Error('No product ids provided');
        err.status = 400;
        throw err;
    }

    // ensure all ids are numbers
    const parsed = ids.map(i => Number(i)).filter(n => Number.isInteger(n));
    if (parsed.length === 0) {
        const err = new Error('Invalid product ids');
        err.status = 400;
        throw err;
    }

    const client = await getClient();
    try {
        await client.query('BEGIN');

        const queryText = 'DELETE FROM products WHERE business_id = $1 AND product_id = ANY($2::int[]) RETURNING product_id';
        const res = await client.query(queryText, [businessId, parsed]);

        await client.query('COMMIT');

        // return array of deleted ids
        return res.rows.map(r => r.product_id);
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

export { createProductService, getProductsService, getProductService, updateProductService, deleteProductsService }