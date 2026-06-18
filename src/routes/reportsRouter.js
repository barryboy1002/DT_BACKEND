import { Router } from 'express';
import { authenticate } from "../middleware/authenticate.js";
import { salesSummaryController, revenueByPeriodController, transactionsCountController } from "../controllers/reportsController.js";

const reportsRouter = Router();

reportsRouter.get('/sales-summary', authenticate, salesSummaryController);
reportsRouter.get('/daily-revenue', authenticate, revenueByPeriodController);
reportsRouter.get('/transactions-count', authenticate, transactionsCountController);

export { reportsRouter };
