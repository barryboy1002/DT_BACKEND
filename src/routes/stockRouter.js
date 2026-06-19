import { Router } from 'express';
import { authenticate } from "../middleware/authenticate.js";
import {getStockMovementsController,getLowStockController,getOutOfStockController} from  "../controllers/stockMovementController.js";


const stocksRouter = Router();

stocksRouter.get("/movements",authenticate,getStockMovementsController);
stocksRouter.get("/lowStock", authenticate, getLowStockController);
stocksRouter.get("/OutOfStock", authenticate,getOutOfStockController)

export { stocksRouter };