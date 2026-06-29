import {query, getClient} from "../db/index.js"

async function getStockMovementsService(businessId, options = {}){
    const limit = options.limit || 100;
    const offset = options.offset || 0;

    try{
        const stockQuery = `
            SELECT 
                sm.movement_id,
                sm.product_id,
                pr.name,
                sm.cause,
                sm.quantity,
                sm.note,
                sm.date_time
            FROM stock_movements sm
            LEFT JOIN products pr ON sm.product_id = pr.product_id
            WHERE sm.business_id = $1
            ORDER BY sm.date_time DESC
            LIMIT $2 OFFSET $3
        `
        const params = [businessId,limit,offset];

        const results = await query(stockQuery,params);
        return (results||results.rowCount > 0) ? results.rows    : [];
    }catch(error){
        throw error;
    }

}

async function getLowStockService(businessId){
    try{
        const lowStockQuery = `SELECT COUNT(*) AS low_stock_count
                        FROM products p
                        LEFT JOIN stock s ON s.product_id = p.product_id
                        WHERE p.business_id = $1
                        AND COALESCE(s.quantity, 0) < COALESCE(p.low_stock_threshhold, 0);`
        const result = await query(lowStockQuery, [businessId]);
        return (result||result.rowCount > 0) ? result.rows[0]: [];
    }catch(error){
        throw error;
    }

}
async function getOutOfStockService(businessId){
    console.log("BUSINESS ID:", businessId);
    try{
        const OutOfStockQuery = `SELECT COUNT(*) AS out_of_stock
                 FROM products p 
                 LEFT JOIN stock s ON s.product_id = p.product_id
                 WHERE p.business_id = $1
                 AND COALESCE(s.quantity,0) = 0`
        const result = await query(OutOfStockQuery, [businessId]);
        return (result||result.rowCount > 0) ? result.rows[0]: [];
    }catch(error){
        throw error;
    }
}

export {getStockMovementsService,getLowStockService,getOutOfStockService}