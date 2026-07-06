import { Router } from 'express';
import { authenticate } from "../middleware/authenticate.js";
import { salesSummaryController, revenueByPeriodController, transactionsCountController , getProductDistributionController,getSalesTrendController} from "../controllers/reportsController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";

const reportsRouter = Router();

reportsRouter.get('/sales-summary', authenticate, authorize(["owner"]), salesSummaryController);
reportsRouter.get('/daily-revenue', authenticate, authorize(["owner"]), revenueByPeriodController);
reportsRouter.get('/transactions-count', authenticate, authorize(["owner"]), transactionsCountController);
reportsRouter.get("/product-distribution",authenticate, authorize(["owner"]), getProductDistributionController);
reportsRouter.get("/sales-trend",authenticate, authorize(["owner"]), getSalesTrendController);

export { reportsRouter };
