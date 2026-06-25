import { query,getClient } from "../db/index.js";
import { AppError } from "../errors/AppError.js";
import {NotFoundError} from "../errors/NotFoundError.js";

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
            low_stock_threshhold = 10
        } = data;

        if (!name || buying_price == null || selling_price == null) {
            throw new AppError("Missing required product fields", 400);
        }

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

        if (res.rowCount !== 1) {
            throw new AppError("Failed to create product", 500);
        }

        await client.query('COMMIT');
        return res.rows[0];
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
} 
async function getProductsService(businessId, options = {}){

    const limit = Number(options.limit) || 100;
    const offset = Number(options.offset) || 0;

    const queryText = `
        WITH page AS (
    SELECT
        p.product_id,
        p.name,
        p.category_id,
        p.buying_price,
        p.selling_price,
        p.low_stock_threshhold
    FROM products p
    WHERE p.business_id = $1
    ORDER BY p.name
    LIMIT $2 OFFSET $3
    )

    SELECT
        p.product_id,
        p.name,
        p.category_id,
        c.name AS category_name,
        p.buying_price,
        p.selling_price,
        p.low_stock_threshhold,
        COALESCE(s.quantity,0) AS stock_quantity
    FROM page p
    LEFT JOIN stock s
        ON s.product_id = p.product_id
    LEFT JOIN categories c
        ON c.category_id = p.category_id
    `;

    const result = await query(queryText, [businessId, limit, offset]);
    return (result && result.rowCount > 0) ? result.rows : [];

   
}

async function getProductService(productID,businessId){

    const queryText = "SELECT * FROM products WHERE (business_id=$1 AND product_id=$2)"
    const result = await query(queryText,[businessId,productID]);
    if(!result.rowCount){
        throw new NotFoundError("Product Not found!");
    }

    return result.rows[0];

   
}


async function updateProductService(productID, businessId, data) {
    try {
        // Only allow certain fields to be updated
        const allowed = ['name','category_id','barcode','buying_price','selling_price','brand','unit','description','low_stock_threshhold'];
        const keys = Object.keys(data).filter(k => allowed.includes(k));

        if (keys.length === 0) {
            const err = 'No updatable fields provided';
            const statusCode = 400;
            throw new AppError(err,statusCode);
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

        const err = 'Product not found';
        throw new NotFoundError(err);

    } catch (error) {
        throw error;
    }
}
    


async function deleteProductsService(businessId, ids) {
    if (!Array.isArray(ids) || ids.length === 0) {
        const errMessage = 'No product ids provided';
        const statusCode = 400;
        throw new AppError(errMessage,statusCode);
    }

    // ensure all ids are numbers
    const parsed = ids.map(i => Number(i)).filter(n => Number.isInteger(n));
    if (parsed.length === 0) {
        const errMessage = 'Invalid product ids';
        const statusCode = 400;
        throw new AppError(errMessage,statusCode)
    }

    const client = await getClient();
    try {
        await client.query('BEGIN');

        const queryText = 'DELETE FROM products WHERE business_id = $1 AND product_id = ANY($2::int[]) RETURNING product_id';
        const res = await client.query(queryText, [businessId, parsed]);

        await client.query('COMMIT');
        if (res.rowCount === 0) {
            throw new NotFoundError("No matching products found");
        }

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
// figure out how to implement search later