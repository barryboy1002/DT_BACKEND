import {
    getLowStockService,
    getOutOfStockService
} from "./stocksService.js";

import {
    salesSummaryService
} from "./reportsService.js";


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
    getDashboardSummaryService
};