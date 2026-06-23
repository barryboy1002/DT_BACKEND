import { Router } from 'express';
import { authenticate } from "../middleware/authenticate.js";
import { listPurchasesController, getPurchaseController, getPurchasesByProductController, createPurchaseController } from "../controllers/purchasesController.js";
import { authorize } from '../middleware/authorize.js';
const purchasesRouter = Router();

// List purchases with optional filters
purchasesRouter.get('/', authenticate, listPurchasesController);

// Get specific purchase
purchasesRouter.get('/:purchaseId', authenticate, getPurchaseController);

// Get purchases containing specific product
purchasesRouter.get('/product/:productId', authenticate, getPurchasesByProductController);

// Create a purchase
purchasesRouter.post('/', authenticate,authorize(["owner", "manager"]), createPurchaseController);

export { purchasesRouter };