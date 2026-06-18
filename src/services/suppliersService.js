import { query, getClient } from "../db/index.js";

async function listSuppliersService(businessId, options = {}){
  const { page = 1, limit = 50 } = options;
  const offset = (page - 1) * limit;
  const q = `SELECT supplier_id, name, contact, address FROM suppliers WHERE business_id = $1 ORDER BY name LIMIT $2 OFFSET $3`;
  const res = await query(q, [businessId, limit, offset]);
  return { data: res.rows || [], meta: { page, limit } };
}

async function getSupplierService(supplierId, businessId){
  const q = `SELECT supplier_id, name, contact, address FROM suppliers WHERE supplier_id = $1 AND business_id = $2`;
  const r = await query(q, [supplierId, businessId]);
  if (!r || r.rowCount === 0){ const err = new Error('Supplier not found'); err.status = 404; throw err; }
  return r.rows[0];
}

async function createSupplierService(businessId, payload){
  const { name, contact = null, address = null } = payload;
  const q = `INSERT INTO suppliers (name, contact, address, business_id) VALUES ($1,$2,$3,$4) RETURNING supplier_id, name, contact, address`;
  const r = await query(q, [name, contact, address, businessId]);
  return r.rows[0];
}

async function updateSupplierService(supplierId, businessId, payload){
  const fields = [];
  const params = [];
  let idx = 1;
  if (payload.name !== undefined){ fields.push(`name = $${idx++}`); params.push(payload.name); }
  if (payload.contact !== undefined){ fields.push(`contact = $${idx++}`); params.push(payload.contact); }
  if (payload.address !== undefined){ fields.push(`address = $${idx++}`); params.push(payload.address); }
  if (!fields.length) return getSupplierService(supplierId, businessId);
  params.push(supplierId, businessId);
  const q = `UPDATE suppliers SET ${fields.join(', ')} WHERE supplier_id = $${idx++} AND business_id = $${idx++} RETURNING supplier_id, name, contact, address`;
  const r = await query(q, params);
  if (!r || r.rowCount === 0){ const err = new Error('Supplier not found'); err.status = 404; throw err; }
  return r.rows[0];
}

export { listSuppliersService, getSupplierService, createSupplierService, updateSupplierService };
