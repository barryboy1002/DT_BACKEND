async function productDistributionService(
    businessId,
    from,
    to
){
    const q = `
        SELECT
            p.name,
            SUM(si.quantity)::int AS quantity
        FROM sales s
        JOIN sale_items si
            ON si.sale_id = s.sale_id
        JOIN products p
            ON p.product_id = si.product_id
        WHERE s.business_id = $1
        AND s.date_time >= $2
        AND s.date_time < $3
        GROUP BY p.name
        ORDER BY quantity DESC
        LIMIT 10
    `;

    const result = await query(
        q,
        [businessId, from, to]
    );

    return result.rows;
}
async function getDashboardSummaryService(businessId) {
    const today = new Date();

    const from = new Date(today);
    from.setHours(0,0,0,0);

    const to = new Date(today);
    to.setHours(23,59,59,999);

    const [
        revenue,
        lowStock,
        outOfStock
    ] = await Promise.all([
        salesSummaryService(
            businessId,
            from,
            to
        ),
        getLowStockService(
            businessId
        ),
        getOutOfStockService(
            businessId
        )
    ]);

    return {
        todayRevenue: revenue.revenue,
        lowStock: lowStock.low_stock_count,
        outOfStock: outOfStock.out_of_stock
    };
}

export {
    productDistributionService,
    getDashboardSummaryService
};