import { Router } from "express";

import {
    getDashboardSummaryController
} from "../controllers/dashboardController.js";

const dashboardRouter = Router();

dashboardRouter.get(
    "/summary",
    getDashboardSummaryController
);

export  {dashboardRouter};