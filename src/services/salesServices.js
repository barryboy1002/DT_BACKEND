import { query, getClient } from "../db/index.js";

async function createSaleService(businessId, items, paymentMethod, customerName = null, branchId = null) {
    const client = await getClient();
    try {
        const receiptNumber = `RCP-${Date.now().toString().slice(-8)}`;
        const saleQueryText = "INSERT INTO sales(business_id,customer_name,payment_method,receipt_number,branch_id) VALUES ($1, $2, $3, $4, $5) RETURNING sale_id, receipt_number";
        await client.query('BEGIN');
        const saleResult = await client.query(saleQueryText, [businessId, customerName, paymentMethod, receiptNumber, branchId]);
        const saleId = saleResult.rows[0].sale_id;
        const savedReceipt = saleResult.rows[0].receipt_number;

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
        return { sale_id: saleId, receipt_number: savedReceipt, items: result.rows };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        if (client && typeof client.release === 'function') client.release();
    }
}


async function listSalesService(businessId, options = {}){
    const page = Number(options.page) || 1;
    const limit = Number(options.limit) || 100;
    const offset = (page - 1) * limit;
    const from = options.from || null;
    const to = options.to || null;
    const payment_method = options.payment_method || null;
    const search = options.search ? options.search.trim() : null;
    const branchId = options.branchId || null;

    // Build where clauses
    const where = ['s.business_id = $1'];
    const params = [businessId];
    let idx = 2;

    if (branchId) {
        where.push(`s.branch_id = $${idx++}`);
        params.push(branchId);
    }

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
    if (search) {
        where.push(`(s.customer_name ILIKE $${idx} OR s.receipt_number ILIKE $${idx})`);
        params.push(`%${search}%`);
        idx++;
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const countQuery = `SELECT COUNT(*)::int AS total FROM sales s ${whereSql}`;
    const countRes = await query(countQuery, params);
    const totalItems = Number(countRes.rows[0]?.total || 0);

    const q = `
      SELECT s.sale_id, s.receipt_number, s.customer_name, s.payment_method, s.date_time,
             s.is_refund, s.refund_of, s.refund_reason,
             COALESCE(SUM(si.quantity * si.unit_price),0) AS total,
             COUNT(si.sale_item_id) AS items_count
      FROM sales s
      LEFT JOIN sale_items si ON si.sale_id = s.sale_id
      ${whereSql}
      GROUP BY s.sale_id, s.receipt_number, s.is_refund, s.refund_of, s.refund_reason
      ORDER BY s.date_time DESC
      LIMIT $${idx++} OFFSET $${idx++}
    `;

    params.push(limit, offset);
    const res = await query(q, params);
    return {
      data: res.rows || [],
      meta: {
        page,
        limit,
        total_items: totalItems,
        total_pages: Math.max(1, Math.ceil(totalItems / limit))
      }
    };
}

async function getSaleService(saleId, businessId, branchId = null){
    let qSale = `SELECT sale_id, receipt_number, customer_name, payment_method, date_time FROM sales WHERE sale_id = $1 AND business_id = $2`;
    const params = [saleId, businessId];
    if (branchId) {
        qSale += ` AND branch_id = $3`;
        params.push(branchId);
    }
    const saleRes = await query(qSale, params);
    if (!saleRes || saleRes.rowCount === 0) {
        const err = new Error('Sale not found'); err.status = 404; throw err;
    }
    const sale = saleRes.rows[0];

    const qItems = `
        SELECT si.sale_item_id, si.product_id, p.name AS product_name, si.quantity, si.unit_price 
        FROM sale_items si 
        LEFT JOIN products p ON p.product_id = si.product_id 
        WHERE si.sale_id = $1
    `;
    const itemsRes = await query(qItems, [saleId]);
    sale.items = itemsRes.rows || [];
    sale.total = sale.items.reduce((s,i)=> s + Number(i.quantity) * Number(i.unit_price), 0);
    return sale;
}

async function createRefundService(businessId, saleId, reason = null, branchId = null) {
    const client = await getClient();
    try {
        await client.query('BEGIN');

        const originalSaleRes = await client.query(
            "SELECT sale_id, customer_name, payment_method, branch_id FROM sales WHERE sale_id = $1 AND business_id = $2",
            [saleId, businessId]
        );

        if (originalSaleRes.rowCount === 0) {
            const err = new Error('Sale not found'); err.status = 404; throw err;
        }

        const existingRefundRes = await client.query(
            "SELECT sale_id FROM sales WHERE refund_of = $1 AND business_id = $2",
            [saleId, businessId]
        );

        if (existingRefundRes.rowCount > 0) {
            const err = new Error('This sale has already been refunded'); err.status = 409; throw err;
        }

        const itemsRes = await client.query(
            "SELECT product_id, quantity, unit_price FROM sale_items WHERE sale_id = $1",
            [saleId]
        );

        if (itemsRes.rowCount === 0) {
            const err = new Error('Sale has no items to refund'); err.status = 400; throw err;
        }

        const receiptNumber = `RFD-${Date.now().toString().slice(-8)}`;
        const refundSaleRes = await client.query(
            `INSERT INTO sales (business_id, customer_name, payment_method, receipt_number, branch_id, is_refund, refund_of, refund_reason, refunded_at)
             VALUES ($1, $2, $3, $4, $5, TRUE, $6, $7, NOW())
             RETURNING sale_id, receipt_number`,
            [businessId, originalSaleRes.rows[0].customer_name, originalSaleRes.rows[0].payment_method || 'cash', receiptNumber, branchId || originalSaleRes.rows[0].branch_id, saleId, reason]
        );

        const refundId = refundSaleRes.rows[0].sale_id;
        const values = [];
        const params = [];

        itemsRes.rows.forEach((item, index) => {
            const offset = index * 4;
            values.push(`($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4})`);
            params.push(refundId, item.product_id, -Number(item.quantity), Number(item.unit_price));
        });

        await client.query(
            `INSERT INTO sale_items (sale_id, product_id, quantity, unit_price) VALUES ${values.join(', ')}`,
            params
        );

        await client.query('COMMIT');
        return {
            sale_id: refundId,
            receipt_number: refundSaleRes.rows[0].receipt_number,
            refund_of: saleId,
            items: itemsRes.rows
        };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        if (client && typeof client.release === 'function') client.release();
    }
}

export { createSaleService, listSalesService, getSaleService, createRefundService };
