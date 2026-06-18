import { salesSummaryService, revenueByPeriodService, transactionsCountService } from "../services/reportsService.js";

async function salesSummaryController(req,res,next){
  const businessId = req.user?.businessId;
  const from = req.query.from || new Date().toISOString();
  const to = req.query.to || new Date().toISOString();
  try{
    const data = await salesSummaryService(businessId, from, to);
    res.json({ success:true, data });
  }catch(e){ next(e); }
}

async function revenueByPeriodController(req,res,next){
  const businessId = req.user?.businessId;
  const from = req.query.from;
  const to = req.query.to;
  const interval = req.query.interval || 'day';
  try{
    const data = await revenueByPeriodService(businessId, from, to, interval);
    res.json({ success:true, data });
  }catch(e){ next(e); }
}

async function transactionsCountController(req,res,next){
  const businessId = req.user?.businessId;
  const date = req.query.date || new Date().toISOString();
  try{
    const data = await transactionsCountService(businessId, date);
    res.json({ success:true, data });
  }catch(e){ next(e); }
}

export { salesSummaryController, revenueByPeriodController, transactionsCountController };
