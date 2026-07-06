import { query } from "../db/index.js";
import { AppError } from "../errors/AppError.js";

async function createBranchService(businessId, data) {
    const { name, location, phone } = data;
    if (!name) {
        throw new AppError("Branch name is required", 400);
    }
    const result = await query(
        `INSERT INTO branches (business_id, name, location, phone)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [businessId, name, location, phone]
    );
    return result.rows[0];
}

async function listBranchesService(businessId) {
    const result = await query(
        `SELECT * FROM branches WHERE business_id = $1 ORDER BY created_at DESC`,
        [businessId]
    );
    return result.rows;
}

async function getBranchService(businessId, branchId) {
    const result = await query(
        `SELECT * FROM branches WHERE business_id = $1 AND branch_id = $2`,
        [businessId, branchId]
    );
    if (result.rowCount === 0) {
        throw new AppError("Branch not found", 404);
    }
    return result.rows[0];
}

async function updateBranchService(businessId, branchId, data) {
    const { name, location, phone } = data;
    if (!name) {
        throw new AppError("Branch name is required", 400);
    }
    const result = await query(
        `UPDATE branches
         SET name = $1, location = $2, phone = $3
         WHERE business_id = $4 AND branch_id = $5
         RETURNING *`,
        [name, location, phone, businessId, branchId]
    );
    if (result.rowCount === 0) {
        throw new AppError("Branch not found", 404);
    }
    return result.rows[0];
}

async function deleteBranchService(businessId, branchId) {
    const result = await query(
        `DELETE FROM branches WHERE business_id = $1 AND branch_id = $2 RETURNING *`,
        [businessId, branchId]
    );
    if (result.rowCount === 0) {
        throw new AppError("Branch not found", 404);
    }
    return result.rows[0];
}

export {
    createBranchService,
    listBranchesService,
    getBranchService,
    updateBranchService,
    deleteBranchService
};
