import {
    getDashboardSummaryService
} from "../services/dashboardService.js";

async function getDashboardSummaryController(
    req,
    res,
    next
){
    try{
        const {businessId} =
            req.user;

        const summary =
            await getDashboardSummaryService(
                businessId
            );

        res.status(200).json({
            success: true,
            data: summary
        });

    }catch(error){
        next(error);
    }
}

export {
    getDashboardSummaryController
};