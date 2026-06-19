import { query, getClient } from "../db/index.js";
import { AppError } from "../errors/AppError.js";
import { NotFoundError } from "../errors/NotFoundError.js";

async function createSaleService(businessId, items, paymentMethod, customerName = null) {
    if (!businessId) {
        throw new AppError("Business ID is required", 400);
    }
    if (!Array.isArray(items) || items.length === 0) {
        throw new AppError("Sale must contain at least one item", 400);
    }
    const client = await getClient();
    try {
        await client.query("BEGIN");

        const receiptNumber = `RCP-${Date.now().toString().slice(-8)}`;

        const saleQuery = `
            INSERT INTO sales (business_id, customer_name, payment_method, receipt_number)
            VALUES ($1, $2, $3, $4)
            RETURNING sale_id, receipt_number
        `;

        const saleResult = await client.query(saleQuery, [
            businessId,
            customerName,
            paymentMethod,
            receiptNumber
        ]);

        const saleId = saleResult.rows[0].sale_id;
        const receipt = saleResult.rows[0].receipt_number;

        const values = [];
        const params = [];

        items.forEach((item, index) => {
            const base = index * 4;

            values.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4})`);

            params.push(
                saleId,
                item.productId,
                item.quantity,
                item.unitPrice
            );
        });

        const itemsQuery = `
            INSERT INTO sale_items (sale_id, product_id, quantity, unit_price)
            VALUES ${values.join(", ")}
            RETURNING *
        `;

        const itemsResult = await client.query(itemsQuery, params);

        await client.query("COMMIT");

        return {
            saleId,
            receiptNumber: receipt,
            items: itemsResult.rows
        };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}


async function listSalesService(businessId, options = {}) {
    const page = Number(options.page) || 1;
    const limit = Number(options.limit) || 20;
    const offset = (page - 1) * limit;

    const from = options.from || null;
    const to = options.to || null;
    const paymentMethod = options.paymentMethod || null;

    const where = ["s.business_id = $1"];
    const params = [businessId];
    let idx = 2;

    if (from) {
        where.push(`s.date_time >= $${idx++}`);
        params.push(from);
    }

    if (to) {
        where.push(`s.date_time <= $${idx++}`);
        params.push(to);
    }

    if (paymentMethod) {
        where.push(`s.payment_method = $${idx++}`);
        params.push(paymentMethod);
    }

    const whereSql = `WHERE ${where.join(" AND ")}`;

    const queryText = `
        SELECT 
            s.sale_id,
            s.customer_name,
            s.payment_method,
            s.date_time,
            COALESCE(SUM(si.quantity * si.unit_price), 0) AS total,
            COUNT(si.sale_item_id) AS items_count
        FROM sales s
        LEFT JOIN sale_items si ON si.sale_id = s.sale_id
        ${whereSql}
        GROUP BY s.sale_id
        ORDER BY s.date_time DESC
        LIMIT $${idx++} OFFSET $${idx++}
    `;

    params.push(limit, offset);

    const res = await query(queryText, params);

    return {
        data: res.rows,
        meta: { page, limit }
    };
}

async function getSaleService(saleId, businessId) {
    const saleQuery = `
        SELECT sale_id, customer_name, payment_method, date_time
        FROM sales
        WHERE sale_id = $1 AND business_id = $2
    `;

    const saleRes = await query(saleQuery, [saleId, businessId]);

    if (!saleRes.rowCount) {
        throw new NotFoundError("Sale not found");
    }

    const sale = saleRes.rows[0];

    const itemsQuery = `
        SELECT sale_item_id, product_id, quantity, unit_price
        FROM sale_items
        WHERE sale_id = $1
    `;

    const itemsRes = await query(itemsQuery, [saleId]);

    sale.items = itemsRes.rows;

    sale.total = sale.items.reduce(
        (sum, item) => sum + Number(item.quantity) * Number(item.unit_price),
        0
    );

    return sale;
}

export { createSaleService, listSalesService, getSaleService };