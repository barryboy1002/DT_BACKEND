import { query } from "../db/index.js";
import { AppError } from "../errors/AppError.js";

async function getStockMovementsService(businessId, options = {}) {
    if (!businessId) {
        throw new AppError("Business ID is required", 400);
    }

    const limit = Number(options.limit) || 100;
    const offset = Number(options.offset) || 0;

    const stockQuery = `
        SELECT 
            sm.movement_id,
            sm.product_id,
            p.name AS product_name,
            sm.cause,
            sm.quantity,
            sm.note,
            sm.date_time
        FROM stock_movements sm
        LEFT JOIN products p 
            ON p.product_id = sm.product_id
        WHERE sm.business_id = $1
        ORDER BY sm.date_time DESC
        LIMIT $2 OFFSET $3
    `;

    const result = await query(stockQuery, [businessId, limit, offset]);

    return result.rows;
}

async function getLowStockService(businessId) {
    if (!businessId) {
        throw new AppError("Business ID is required", 400);
    }

    const stockQuery = `
        SELECT COUNT(*) AS low_stock_count
        FROM products p
        LEFT JOIN stock s ON s.product_id = p.product_id
        WHERE p.business_id = $1
        AND COALESCE(s.quantity, 0) < COALESCE(p.low_stock_threshold, 0)
    `;

    const result = await query(stockQuery, [businessId]);

    return {
        low_stock_count: Number(result.rows[0].low_stock_count)
    };
}

async function getOutOfStockService(businessId) {
    if (!businessId) {
        throw new AppError("Business ID is required", 400);
    }

    const queryText = `
        SELECT COUNT(*) AS out_of_stock
        FROM products p
        LEFT JOIN stock s ON s.product_id = p.product_id
        WHERE p.business_id = $1
        AND COALESCE(s.quantity, 0) = 0
    `;

    const result = await query(queryText, [businessId]);

    return {
        out_of_stock: Number(result.rows[0].out_of_stock)
    };
}

export {getStockMovementsService,getLowStockService,getOutOfStockService}