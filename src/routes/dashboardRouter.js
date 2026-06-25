import { Router } from "express";

import {
    getDashboardSummaryController
} from "../controllers/dashboardController.js";
import { authenticate } from "../middleware/authenticate.js";

const dashboardRouter = Router();

dashboardRouter.get(
    "/summary",authenticate,
    getDashboardSummaryController
);

export  {dashboardRouter};