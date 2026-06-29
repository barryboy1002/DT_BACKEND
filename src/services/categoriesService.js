import { query, getClient } from "../db/index.js";
import { AppError } from "../errors/AppError.js";
import { NotFoundError } from "../errors/NotFoundError.js";

async function listCategoriesService(businessId) {
  const listCategoriesQuery = "SELECT category_id, name FROM categories WHERE business_id = $1 ORDER BY name";

  const res = await query(listCategoriesQuery, [businessId]);

  return res.rows || [];
}

async function createCategoryService(businessId, name) {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const createCategoryQuery = `INSERT INTO categories (business_id, name) VALUES ($1,$2) RETURNING *`;
    const res = await client.query(createCategoryQuery, [businessId, name]);
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
  const renameCategoryQuery = `UPDATE categories SET name = $1 WHERE business_id = $2 AND category_id = $3 RETURNING *`;
  const res = await query(renameCategoryQuery, [name, businessId, categoryId]);
  if (res && res.rowCount > 0) return res.rows[0];
  throw new NotFoundError('Category not found');
}

async function deleteCategoryService(categoryId, businessId) {
  // Prevent deletion if products exist for this category
  const dependencyQuery = `SELECT 1 FROM products WHERE category_id = $1 LIMIT 1`;
  const dep = await query(dependencyQuery, [categoryId]);
  if (dep && dep.rowCount > 0) {
    throw  new AppError("Category has products and cannot be deleted",400);
  }

  const deleteCategoryQuery = `DELETE FROM categories WHERE business_id = $1 AND category_id = $2 RETURNING category_id`;
  const res = await query(deleteCategoryQuery, [businessId, categoryId]);
  if (res && res.rowCount > 0) return res.rows[0].category_id;
  throw new NotFoundError('Category not found');
}

export { listCategoriesService, createCategoryService, renameCategoryService, deleteCategoryService };
