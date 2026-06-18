import { query, getClient } from "../db/index.js";

async function createSaleService(businessId, items, paymentMethod, customerName = null) {
    const client = await getClient();
    try {
        const saleQueryText = "INSERT INTO sales(business_id,customer_name,payment_method) VALUES ($1, $2, $3) RETURNING sale_id";
        await client.query('BEGIN');
        const saleResult = await client.query(saleQueryText, [businessId, customerName, paymentMethod]);
        const saleId = saleResult.rows[0].sale_id;

        // Build bulk insert for sale_items
        const values = [];
        const params = [];
        items.forEach((item, index) => {
            const offset = index * 4;
            values.push(`($${offset + 1 + 0}, $${offset + 2 + 0}, $${offset + 3 + 0}, $${offset + 4 + 0})`);
            params.push(saleId, item.product_id || item.productID, item.quantity, item.unit_price);
        });

        const saleItemsQuery = `INSERT INTO sale_items(sale_id, product_id, quantity, unit_price) VALUES ${values.join(', ')} RETURNING *`;
        const result = await client.query(saleItemsQuery, params);


        await client.query('COMMIT');
        return { sale_id: saleId, items: result.rows };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        if (client && typeof client.release === 'function') client.release();
    }
}


async function listSalesService(businessId, options = {}){
    const page = Number(options.page) || 1;
    const limit = Number(options.limit) || 20;
    const offset = (page - 1) * limit;
    const from = options.from || null;
    const to = options.to || null;
    const payment_method = options.payment_method || null;

    // Build where clauses
    const where = ['s.business_id = $1'];
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
    if (payment_method) {
        where.push(`s.payment_method = $${idx++}`);
        params.push(payment_method);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const q = `
      SELECT s.sale_id, s.customer_name, s.payment_method, s.date_time,
             COALESCE(SUM(si.quantity * si.unit_price),0) AS total,
             COUNT(si.sale_item_id) AS items_count
      FROM sales s
      LEFT JOIN sale_items si ON si.sale_id = s.sale_id
      ${whereSql}
      GROUP BY s.sale_id
      ORDER BY s.date_time DESC
      LIMIT $${idx++} OFFSET $${idx++}
    `;

    params.push(limit, offset);
    const res = await query(q, params);
    return {
      data: res.rows || [],
      meta: { page, limit }
    };
}

async function getSaleService(saleId, businessId){
    const qSale = `SELECT sale_id, customer_name, payment_method, date_time FROM sales WHERE sale_id = $1 AND business_id = $2`;
    const saleRes = await query(qSale, [saleId, businessId]);
    if (!saleRes || saleRes.rowCount === 0) {
        const err = new Error('Sale not found'); err.status = 404; throw err;
    }
    const sale = saleRes.rows[0];

    const qItems = `SELECT sale_item_id, product_id, quantity, unit_price FROM sale_items WHERE sale_id = $1`;
    const itemsRes = await query(qItems, [saleId]);
    sale.items = itemsRes.rows || [];
    sale.total = sale.items.reduce((s,i)=> s + Number(i.quantity) * Number(i.unit_price), 0);
    return sale;
}

export { createSaleService, listSalesService, getSaleService };