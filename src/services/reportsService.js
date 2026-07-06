import { query } from "../db/index.js";

async function salesSummaryService(businessId, from, to, branchId = null){
  let q = `
    SELECT
      COALESCE(SUM(si.quantity * si.unit_price),0)::numeric AS revenue,
      COALESCE(SUM(si.quantity * p.buying_price),0)::numeric AS cost,
      COALESCE(SUM(si.quantity * si.unit_price),0) - COALESCE(SUM(si.quantity * pi.unit_price),0) AS profit,
      COUNT(DISTINCT s.sale_id) AS transactions
    FROM sales s
    JOIN sale_items si ON si.sale_id = s.sale_id
    JOIN products p ON p.product_id = si.product_id
    JOIN purchase_items pi ON pi.product_id = si.product_id
    WHERE s.business_id = $1
      AND s.date_time >= $2 AND s.date_time < $3
  `;
  const params = [businessId, from, to];
  if (branchId) {
      q += ` AND s.branch_id = $4`;
      params.push(branchId);
  }
  const r = await query(q, params);
  return r.rows[0] || { revenue:0, cost:0, profit:0, transactions:0 };
}

async function revenueByPeriodService(businessId, from, to, interval = 'day', branchId = null){
  let q = `
    SELECT date_trunc($4, s.date_time) AS period, SUM(si.quantity * si.unit_price) AS revenue
    FROM sales s JOIN sale_items si ON si.sale_id = s.sale_id
    WHERE s.business_id = $1 AND s.date_time >= $2 AND s.date_time < $3
  `;
  const params = [businessId, from, to, interval];
  if (branchId) {
      q += ` AND s.branch_id = $5`;
      params.push(branchId);
  }
  q += ` GROUP BY period ORDER BY period`;
  const r = await query(q, params);
  return r.rows || [];
}

async function transactionsCountService(businessId, date, branchId = null){
  let q = `SELECT COUNT(*)::int AS transactions FROM sales WHERE business_id = $1 AND date_trunc('day', date_time) = date_trunc('day', $2::timestamp)`;
  const params = [businessId, date];
  if (branchId) {
      q += ` AND branch_id = $3`;
      params.push(branchId);
  }
  const r = await query(q, params);
  return r.rows[0] || { transactions: 0 };
}

async function productDistributionService(
    businessId,
    from,
    to,
    branchId = null
){
    let q = `
        SELECT
            p.name,
            SUM(si.quantity)::numeric AS quantity
        FROM sales s
        JOIN sale_items si
            ON si.sale_id = s.sale_id
        JOIN products p
            ON p.product_id = si.product_id
        WHERE s.business_id = $1
        AND s.date_time >= $2
        AND s.date_time < $3
    `;
    const params = [businessId, from, to];
    if (branchId) {
        q += ` AND s.branch_id = $4`;
        params.push(branchId);
    }
    q += ` GROUP BY p.name ORDER BY quantity DESC LIMIT 10`;

    const result = await query(
        q,
        params
    );

    return result.rows;
}

export { salesSummaryService, revenueByPeriodService, transactionsCountService, productDistributionService };
