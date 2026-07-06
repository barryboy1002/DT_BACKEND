import {query, getClient} from "../db/index.js"

async function getStockMovementsService(businessId, options = {}){
    const limit = options.limit || 100;
    const offset = options.offset || 0;
    const branchId = options.branchId || null;

    try{
        let stockQuery = `
            SELECT 
                sm.movement_id,
                sm.product_id,
                pr.name,
                sm.cause,
                sm.quantity,
                sm.note,
                sm.date_time,
                sm.branch_id
            FROM stock_movements sm
            LEFT JOIN products pr ON sm.product_id = pr.product_id
            WHERE sm.business_id = $1
        `;
        const params = [businessId];
        let idx = 2;
        if (branchId) {
            stockQuery += ` AND sm.branch_id = $${idx++}`;
            params.push(branchId);
        }
        stockQuery += ` ORDER BY sm.date_time DESC LIMIT $${idx++} OFFSET $${idx++}`;
        params.push(limit, offset);

        const results = await query(stockQuery, params);
        return results.rows || [];
    }catch(error){
        throw error;
    }

}

async function getLowStockService(businessId, branchId = null){
    try{
        let lowStockQuery;
        let params;
        if (branchId) {
            lowStockQuery = `
                SELECT COUNT(*) AS low_stock_count
                FROM products p
                LEFT JOIN (
                    SELECT product_id, SUM(quantity) AS quantity 
                    FROM stock_movements 
                    WHERE branch_id = $2 
                    GROUP BY product_id
                ) s ON s.product_id = p.product_id
                WHERE p.business_id = $1
                AND COALESCE(s.quantity, 0) < COALESCE(p.low_stock_threshhold, 0);
            `;
            params = [businessId, branchId];
        } else {
            lowStockQuery = `
                SELECT COUNT(*) AS low_stock_count
                FROM products p
                LEFT JOIN stock s ON s.product_id = p.product_id
                WHERE p.business_id = $1
                AND COALESCE(s.quantity, 0) < COALESCE(p.low_stock_threshhold, 0);
            `;
            params = [businessId];
        }
        const result = await query(lowStockQuery, params);
        return result.rows[0];
    }catch(error){
        throw error;
    }

}
async function getOutOfStockService(businessId, branchId = null){
    try{
        let OutOfStockQuery;
        let params;
        if (branchId) {
            OutOfStockQuery = `
                SELECT COUNT(*) AS out_of_stock
                FROM products p 
                LEFT JOIN (
                    SELECT product_id, SUM(quantity) AS quantity 
                    FROM stock_movements 
                    WHERE branch_id = $2 
                    GROUP BY product_id
                ) s ON s.product_id = p.product_id
                WHERE p.business_id = $1
                AND COALESCE(s.quantity, 0) = 0;
            `;
            params = [businessId, branchId];
        } else {
            OutOfStockQuery = `
                SELECT COUNT(*) AS out_of_stock
                FROM products p 
                LEFT JOIN stock s ON s.product_id = p.product_id
                WHERE p.business_id = $1
                AND COALESCE(s.quantity, 0) = 0;
            `;
            params = [businessId];
        }
        const result = await query(OutOfStockQuery, params);
        return result.rows[0];
    }catch(error){
        throw error;
    }
}

export {
    getStockMovementsService,
    getLowStockService,
    getOutOfStockService
}