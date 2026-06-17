import { query, getClient } from "../db/index.js";

async function listCategoriesService(businessId) {
  const q = "SELECT category_id, name FROM categories WHERE business_id = $1 ORDER BY name";
  const res = await query(q, [businessId]);
  return res.rows || [];
}

async function createCategoryService(businessId, name) {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const q = `INSERT INTO categories (business_id, name) VALUES ($1,$2) RETURNING *`;
    const res = await client.query(q, [businessId, name]);
    await client.query('COMMIT');
    return res.rows[0];
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

async function renameCategoryService(categoryId, businessId, name) {
  const q = `UPDATE categories SET name = $1 WHERE business_id = $2 AND category_id = $3 RETURNING *`;
  const res = await query(q, [name, businessId, categoryId]);
  if (res && res.rowCount > 0) return res.rows[0];
  const err = new Error('Category not found');
  err.status = 404;
  throw err;
}

async function deleteCategoryService(categoryId, businessId) {
  // Prevent deletion if products exist for this category
  const depQ = `SELECT 1 FROM products WHERE category_id = $1 LIMIT 1`;
  const dep = await query(depQ, [categoryId]);
  if (dep && dep.rowCount > 0) {
    const err = new Error('Category has products and cannot be deleted');
    err.status = 400;
    throw err;
  }

  const q = `DELETE FROM categories WHERE business_id = $1 AND category_id = $2 RETURNING category_id`;
  const res = await query(q, [businessId, categoryId]);
  if (res && res.rowCount > 0) return res.rows[0].category_id;
  const err = new Error('Category not found');
  err.status = 404;
  throw err;
}

export { listCategoriesService, createCategoryService, renameCategoryService, deleteCategoryService };
