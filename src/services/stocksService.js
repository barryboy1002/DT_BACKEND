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
async function getLowStockService(businessId){
    try{
        const stockQuery = `SELECT COUNT(*) AS low_stock_count
                        FROM products p
                        LEFT JOIN stock s ON s.product_id = p.product_id
                        WHERE p.business_id = $1
                        AND COALESCE(s.quantity, 0) < COALESCE(p.low_stock_threshhold, 0);`
        const result = await query(stockQuery, [businessId]);
        return (result||result.rowCount > 0) ? result.rows[0]: [];
    }catch(error){
        throw error;
    }

}
async function getOutOfStockService(businessId){
    try{
        const OutOfStockQuery = `SELECT COUNT(*) AS out_of_stock
                 FROM products p 
                 LEFT JOIN stock s ON s.product_id = p.product_id
                 WHERE business_id = $1
                 AND COALESCE(s.quantity,0) = 0`
        const result = await query(OutOfStockQuery, [businessId]);
        return (result||result.rowCount > 0) ? result.rows[0]: [];
    }catch(error){
        throw error;
    }
}

export {getStockMovementsService,getLowStockService,getOutOfStockService}