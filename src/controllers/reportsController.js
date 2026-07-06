import { salesSummaryService, revenueByPeriodService, transactionsCountService ,productDistributionService} from "../services/reportsService.js";

async function salesSummaryController(req,res,next){
  const {businessId, branchId} = req.user;
  const activeBranchId = branchId || req.query.branchId || null;
  const from = req.query.from || new Date().toISOString();
  const to = req.query.to || new Date().toISOString();
  try{
    const data = await salesSummaryService(businessId, from, to, activeBranchId);
    res.json({ success:true, data });
  }catch(e){ next(e); }
}

async function revenueByPeriodController(req,res,next){
  const {businessId, branchId} = req.user;
  const activeBranchId = branchId || req.query.branchId || null;
  const from = req.query.from;
  const to = req.query.to;
  const interval = req.query.interval || 'day';
  try{
    const data = await revenueByPeriodService(businessId, from, to, interval, activeBranchId);
    res.json({ success:true, data });
  }catch(e){ next(e); }
}

async function transactionsCountController(req,res,next){
  const {businessId, branchId} = req.user;
  const activeBranchId = branchId || req.query.branchId || null;
  const date = req.query.date || new Date().toISOString();
  try{
    const data = await transactionsCountService(businessId, date, activeBranchId);
    res.json({ success:true, data });
  }catch(e){ next(e); }
}

async function getProductDistributionController(
    req,
    res,
    next
){
    try{
        const { businessId, branchId } = req.user;
        const activeBranchId = branchId || req.query.branchId || null;

        const period =
            req.query.period || "monthly";

        let from;
        let to = new Date();

        switch(period){

            case "weekly":
                from = new Date();
                from.setDate(
                    from.getDate() - 7
                );
                break;

            case "yearly":
                from = new Date();
                from.setFullYear(
                    from.getFullYear() - 1
                );
                break;

            default:
                from = new Date();
                from.setMonth(
                    from.getMonth() - 1
                );
        }

        const data =
            await productDistributionService(
                businessId,
                from,
                to,
                activeBranchId
            );

        res.status(200).json({
            success:true,
            data
        });

    }catch(error){
        next(error);
    }
}

async function getSalesTrendController(
    req,
    res,
    next
){
    try{
        const { businessId, branchId } = req.user;
        const activeBranchId = branchId || req.query.branchId || null;

        const period =
            req.query.period || "monthly";

        let from;
        let to = new Date();
        let interval;

        switch(period){

            case "weekly":
                from = new Date();
                from.setDate(
                    from.getDate() - 7
                );
                interval = "day";
                break;

            case "yearly":
                from = new Date();
                from.setFullYear(
                    from.getFullYear() - 1
                );
                interval = "month";
                break;

            default:
                from = new Date();
                from.setMonth(
                    from.getMonth() - 1
                );
                interval = "week";
        }

        const data =
            await revenueByPeriodService(
                businessId,
                from,
                to,
                interval,
                activeBranchId
            );

        res.status(200).json({
            success:true,
            data
        });

    }catch(error){
        next(error);
    }
}

export { salesSummaryController, revenueByPeriodController, transactionsCountController, getProductDistributionController, getSalesTrendController };
