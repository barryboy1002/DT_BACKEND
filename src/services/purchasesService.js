import { query, getClient } from "../db/index.js";

async function listPurchasesService(businessId, options = {}){
  const { from, to, supplier_id, page = 1, limit = 20 } = options;
  const offset = (page - 1) * limit;

  const where = ['p.business_id = $1'];
  const params = [businessId];
  let idx = 2;

  if (from) { where.push(`p.date_ordered >= $${idx++}`); params.push(from); }
  if (to) { where.push(`p.date_arrived <= $${idx++}`); params.push(to); }
  if (supplier_id) { where.push(`p.supplier_id = $${idx++}`); params.push(supplier_id); }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const q = `
    SELECT p.purchases_id, p.supplier_id, s.name as supplier_name, p.payment_method, p.date_ordered, p.date_arrived,
           COALESCE(SUM(pi.quantity * pi.unit_price),0) AS total, COUNT(pi.purchase_item_id) AS items_count
    FROM purchases p
    LEFT JOIN purchase_items pi ON pi.purchase_id = p.purchases_id
    LEFT JOIN suppliers s ON s.supplier_id = p.supplier_id
    ${whereSql}
    GROUP BY p.purchases_id, p.supplier_id, s.name, p.payment_method, p.date_ordered, p.date_arrived
    ORDER BY p.date_ordered DESC
    LIMIT $${idx++} OFFSET $${idx++}
  `;

  params.push(limit, offset);
  const res = await query(q, params);
  return { data: res.rows || [], meta: { page, limit } };
}

async function getPurchaseService(purchaseId, businessId){
  const q = `SELECT p.purchases_id, p.supplier_id, s.name as supplier_name, s.contact as supplier_contact, p.payment_method, p.date_ordered, p.date_arrived FROM purchases p LEFT JOIN suppliers s ON s.supplier_id = p.supplier_id WHERE p.purchases_id = $1 AND p.business_id = $2`;
  const r = await query(q, [purchaseId, businessId]);
  if (!r || r.rowCount === 0){ const err = new Error('Purchase not found'); err.status = 404; throw err; }
  const purchase = r.rows[0];
  const items = await query('SELECT purchase_item_id, product_id, quantity, unit_price FROM purchase_items WHERE purchase_id = $1',[purchaseId]);
  purchase.items = items.rows || [];
  purchase.total = purchase.items.reduce((s,i)=> s + Number(i.quantity) * Number(i.unit_price),0);
  return purchase;
}

async function getPurchasesByProductService(productId, businessId, options = {}){
  const { page=1, limit=20 } = options;
  const offset = (page-1)*limit;
  const q = `
    SELECT p.purchases_id, p.supplier_id, p.date_ordered, pi.quantity, pi.unit_price
    FROM purchase_items pi
    JOIN purchases p ON p.purchases_id = pi.purchase_id
    WHERE pi.product_id = $1 AND p.business_id = $2
    ORDER BY p.date_ordered DESC
    LIMIT $3 OFFSET $4
  `;
  const res = await query(q, [productId, businessId, limit, offset]);
  return { data: res.rows || [], meta: { page, limit } };
}

async function createPurchaseService(businessId, supplier_id, items, payment_method, date_arrived=null){
  const client = await getClient();
  try{
    await client.query('BEGIN');
    const r = await client.query('INSERT INTO purchases (supplier_id, business_id, payment_method, date_arrived) VALUES ($1,$2,$3,$4) RETURNING purchases_id',[supplier_id,businessId,payment_method,date_arrived]);
    const purchaseId = r.rows[0].purchases_id;

    const values = [];
    const params = [];
    items.forEach((it, i)=>{
      const off = i*4;
      values.push(`($${off+1},$${off+2},$${off+3},$${off+4})`);
      params.push(purchaseId, it.product_id, it.quantity, it.unit_price);
    });
    const q = `INSERT INTO purchase_items (purchase_id, product_id, quantity, unit_price) VALUES ${values.join(', ')} RETURNING *`;
    const ins = await client.query(q, params);

    await client.query('COMMIT');
    return { purchase_id: purchaseId, items: ins.rows };
  }catch(e){
    await client.query('ROLLBACK');
    throw e;
  }finally{ if (client && typeof client.release === 'function') client.release(); }
}

export { listPurchasesService, getPurchaseService, getPurchasesByProductService, createPurchaseService };
